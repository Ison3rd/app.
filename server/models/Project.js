const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'review', 'approved', 'completed', 'on-hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  files: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  type: {
    type: String,
    enum: ['Film', 'TV Series', 'Commercial', 'Music Video', 'Game Cinematic', 'Short Film', 'Web Series'],
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'pre-production', 'production', 'post-production', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    default: 0
  },
  client: {
    type: String,
    maxlength: 100,
    default: ''
  },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  producer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
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
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canEditProject: {
        type: Boolean,
        default: false
      },
      canManageTasks: {
        type: Boolean,
        default: false
      },
      canManageTeam: {
        type: Boolean,
        default: false
      }
    }
  }],
  tasks: [taskSchema],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  assets: [{
    name: String,
    type: {
      type: String,
      enum: ['character', 'prop', 'environment', 'effect', 'audio', 'reference']
    },
    url: String,
    thumbnail: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    autoCreateRooms: {
      type: Boolean,
      default: true
    }
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
projectSchema.index({ 'team.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });

// Calculate project progress based on completed tasks
projectSchema.methods.calculateProgress = function() {
  if (this.tasks.length === 0) {
    this.progress = 0;
    return;
  }
  
  const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  this.progress = Math.round((completedTasks / this.tasks.length) * 100);
};

// Update progress before saving
projectSchema.pre('save', function(next) {
  this.calculateProgress();
  next();
});

module.exports = mongoose.model('Project', projectSchema);