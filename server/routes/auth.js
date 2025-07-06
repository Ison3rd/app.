const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn([
    'Animation Producer',
    'Animation Director', 
    'Senior 3D Animator',
    'Intermediate 3D Animator',
    'Junior 3D Animator',
    'Concept Artist',
    'Storyboard Artist',
    'Technical Director',
    'VFX Artist',
    'Lighting Artist',
    'Sound Designer',
    'Editor',
    'Rigger',
    'Modeler',
    'Texture Artist',
    'Compositor',
    'Motion Graphics Artist',
    'Character Designer',
    'Environment Artist',
    'Previz Artist'
  ])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, skills, experience, specialization, company, location, portfolio } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      skills: skills || [],
      experience: experience || 'Entry Level',
      specialization,
      company: company || '',
      location: location || '',
      portfolio: portfolio || ''
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update user status to online
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('projects', 'title status')
      .populate('rooms', 'name type');

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('bio').optional().isLength({ max: 500 }).trim().escape(),
  body('skills').optional().isArray(),
  body('experience').optional().isIn(['Entry Level', '1-2 years', '3-5 years', '5-10 years', '10+ years']),
  body('company').optional().isLength({ max: 100 }).trim().escape(),
  body('location').optional().isLength({ max: 100 }).trim().escape(),
  body('portfolio').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(req.user._id, { 
      status: 'offline',
      lastSeen: new Date()
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get animation roles
router.get('/roles', (req, res) => {
  const roles = [
    'Animation Producer',
    'Animation Director', 
    'Senior 3D Animator',
    'Intermediate 3D Animator',
    'Junior 3D Animator',
    'Concept Artist',
    'Storyboard Artist',
    'Technical Director',
    'VFX Artist',
    'Lighting Artist',
    'Sound Designer',
    'Editor',
    'Rigger',
    'Modeler',
    'Texture Artist',
    'Compositor',
    'Motion Graphics Artist',
    'Character Designer',
    'Environment Artist',
    'Previz Artist'
  ];

  const skills = [
    'Maya', 'Blender', 'Cinema 4D', '3ds Max', 'After Effects', 'Nuke', 'Houdini',
    'ZBrush', 'Substance Painter', 'Photoshop', 'Illustrator', 'Toon Boom',
    'TVPaint', 'Storyboard Pro', 'Unity', 'Unreal Engine', 'Arnold', 'V-Ray',
    'Redshift', 'Octane', 'RenderMan', 'Python', 'MEL', 'C#', 'JavaScript'
  ];

  const specializations = [
    'Character Animation', 'Creature Animation', 'Vehicle Animation',
    'Effects Animation', 'Technical Animation', 'Facial Animation',
    'Motion Capture', 'Traditional Animation', 'Stop Motion', 'CG Animation',
    'Architectural Visualization', 'Game Animation', 'Film Animation',
    'TV Animation', 'Commercial Animation'
  ];

  res.json({ roles, skills, specializations });
});

module.exports = router;