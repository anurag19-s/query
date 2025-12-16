const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Notification = require('./models/Notification');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==================== CONFIGURATION ====================

// Pre-defined admin email
const ADMIN_EMAIL = 'admin@mespune.in';

// DEPARTMENT HEAD EMAILS (Exact matches only - one per department)
const DEPARTMENT_EMAILS = {
  'it@mespune.in': 'IT',
  'academics@mespune.in': 'Academics',
  'hostel@mespune.in': 'Hostel',
  'library@mespune.in': 'Library',
  'administration@mespune.in': 'Administration',
  'sports@mespune.in': 'Sports',
  'transport@mespune.in': 'Transport'
};

// RESERVED KEYWORDS - Students CANNOT have these in their email
const RESERVED_KEYWORDS = [
  'it@', 'it.', '_it',
  'academics@', 'academics.', '_academics',
  'hostel@', 'hostel.', '_hostel',
  'library@', 'library.', '_library',
  'administration@', 'administration.', 'admin@', 'admin.', '_admin',
  'sports@', 'sports.', '_sports',
  'transport@', 'transport.', '_transport',
  'dept@', 'dept.', 'department@', 'department.'
];

// Valid student email patterns
const STUDENT_EMAIL_PATTERNS = [
  /@mespune\.in$/,
  /\.mca25@mespune\.in$/,
  /\.mca24@mespune\.in$/,
  /\.mca26@mespune\.in$/,
  /\.btech@mespune\.in$/,
  /\.mtech@mespune\.in$/
];

// ==================== HELPER FUNCTIONS ====================

function isAdminEmail(email) {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function isDepartmentEmail(email) {
  return DEPARTMENT_EMAILS.hasOwnProperty(email.toLowerCase());
}

function getDepartmentFromEmail(email) {
  return DEPARTMENT_EMAILS[email.toLowerCase()] || null;
}

function containsReservedKeyword(email) {
  const lowerEmail = email.toLowerCase();
  return RESERVED_KEYWORDS.some(keyword => lowerEmail.includes(keyword));
}

function isValidStudentEmail(email) {
  const lowerEmail = email.toLowerCase();
  const matchesPattern = STUDENT_EMAIL_PATTERNS.some(pattern => pattern.test(lowerEmail));
  const hasReservedKeyword = containsReservedKeyword(lowerEmail);
  return matchesPattern && !hasReservedKeyword;
}

function determineUserRole(email) {
  const lowerEmail = email.toLowerCase();

  if (isAdminEmail(lowerEmail)) {
    return { role: 'admin', department: null };
  }

  if (isDepartmentEmail(lowerEmail)) {
    const departmentFromEmail = getDepartmentFromEmail(lowerEmail);
    return { role: 'department', department: departmentFromEmail };
  }

  if (isValidStudentEmail(lowerEmail)) {
    return { role: 'student', department: null };
  }

  if (containsReservedKeyword(lowerEmail)) {
    throw new Error('Invalid email! Department keywords (it, academics, hostel, library, admin, sports, transport) are reserved for department staff only. Students must use format: name.program@mespune.in (e.g., john.doe.mca25@mespune.in)');
  }

  throw new Error('Invalid email domain. Students must use @mespune.in email format (e.g., yourname.mca25@mespune.in). Department staff must use official department emails.');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/queryconnect';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedDefaultUsers();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==================== SEED DEFAULT USERS ====================

async function seedDefaultUsers() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('✅ Users already exist in database');
      return;
    }

    const defaultUsers = [
      {
        name: 'Ankush Mahadole',
        email: 'ankush.mahadole.mca25@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'student',
        department: null
      },
      {
        name: 'Test Student',
        email: 'test.student.mca25@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'student',
        department: null
      },
      {
        name: 'IT Department Head',
        email: 'it@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'IT'
      },
      {
        name: 'Academics HOD',
        email: 'academics@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'Academics'
      },
      {
        name: 'Hostel Warden',
        email: 'hostel@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'Hostel'
      },
      {
        name: 'Library Head',
        email: 'library@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'Library'
      },
      {
        name: 'Administration Head',
        email: 'administration@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'Administration'
      },
      {
        name: 'Sports Coordinator',
        email: 'sports@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'Sports'
      },
      {
        name: 'Transport Manager',
        email: 'transport@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'department',
        department: 'Transport'
      },
      {
        name: 'System Admin',
        email: 'admin@mespune.in',
        password: await bcrypt.hash('123456', 10),
        role: 'admin',
        department: null
      }
    ];

    await User.insertMany(defaultUsers);
    console.log('✅ Default users created successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
}

// ==================== AUTH MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'This email is already registered. Please login instead.'
      });
    }

    let userRole, userDepartment;
    try {
      const result = determineUserRole(email);
      userRole = result.role;
      userDepartment = result.department;
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      department: userDepartment
    });

    await user.save();

    console.log(`✅ New ${userRole} registered: ${email}${userDepartment ? ` (${userDepartment})` : ''}`);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        role: userRole,
        department: userDepartment
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials. Please check your email and password.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials. Please check your email and password.'
      });
    }

    console.log(`✅ User logged in: ${user.email} (${user.role}${user.department ? ` - ${user.department}` : ''})`);

    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        department: user.department
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ==================== NOTIFICATION ROUTES ====================

