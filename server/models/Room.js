const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'project', 'department', 'general'],
    default: 'group'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  department: {
    type: String,
    enum: ['Animation', 'VFX', 'Lighting', 'Modeling', 'Rigging', 'Concept Art', 'Storyboard', 'Sound', 'Post-Production'],
    default: null
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowMentions: {
      type: Boolean,
      default: true
    },
    muteNotifications: {
      type: Boolean,
      default: false
    },
    autoDeleteMessages: {
      type: Boolean,
      default: false
    },
    autoDeleteDays: {
      type: Number,
      default: 30
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient querying
roomSchema.index({ 'members.user': 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ project: 1 });
roomSchema.index({ department: 1 });
roomSchema.index({ lastActivity: -1 });

// Update last activity when messages are sent
roomSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);