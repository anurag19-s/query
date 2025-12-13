const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (using simple in-memory for now - can switch to real MongoDB later)
const JWT_SECRET = 'your-secret-key-change-this';

// In-memory storage (replace with MongoDB later if needed)
let users = [
  { id: 1, email: 'student@test.com', password: bcrypt.hashSync('123456', 10), role: 'student', name: 'Test Student' },
  { id: 2, email: 'dept@test.com', password: bcrypt.hashSync('123456', 10), role: 'department', name: 'IT Department' },
  { id: 3, email: 'admin@test.com', password: bcrypt.hashSync('123456', 10), role: 'admin', name: 'Admin User' }
];

let tickets = [];
let ticketIdCounter = 1;

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    email,
    password: hashedPassword,
    name,
    role: role || 'student'
  };
  
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// ============ TICKET ROUTES ============

// Create Ticket
app.post('/api/tickets', authenticateToken, (req, res) => {
  const { title, description, department, aiSuggestion } = req.body;
  
  const newTicket = {
    id: ticketIdCounter++,
    title,
    description,
    department,
    aiSuggestion,
    status: 'Pending',
    studentId: req.user.id,
    studentName: users.find(u => u.id === req.user.id)?.name,
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: []
  };
  
  tickets.push(newTicket);
  res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
});

// Get All Tickets (filtered by role)
app.get('/api/tickets', authenticateToken, (req, res) => {
  let filteredTickets = tickets;

  if (req.user.role === 'student') {
    filteredTickets = tickets.filter(t => t.studentId === req.user.id);
  } else if (req.user.role === 'department') {
    const department = req.query.department;
    if (department) {
      filteredTickets = tickets.filter(t => t.department === department);
    }
  }
  // Admin sees all tickets

  res.json(filteredTickets);
});

// Get Single Ticket
app.get('/api/tickets/:id', authenticateToken, (req, res) => {
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  res.json(ticket);
});

// Update Ticket Status
app.patch('/api/tickets/:id', authenticateToken, (req, res) => {
  const { status, comment } = req.body;
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  if (status) {
    ticket.status = status;
  }

  if (comment) {
    ticket.comments.push({
      text: comment,
      by: req.user.email,
      at: new Date()
    });
  }

  ticket.updatedAt = new Date();
  res.json({ message: 'Ticket updated successfully', ticket });
});

// ============ AI ROUTE ============

// AI Suggestion
app.post('/api/ai-suggest', authenticateToken, async (req, res) => {
  const { description } = req.body;
  
  try {
    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a college support assistant. A student has this issue: "${description}"

Provide:
1. A helpful suggestion or solution (2-3 sentences)
2. Categorize into one of: Academics, Hostel, Library, IT, Administration

Respond in JSON format:
{
  "suggestion": "your suggestion here",
  "department": "category here"
}`
        }]
      })
    });

    const data = await response.json();
    const aiResponse = data.content[0].text;
    
    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      res.json(parsed);
    } else {
      // Fallback
      res.json({
        suggestion: "Please provide more details about your issue.",
        department: "Administration"
      });
    }
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback response if AI fails
    res.json({
      suggestion: "Your query has been received. A staff member will assist you shortly.",
      department: "Administration"
    });
  }
});

// ============ ANALYTICS ROUTE ============

app.get('/api/analytics', authenticateToken, (req, res) => {
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'Pending').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  res.json({ total, pending, inProgress, resolved });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log('Test accounts:');
  console.log('Student: student@test.com / 123456');
  console.log('Department: dept@test.com / 123456');
  console.log('Admin: admin@test.com / 123456');
});