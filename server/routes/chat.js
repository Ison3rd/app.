const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Get user's rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({
      'members.user': req.user._id
    })
      .populate('members.user', 'username avatar status role')
      .populate('lastMessage')
      .populate('createdBy', 'username avatar')
      .sort({ lastActivity: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new room
router.post('/rooms', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape(),
  body('type').isIn(['direct', 'group', 'project', 'department', 'general']),
  body('isPrivate').optional().isBoolean(),
  body('members').isArray().custom((value) => {
    return value.length > 0 && value.every(id => typeof id === 'string');
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, isPrivate, members, department } = req.body;

    // Validate members exist
    const memberUsers = await User.find({ _id: { $in: members } });
    if (memberUsers.length !== members.length) {
      return res.status(400).json({ error: 'One or more members not found' });
    }

    // Create room members array
    const roomMembers = members.map(memberId => ({
      user: memberId,
      role: memberId === req.user._id.toString() ? 'admin' : 'member'
    }));

    // Add creator if not in members
    if (!members.includes(req.user._id.toString())) {
      roomMembers.push({
        user: req.user._id,
        role: 'admin'
      });
    }

    const room = new Room({
      name,
      description: description || '',
      type,
      isPrivate: isPrivate || false,
      members: roomMembers,
      admins: [req.user._id],
      createdBy: req.user._id,
      department
    });

    await room.save();
    await room.populate('members.user', 'username avatar status role');
    await room.populate('createdBy', 'username avatar');

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get room by ID
router.get('/rooms/:id', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members.user', 'username avatar status role')
      .populate('createdBy', 'username avatar')
      .populate('project', 'title status');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is member
    const isMember = room.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && room.isPrivate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get room messages
router.get('/rooms/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const roomId = req.params.id;

    // Check if user is member
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isMember = room.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && room.isPrivate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ 
      room: roomId,
      isDeleted: false 
    })
      .populate('sender', 'username avatar role')
      .populate('replyTo')
      .populate('mentions', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ 
      room: roomId,
      isDeleted: false 
    });

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add members to room
router.post('/rooms/:id/members', authenticateToken, [
  body('members').isArray().custom((value) => {
    return value.length > 0 && value.every(id => typeof id === 'string');
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is admin
    const isAdmin = room.admins.some(admin => 
      admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { members } = req.body;

    // Validate members exist
    const memberUsers = await User.find({ _id: { $in: members } });
    if (memberUsers.length !== members.length) {
      return res.status(400).json({ error: 'One or more members not found' });
    }

    // Add new members
    const newMembers = members.filter(memberId => 
      !room.members.some(member => member.user.toString() === memberId)
    );

    newMembers.forEach(memberId => {
      room.members.push({
        user: memberId,
        role: 'member'
      });
    });

    await room.save();
    await room.populate('members.user', 'username avatar status role');

    res.json({
      message: 'Members added successfully',
      room
    });
  } catch (error) {
    console.error('Add members error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from room
router.delete('/rooms/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is admin or removing themselves
    const isAdmin = room.admins.some(admin => 
      admin.toString() === req.user._id.toString()
    );
    const isSelf = req.params.userId === req.user._id.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove member
    room.members = room.members.filter(member => 
      member.user.toString() !== req.params.userId
    );

    await room.save();

    res.json({
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update room settings
router.put('/rooms/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape(),
  body('isPrivate').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is admin
    const isAdmin = room.admins.some(admin => 
      admin.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        room[key] = updates[key];
      }
    });

    await room.save();
    await room.populate('members.user', 'username avatar status role');

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search rooms
router.get('/search/rooms', authenticateToken, async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    
    let query = {
      $or: [
        { isPrivate: false },
        { 'members.user': req.user._id }
      ]
    };

    if (q) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    if (type) {
      query.type = type;
    }

    const rooms = await Room.find(query)
      .populate('members.user', 'username avatar status role')
      .populate('createdBy', 'username avatar')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRooms: total
    });
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;