// ADMIN creates notification (general or ticket-based)
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, message, audience, department, ticketId } = req.body;

    let userId = null;

    // If audience is 'student', we need ticketId to find the student
    if (audience === 'student') {
      if (!ticketId) {
        return res.status(400).json({ message: 'Ticket ID is required to notify a specific student' });
      }

      // Find the ticket and get the student's user ID
      const ticket = await Ticket.findById(ticketId).populate('student');
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      userId = ticket.student._id; // Get the student who created the ticket
    }

    const notification = new Notification({
      title,
      message,
      type: 'custom',
      audience: audience || 'student',
      department: department || null,
      ticket: ticketId || null,
      user: userId, // This will be the specific student if audience is 'student'
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// CURRENT user fetches notifications for own notice board
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    const dept = req.user.department;

    let query = {
      $or: [
        { user: req.user.id },                 // personal
        { audience: 'both' },
      ],
    };

    if (role === 'student') {
      query.$or.push({ audience: 'student' });
    } else if (role === 'department') {
      query.$or.push(
        { audience: 'department', department: dept },
        { audience: 'department', department: null }
      );
    } else if (role === 'admin') {
      // admin can see everything
      query = {};
    }

    const notifications = await Notification
      .find(query)
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});
// DELETE notification (mark as read/dismissed)
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Find and delete the notification
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification dismissed successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to dismiss notification' });
  }
});

// ==================== TICKET ROUTES ====================

// Create Ticket
app.post('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const { title, description, department, aiSuggestion, priority } = req.body;

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ticket = new Ticket({
      title,
      description,
      department,
      student: req.user.id,
      studentName: student.name,
      studentEmail: student.email,
      aiSuggestion,
      priority: priority || 'Medium',
      status: 'Pending'
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
});

// Get Tickets (filtered by role)
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    let tickets;

    if (req.user.role === 'student') {
      tickets = await Ticket.find({ student: req.user.id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'department') {
      tickets = await Ticket.find({ department: req.user.department }).sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      tickets = await Ticket.find().sort({ createdAt: -1 });
    }

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

// Get Single Ticket
app.get('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('student', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'student' && ticket.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'department' && ticket.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
});

// Update Ticket Status
app.patch('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { status, priority, department } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Department members can only update tickets in their department
    if (req.user.role === 'department' && ticket.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only update tickets in your department' });
    }

    // Update status
    if (status) {
      ticket.status = status;
      if (status === 'Resolved') ticket.resolvedAt = new Date();
      if (status === 'Closed') ticket.closedAt = new Date();
    }

    // ✅ Allow both admin AND department to update priority
    if (priority && (req.user.role === 'admin' || req.user.role === 'department')) {
      ticket.priority = priority;
    }

    // Only admin can change department assignment
    if (department && req.user.role === 'admin') {
      ticket.department = department;
    }

    await ticket.save();
    
    console.log(`✅ Ticket updated by ${req.user.role}: Status=${status || 'unchanged'}, Priority=${priority || 'unchanged'}`);
    
    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
});

// Add Comment to Ticket
app.post('/api/tickets/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const user = await User.findById(req.user.id);

    ticket.comments.push({
      text,
      by: user.name,
      role: user.role,
      createdAt: new Date()
    });

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

// Delete Ticket
app.delete('/api/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'student' && ticket.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own tickets' });
    }

    if (req.user.role === 'department') {
      return res.status(403).json({ message: 'Department staff cannot delete tickets' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    console.log(`✅ Ticket deleted by ${req.user.role}: ${req.params.id}`);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
  }
});

