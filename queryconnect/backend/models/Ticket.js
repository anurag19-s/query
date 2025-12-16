const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  aiSuggestion: {
    type: String
  },
  comments: [{
    text: String,
    by: String,
    role: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isGuest: {
    type: Boolean,
    default: false
  },
  guestEmail: {
    type: String,
    default: null
  },
  trackingId: {
    type: String,
    unique: true,
    sparse: true,  // Allows null values to not be unique
    index: true    // Index for faster lookups
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);