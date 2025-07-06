const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Get all projects (user is member of)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    let query = {
      $or: [
        { 'team.user': req.user._id },
        { director: req.user._id },
        { producer: req.user._id },
        { createdBy: req.user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const projects = await Project.find(query)
      .populate('director', 'username avatar role')
      .populate('producer', 'username avatar role')
      .populate('team.user', 'username avatar role')
      .populate('createdBy', 'username avatar')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProjects: total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new project
router.post('/', authenticateToken, checkPermission('canCreateProjects'), [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 2000 }).trim().escape(),
  body('type').isIn(['Film', 'TV Series', 'Commercial', 'Music Video', 'Game Cinematic', 'Short Film', 'Web Series']),
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
  body('director').isMongoId(),
  body('producer').isMongoId(),
  body('budget').optional().isNumeric(),
  body('client').optional().isLength({ max: 100 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, startDate, endDate, director, producer, budget, client } = req.body;

    // Validate director and producer exist
    const [directorUser, producerUser] = await Promise.all([
      User.findById(director),
      User.findById(producer)
    ]);

    if (!directorUser || !producerUser) {
      return res.status(400).json({ error: 'Director or producer not found' });
    }

    const project = new Project({
      title,
      description: description || '',
      type,
      startDate,
      endDate,
      director,
      producer,
      budget: budget || 0,
      client: client || '',
      createdBy: req.user._id,
      team: [
        {
          user: director,
          role: directorUser.role,
          permissions: {
            canEditProject: true,
            canManageTasks: true,
            canManageTeam: true
          }
        },
        {
          user: producer,
          role: producerUser.role,
          permissions: {
            canEditProject: true,
            canManageTasks: true,
            canManageTeam: true
          }
        }
      ]
    });

    await project.save();

    // Create project room if auto-create is enabled
    if (project.settings.autoCreateRooms) {
      const room = new Room({
        name: `${title} - Main`,
        description: `Main discussion room for ${title}`,
        type: 'project',
        project: project._id,
        members: [
          { user: director, role: 'admin' },
          { user: producer, role: 'admin' }
        ],
        admins: [director, producer],
        createdBy: req.user._id
      });

      await room.save();
      project.rooms.push(room._id);
      await project.save();
    }

    await project.populate('director', 'username avatar role');
    await project.populate('producer', 'username avatar role');
    await project.populate('team.user', 'username avatar role');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('director', 'username avatar role')
      .populate('producer', 'username avatar role')
      .populate('team.user', 'username avatar role')
      .populate('createdBy', 'username avatar')
      .populate('rooms', 'name type memberCount')
      .populate('tasks.assignedTo', 'username avatar role')
      .populate('tasks.createdBy', 'username avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is team member
    const isTeamMember = project.team.some(member => 
      member.user._id.toString() === req.user._id.toString()
    ) || project.director._id.toString() === req.user._id.toString() 
      || project.producer._id.toString() === req.user._id.toString();

    if (!isTeamMember && !project.settings.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 2000 }).trim().escape(),
  body('status').optional().isIn(['planning', 'pre-production', 'production', 'post-production', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('budget').optional().isNumeric(),
  body('client').optional().isLength({ max: 100 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    const canEdit = teamMember?.permissions.canEditProject 
      || project.director.toString() === req.user._id.toString()
      || project.producer.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        project[key] = updates[key];
      }
    });

    await project.save();
    await project.populate('director', 'username avatar role');
    await project.populate('producer', 'username avatar role');
    await project.populate('team.user', 'username avatar role');

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add team member
router.post('/:id/team', authenticateToken, [
  body('userId').isMongoId(),
  body('role').isIn([
    'Animation Producer', 'Animation Director', 'Senior 3D Animator',
    'Intermediate 3D Animator', 'Junior 3D Animator', 'Concept Artist',
    'Storyboard Artist', 'Technical Director', 'VFX Artist', 'Lighting Artist',
    'Sound Designer', 'Editor', 'Rigger', 'Modeler', 'Texture Artist',
    'Compositor', 'Motion Graphics Artist', 'Character Designer',
    'Environment Artist', 'Previz Artist'
  ])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    const canManageTeam = teamMember?.permissions.canManageTeam 
      || project.director.toString() === req.user._id.toString()
      || project.producer.toString() === req.user._id.toString();

    if (!canManageTeam) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId, role } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if user is already a team member
    if (project.team.some(member => member.user.toString() === userId)) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Add team member
    project.team.push({
      user: userId,
      role,
      permissions: {
        canEditProject: false,
        canManageTasks: ['Animation Director', 'Senior 3D Animator', 'Technical Director'].includes(role),
        canManageTeam: false
      }
    });

    await project.save();
    await project.populate('team.user', 'username avatar role');

    res.json({
      message: 'Team member added successfully',
      project
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove team member
router.delete('/:id/team/:userId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    const canManageTeam = teamMember?.permissions.canManageTeam 
      || project.director.toString() === req.user._id.toString()
      || project.producer.toString() === req.user._id.toString();

    if (!canManageTeam) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove team member
    project.team = project.team.filter(member => 
      member.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/:id/tasks', authenticateToken, [
  body('title').isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 1000 }).trim().escape(),
  body('assignedTo').isMongoId(),
  body('dueDate').isISO8601().toDate(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('estimatedHours').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const teamMember = project.team.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    const canManageTasks = teamMember?.permissions.canManageTasks 
      || project.director.toString() === req.user._id.toString()
      || project.producer.toString() === req.user._id.toString();

    if (!canManageTasks) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, assignedTo, dueDate, priority, estimatedHours } = req.body;

    // Validate assignedTo is team member
    const isTeamMember = project.team.some(member => 
      member.user.toString() === assignedTo
    );

    if (!isTeamMember) {
      return res.status(400).json({ error: 'Assigned user is not a team member' });
    }

    const task = {
      title,
      description: description || '',
      assignedTo,
      dueDate,
      priority: priority || 'medium',
      estimatedHours: estimatedHours || 0,
      createdBy: req.user._id
    };

    project.tasks.push(task);
    await project.save();

    const newTask = project.tasks[project.tasks.length - 1];
    await project.populate('tasks.assignedTo', 'username avatar role');
    await project.populate('tasks.createdBy', 'username avatar');

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:id/tasks/:taskId', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 1000 }).trim().escape(),
  body('status').optional().isIn(['pending', 'in-progress', 'review', 'approved', 'completed', 'on-hold']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('actualHours').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = project.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions (can update if assigned to task or can manage tasks)
    const teamMember = project.team.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    const canUpdateTask = task.assignedTo.toString() === req.user._id.toString()
      || teamMember?.permissions.canManageTasks 
      || project.director.toString() === req.user._id.toString()
      || project.producer.toString() === req.user._id.toString();

    if (!canUpdateTask) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        task[key] = updates[key];
      }
    });

    await project.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is team member
    const isTeamMember = project.team.some(member => 
      member.user._id.toString() === req.user._id.toString()
    ) || project.director._id.toString() === req.user._id.toString() 
      || project.producer._id.toString() === req.user._id.toString();

    if (!isTeamMember && !project.settings.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = {
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(task => task.status === 'completed').length,
      inProgressTasks: project.tasks.filter(task => task.status === 'in-progress').length,
      pendingTasks: project.tasks.filter(task => task.status === 'pending').length,
      overdueTasks: project.tasks.filter(task => 
        task.dueDate < new Date() && task.status !== 'completed'
      ).length,
      totalEstimatedHours: project.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      totalActualHours: project.tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
      teamSize: project.team.length,
      progress: project.progress,
      daysRemaining: Math.ceil((project.endDate - new Date()) / (1000 * 60 * 60 * 24))
    };

    res.json(stats);
  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;