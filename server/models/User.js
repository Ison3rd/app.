const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: [
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
    ],
    default: 'Junior 3D Animator'
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy', 'away'],
    default: 'offline'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skills: [{
    type: String,
    enum: [
      'Maya',
      'Blender', 
      'Cinema 4D',
      '3ds Max',
      'After Effects',
      'Nuke',
      'Houdini',
      'ZBrush',
      'Substance Painter',
      'Photoshop',
      'Illustrator',
      'Toon Boom',
      'TVPaint',
      'Storyboard Pro',
      'Unity',
      'Unreal Engine',
      'Arnold',
      'V-Ray',
      'Redshift',
      'Octane',
      'RenderMan',
      'Python',
      'MEL',
      'C#',
      'JavaScript'
    ]
  }],
  experience: {
    type: String,
    enum: ['Entry Level', '1-2 years', '3-5 years', '5-10 years', '10+ years'],
    default: 'Entry Level'
  },
  company: {
    type: String,
    maxlength: 100,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  portfolio: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    enum: [
      'Character Animation',
      'Creature Animation', 
      'Vehicle Animation',
      'Effects Animation',
      'Technical Animation',
      'Facial Animation',
      'Motion Capture',
      'Traditional Animation',
      'Stop Motion',
      'CG Animation',
      'Architectural Visualization',
      'Game Animation',
      'Film Animation',
      'TV Animation',
      'Commercial Animation'
    ]
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  rolePermissions: {
    canCreateProjects: {
      type: Boolean,
      default: function() {
        return ['Animation Producer', 'Animation Director', 'Technical Director'].includes(this.role);
      }
    },
    canManageTeam: {
      type: Boolean,
      default: function() {
        return ['Animation Producer', 'Animation Director', 'Senior 3D Animator', 'Technical Director'].includes(this.role);
      }
    },
    canReviewWork: {
      type: Boolean,
      default: function() {
        return ['Animation Producer', 'Animation Director', 'Senior 3D Animator', 'Technical Director'].includes(this.role);
      }
    },
    canAccessFinancials: {
      type: Boolean,
      default: function() {
        return ['Animation Producer'].includes(this.role);
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update role permissions when role changes
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    this.rolePermissions.canCreateProjects = ['Animation Producer', 'Animation Director', 'Technical Director'].includes(this.role);
    this.rolePermissions.canManageTeam = ['Animation Producer', 'Animation Director', 'Senior 3D Animator', 'Technical Director'].includes(this.role);
    this.rolePermissions.canReviewWork = ['Animation Producer', 'Animation Director', 'Senior 3D Animator', 'Technical Director'].includes(this.role);
    this.rolePermissions.canAccessFinancials = ['Animation Producer'].includes(this.role);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);