const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Optional: can be null for general notices
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
    // Optional: can be null for general notices
  },
  type: {
    type: String,
    enum: [
      'ticket_created',
      'ticket_updated',
      'status_changed',
      'comment_added',
      'ticket_reassigned',
      'custom'
    ],
    required: true
  },
  // NEW: Who should see this notification
  audience: {
    type: String,
    enum: ['student', 'department', 'both'],
    default: 'student'
  },
  // NEW: Optional department filter for dept/general notices
  department: {
    type: String // e.g. 'IT', 'Academics', or null for all departments
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ audience: 1, department: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);