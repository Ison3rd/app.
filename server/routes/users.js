const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users (with search and filter)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, role, skills, experience, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }
    
    // Filter by experience
    if (experience) {
      query.experience = experience;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ lastSeen: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('projects', 'title status type')
      .populate('rooms', 'name type');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user status
router.put('/status', authenticateToken, [
  body('status').isIn(['online', 'offline', 'busy', 'away'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status, lastSeen: new Date() },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users by role
router.get('/role/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find({ role })
      .select('-password')
      .sort({ lastSeen: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role });

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      role
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users by skills
router.get('/search/skills', authenticateToken, async (req, res) => {
  try {
    const { skills, page = 1, limit = 20 } = req.query;
    
    if (!skills) {
      return res.status(400).json({ error: 'Skills parameter is required' });
    }

    const skillsArray = skills.split(',');
    
    const users = await User.find({
      skills: { $in: skillsArray }
    })
      .select('-password')
      .sort({ lastSeen: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      skills: { $in: skillsArray }
    });

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      searchedSkills: skillsArray
    });
  } catch (error) {
    console.error('Search users by skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get online users
router.get('/status/online', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ status: 'online' })
      .select('-password')
      .sort({ lastSeen: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, [
  body('notifications').optional().isBoolean(),
  body('soundEnabled').optional().isBoolean(),
  body('darkMode').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notifications, soundEnabled, darkMode } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'preferences.notifications': notifications,
        'preferences.soundEnabled': soundEnabled,
        'preferences.darkMode': darkMode
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ status: 'online' });
    
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const skillStats = await User.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const experienceStats = await User.aggregate([
      { $group: { _id: '$experience', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalUsers,
      onlineUsers,
      roleStats,
      skillStats,
      experienceStats
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;