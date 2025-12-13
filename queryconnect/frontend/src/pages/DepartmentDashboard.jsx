import { useState, useEffect } from 'react';
import axios from 'axios';

function DepartmentDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [selectedDept, setSelectedDept] = useState('IT');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');

  const departments = ['Academics', 'Hostel', 'Library', 'IT', 'Administration'];

  useEffect(() => {
    fetchTickets();
  }, [selectedDept]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/tickets?department=${selectedDept}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}`,
        { status: newStatus, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Ticket updated successfully!');
      setComment('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      alert('Error updating ticket');
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
          <h1 style={styles.title}>Department Dashboard</h1>
          <p style={styles.welcome}>Welcome, {user.name}!</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.filterSection}>
        <label style={styles.label}>Filter by Department:</label>
        <select 
          value={selectedDept} 
          onChange={(e) => setSelectedDept(e.target.value)}
          style={styles.select}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>{tickets.length}</h3>
          <p>Total Tickets</p>
        </div>
        <div style={styles.statCard}>
          <h3>{tickets.filter(t => t.status === 'Pending').length}</h3>
          <p>Pending</p>
        </div>
        <div style={styles.statCard}>
          <h3>{tickets.filter(t => t.status === 'In Progress').length}</h3>
          <p>In Progress</p>
        </div>
        <div style={styles.statCard}>
          <h3>{tickets.filter(t => t.status === 'Resolved').length}</h3>
          <p>Resolved</p>
        </div>
      </div>

      <div style={styles.ticketsSection}>
        <h2>Tickets for {selectedDept} Department</h2>
        {tickets.length === 0 ? (
          <p style={styles.noTickets}>No tickets for this department.</p>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} style={styles.ticket}>
              <div style={styles.ticketHeader}>
                <div>
                  <h3>{ticket.title}</h3>
                  <p style={styles.studentName}>By: {ticket.studentName}</p>
                </div>
                <span style={{...styles.status, background: getStatusColor(ticket.status)}}>
                  {ticket.status}
                </span>
              </div>
              
              <p style={styles.description}>{ticket.description}</p>
              
              {ticket.aiSuggestion && (
                <div style={styles.aiBox}>
                  <strong>AI Suggestion:</strong> {ticket.aiSuggestion}
                </div>
              )}

              <div style={styles.ticketFooter}>
                <span>🕒 {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              {selectedTicket === ticket.id ? (
                <div style={styles.actionBox}>
                  <textarea
                    placeholder="Add a comment (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={styles.textarea}
                    rows="3"
                  />
                  <div style={styles.btnGroup}>
                    <button 
                      onClick={() => updateStatus(ticket.id, 'In Progress')}
                      style={{...styles.actionBtn, background: '#2196F3'}}
                    >
                      Mark In Progress
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, 'Resolved')}
                      style={{...styles.actionBtn, background: '#4CAF50'}}
                    >
                      Mark Resolved
                    </button>
                    <button 
                      onClick={() => setSelectedTicket(null)}
                      style={{...styles.actionBtn, background: '#999'}}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedTicket(ticket.id)}
                  style={styles.updateBtn}
                >
                  Update Ticket
                </button>
              )}

              {ticket.comments && ticket.comments.length > 0 && (
                <div style={styles.commentsSection}>
                  <strong>Comments:</strong>
                  {ticket.comments.map((c, idx) => (
                    <div key={idx} style={styles.comment}>
                      <p>{c.text}</p>
                      <small>By {c.by} on {new Date(c.at).toLocaleString()}</small>
                    </div>
                  ))}
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
  filterSection: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: { fontWeight: 'bold' },
  select: {
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  studentName: { color: '#999', fontSize: '14px', marginTop: '5px' },
  status: {
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  description: { color: '#666', marginBottom: '15px' },
  aiBox: {
    marginBottom: '15px',
    padding: '10px',
    background: '#f0f0f0',
    borderRadius: '5px',
    fontSize: '14px'
  },
  ticketFooter: { fontSize: '14px', color: '#999', marginBottom: '15px' },
  updateBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  actionBox: {
    marginTop: '15px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '5px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  btnGroup: {
    display: 'flex',
    gap: '10px'
  },
  actionBtn: {
    flex: 1,
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  commentsSection: {
    marginTop: '15px',
    padding: '15px',
    background: '#f0f0f0',
    borderRadius: '5px'
  },
  comment: {
    marginTop: '10px',
    padding: '10px',
    background: 'white',
    borderRadius: '5px'
  }
};

export default DepartmentDashboard;