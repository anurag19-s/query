const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'department', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    enum: ['Academics', 'Hostel', 'Library', 'IT', 'Admin', 'Transport', 'Sports','Administration'],
    required: function() {
      return this.role === 'department';
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);