// ==================== GUEST TICKET ROUTES ====================

function generateTrackingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'GUEST-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

app.post('/api/guest-tickets', async (req, res) => {
  try {
    const { title, description, department } = req.body;

    const trackingId = generateTrackingId();

    const ticket = new Ticket({
      title,
      description,
      department,
      student: null,
      studentName: 'Guest User',
      studentEmail: 'guest@anonymous',
      isGuest: true,
      guestEmail: null,
      trackingId: trackingId,
      status: 'Pending',
      priority: 'Medium',
    });

    await ticket.save();

    console.log(`✅ Guest ticket created: ${trackingId}`);

    res.status(201).json({
      message: 'Guest ticket created successfully',
      trackingId: trackingId,
      ticket: {
        id: ticket._id,
        title: ticket.title,
        department: ticket.department,
        status: ticket.status,
      },
    });

  } catch (error) {
    console.error('Guest ticket error:', error);
    res.status(500).json({ message: 'Failed to create guest ticket' });
  }
});

app.get('/api/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;

    console.log(`🔍 Tracking request for: ${trackingId}`);

    const ticket = await Ticket.findOne({
      trackingId: trackingId.toUpperCase()
    });

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found. Please check your tracking ID.'
      });
    }

    res.json({
      trackingId: ticket.trackingId,
      title: ticket.title,
      description: ticket.description,
      department: ticket.department,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      comments: ticket.comments || [],
      isGuest: ticket.isGuest
    });

  } catch (error) {
    console.error('Track ticket error:', error);
    res.status(500).json({ message: 'Failed to track ticket' });
  }
});

// ==================== ANALYTICS ROUTES ====================

app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalTickets = await Ticket.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: 'Pending' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'Closed' });

    const ticketsByDepartment = await Ticket.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title department status createdAt');

    res.json({
      total: totalTickets,
      pending: pendingTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      byDepartment: ticketsByDepartment,
      recent: recentTickets
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// ==================== AI ROUTE ====================

app.post('/api/ai-suggest', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;

    let department = 'Administration';
    let suggestion = 'Your query has been received. Our team will review it shortly.';

    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('wifi') || lowerDesc.includes('internet') || lowerDesc.includes('computer') || lowerDesc.includes('laptop') || lowerDesc.includes('network')) {
      department = 'IT';
      suggestion = 'For IT-related issues, please try restarting your device first. If the problem persists, our IT team will assist you.';
    } else if (lowerDesc.includes('hostel') || lowerDesc.includes('room') || lowerDesc.includes('mess') || lowerDesc.includes('food') || lowerDesc.includes('warden')) {
      department = 'Hostel';
      suggestion = 'For hostel-related concerns, please ensure you have reported this to your hostel warden as well.';
    } else if (lowerDesc.includes('book') || lowerDesc.includes('library') || lowerDesc.includes('journal') || lowerDesc.includes('reading')) {
      department = 'Library';
      suggestion = 'For library queries, you can also check our online catalog or contact the librarian directly.';
    } else if (lowerDesc.includes('exam') || lowerDesc.includes('grade') || lowerDesc.includes('course') || lowerDesc.includes('class') || lowerDesc.includes('marks') || lowerDesc.includes('academic')) {
      department = 'Academics';
      suggestion = 'For academic matters, please also consult your course coordinator or faculty advisor.';
    } else if (lowerDesc.includes('bus') || lowerDesc.includes('transport') || lowerDesc.includes('vehicle')) {
      department = 'Transport';
      suggestion = 'For transport issues, please check the latest bus schedule on the notice board.';
    } else if (lowerDesc.includes('sport') || lowerDesc.includes('gym') || lowerDesc.includes('ground') || lowerDesc.includes('play')) {
      department = 'Sports';
      suggestion = 'For sports facilities, please contact the sports coordinator for bookings and schedules.';
    } else if (lowerDesc.includes('fee') || lowerDesc.includes('admission') || lowerDesc.includes('certificate') || lowerDesc.includes('document')) {
      department = 'Administration';
      suggestion = 'For administrative queries, please visit the administration office during working hours.';
    }

    res.json({ suggestion, department });
  } catch (error) {
    console.error('AI suggest error:', error);
    res.status(500).json({ message: 'AI suggestion failed', error: error.message });
  }
});

app.get('/api/departments', (req, res) => {
  const departments = [...new Set(Object.values(DEPARTMENT_EMAILS))];
  res.json({ departments });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});