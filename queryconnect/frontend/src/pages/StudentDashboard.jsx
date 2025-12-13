import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Academics');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = ['Academics', 'Hostel', 'Library', 'IT', 'Administration'];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const getAISuggestion = async () => {
    if (!description) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai-suggest',
        { description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAiSuggestion(response.data.suggestion);
      setDepartment(response.data.department);
    } catch (error) {
      console.error('AI Error:', error);
      setAiSuggestion('Could not get AI suggestion. Please continue manually.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/tickets',
        { title, description, department, aiSuggestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Ticket created successfully!');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setAiSuggestion('');
      fetchTickets();
    } catch (error) {
      alert('Error creating ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'In Progress': return '#2196F3';
      case 'Resolved': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Dashboard</h1>
          <p style={styles.welcome}>Welcome, {user.name}!</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={styles.createBtn}
      >
        {showForm ? 'Cancel' : '+ Create New Ticket'}
      </button>

      {showForm && (
        <div style={styles.form}>
          <h2>Raise a Query/Complaint</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              required
            />
            
            <textarea
              placeholder="Describe your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              rows="4"
              required
            />

            <button 
              type="button" 
              onClick={getAISuggestion}
              style={styles.aiBtn}
              disabled={loading}
            >
              {loading ? '🤖 AI is thinking...' : '🤖 Get AI Suggestion'}
            </button>

            {aiSuggestion && (
              <div style={styles.aiBox}>
                <strong>AI Suggestion:</strong>
                <p>{aiSuggestion}</p>
              </div>
            )}

            <select 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.select}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <button type="submit" style={styles.submitBtn}>
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      <div style={styles.ticketsSection}>
        <h2>My Tickets</h2>
        {tickets.length === 0 ? (
          <p style={styles.noTickets}>No tickets yet. Create your first one!</p>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} style={styles.ticket}>
              <div style={styles.ticketHeader}>
                <h3>{ticket.title}</h3>
                <span style={{...styles.status, background: getStatusColor(ticket.status)}}>
                  {ticket.status}
                </span>
              </div>
              <p style={styles.description}>{ticket.description}</p>
              <div style={styles.ticketFooter}>
                <span>📁 {ticket.department}</span>
                <span>🕒 {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              {ticket.aiSuggestion && (
                <div style={styles.aiSuggestionBox}>
                  <strong>AI Suggested:</strong> {ticket.aiSuggestion}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: { color: '#667eea', marginBottom: '5px' },
  welcome: { color: '#666' },
  logoutBtn: {
    padding: '10px 20px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  createBtn: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  form: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  aiBtn: {
    width: '100%',
    padding: '12px',
    background: '#FF6B6B',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '15px',
    fontSize: '16px'
  },
  aiBox: {
    background: '#E8F5E9',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '15px',
    border: '2px solid #4CAF50'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  ticketsSection: { marginTop: '30px' },
  noTickets: { textAlign: 'center', color: '#999', padding: '40px' },
  ticket: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  status: {
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  description: { color: '#666', marginBottom: '15px' },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#999'
  },
  aiSuggestionBox: {
    marginTop: '10px',
    padding: '10px',
    background: '#f0f0f0',
    borderRadius: '5px',
    fontSize: '14px'
  }
};

export default StudentDashboard;