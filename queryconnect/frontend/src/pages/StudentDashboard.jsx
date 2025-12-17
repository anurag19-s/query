import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Academics');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiSource, setAiSource] = useState('');
  const [matchedTickets, setMatchedTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});


  // NEW: Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotices, setShowNotices] = useState(true);

  const departments = ['Academics', 'Hostel', 'Library', 'IT', 'Administration', 'Sports', 'Transport'];

  useEffect(() => {
    fetchTickets();
    fetchNotifications();
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

  // NEW: Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from local state
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
      alert('Failed to dismiss notification');
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
      setAiSource(response.data.source || '');
      setMatchedTickets(response.data.matchedTickets || 0);

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
        {
          title,
          description,
          department,
          aiSuggestion,
          aiSource,
          matchedTickets,
        },
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

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Delete this ticket permanently? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTickets((prevTickets) => prevTickets.filter((t) => t._id !== ticketId));
      alert('Ticket deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'In Progress': return '#2196F3';
      case 'Resolved': return '#4CAF50';
      case 'Closed': return '#666';
      default: return '#999';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4444';
      case 'Medium': return '#ffa500';
      case 'Low': return '#4CAF50';
      default: return '#999';
    }
  };

  const toggleComments = (ticketId) => {
    setExpandedComments(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
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

      {/* NEW: Notice Board Section */}

      {/* NEW: Notice Board Section */}
      <div style={styles.noticeBoard}>
        <div style={styles.noticeBoardHeader}>
          <h2 style={styles.noticeBoardTitle}>
            📢 Notice Board ({notifications.length})
          </h2>
          <button
            onClick={() => setShowNotices(!showNotices)}
            style={styles.toggleNoticesBtn}
          >
            {showNotices ? '▲ Hide' : '▼ Show'}
          </button>
        </div>

        {showNotices && (
          <div style={styles.noticesList}>
            {notifications.length === 0 ? (
              <div style={styles.noNotices}>
                <p style={styles.noNoticesText}>📭 No notifications at the moment</p>
                <p style={styles.noNoticesSubtext}>You'll see important updates here</p>
              </div>
            ) : (
              notifications.map(notice => (
                <div key={notice._id} style={styles.noticeItem}>
                  <div style={styles.noticeHeader}>
                    <div>
                      <strong style={styles.noticeTitle}>{notice.title}</strong>
                      <span style={styles.noticeDate}>
                        {new Date(notice.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => dismissNotification(notice._id)}
                      style={styles.dismissBtn}
                      title="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                  <p style={styles.noticeMessage}>{notice.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>


      <button
        onClick={() => setShowForm(!showForm)}
        style={styles.createBtn}
      >
        {showForm ? '✖ Cancel' : '+ Create New Ticket'}
      </button>

      {showForm && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Raise a Query/Complaint</h2>
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
              placeholder="Describe your issue in detail..."
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
              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: '#f0f7ff',
                borderLeft:
                  aiSource === 'ai_with_memory'
                    ? '4px solid #4CAF50'
                    : aiSource === 'ai_only'
                      ? '4px solid #2196F3'
                      : '4px solid #999',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
              }}>
                {aiSource === 'ai_with_memory' && (
                  <>
                    <strong>🎯 Smart AI suggestion (uses {matchedTickets} similar resolved ticket{matchedTickets > 1 ? 's' : ''})</strong>
                    <p style={{ marginTop: '6px' }}>{aiSuggestion}</p>
                  </>
                )}
                {aiSource === 'ai_only' && (
                  <>
                    <strong>🤖 AI suggestion (no similar past tickets)</strong>
                    <p style={{ marginTop: '6px' }}>{aiSuggestion}</p>
                  </>
                )}
                {aiSource === 'fallback' && (
                  <>
                    <strong>ℹ️ No AI suggestion available</strong>
                    <p style={{ marginTop: '6px' }}>{aiSuggestion}</p>
                  </>
                )}
              </div>
            )}


            <label style={styles.label}>Department</label>
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
        <h2 style={styles.sectionTitle}>My Tickets ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>📋 No tickets yet</p>
            <p style={styles.emptySubtext}>Create your first ticket to get started!</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket._id} style={styles.ticket}>
              <div style={styles.ticketHeader}>
                <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                <div style={styles.badges}>
                  <span style={{ ...styles.status, background: getStatusColor(ticket.status) }}>
                    {ticket.status}
                  </span>
                  <span style={{ ...styles.priority, background: getPriorityColor(ticket.priority) }}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <p style={styles.description}>{ticket.description}</p>

              <div style={styles.ticketFooter}>
                <span>🏢 {ticket.department}</span>
                <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              {ticket.aiSuggestion && (
                <div style={styles.aiSuggestionBox}>
                  <strong>🤖 AI Suggested:</strong> {ticket.aiSuggestion}
                </div>
              )}

              {ticket.comments && ticket.comments.length > 0 && (() => {
                const latest = ticket.comments[ticket.comments.length - 1];
                const older = ticket.comments.slice(0, -1);
                const isExpanded = expandedComments[ticket._id];

                return (
                  <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#e0f2fe' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      💬 Latest Update from {latest.by}:
                    </div>
                    <div>{latest.text}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {latest.role} • {new Date(latest.createdAt).toLocaleString()}
                    </div>

                    {older.length > 0 && !isExpanded && (
                      <button
                        type="button"
                        style={{ marginTop: '6px', fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => toggleComments(ticket._id)}
                      >
                        +{older.length} more comment{older.length > 1 ? 's' : ''}
                      </button>
                    )}

                    {older.length > 0 && isExpanded && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid #bfdbfe', paddingTop: '6px' }}>
                        {older.map((c, idx) => (
                          <div key={idx} style={{ marginBottom: '4px', fontSize: '13px' }}>
                            <strong>{c.by}</strong> ({c.role}) — {c.text}
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {new Date(c.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          style={{ marginTop: '4px', fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => toggleComments(ticket._id)}
                        >
                          Hide previous comments
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div style={styles.actions}>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(ticket._id)}
                >
                  🗑️ Delete Ticket
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#667eea',
    marginBottom: '5px',
    fontSize: '28px'
  },
  welcome: { color: '#666', fontSize: '16px' },
  logoutBtn: {
    padding: '10px 20px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  // NEW: Notice Board Styles
  noticeBoard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    border: '2px solid #667eea'
  },
  noticeBoardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  noticeBoardTitle: {
    margin: 0,
    color: '#667eea',
    fontSize: '22px'
  },
  toggleNoticesBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  noticesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  noticeItem: {
    background: '#f0f4ff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #d0d9ff'
  },
  noticeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    gap: '10px'
  },
  noticeTitle: {
    fontSize: '16px',
    color: '#333',
    display: 'block',
    marginBottom: '4px'
  },
  noticeDate: {
    fontSize: '12px',
    color: '#999',
    display: 'block'
  },
  noticeMessage: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
    lineHeight: '1.6'
  },
  ticketLinkBadge: {
    padding: '4px 10px',
    background: '#fff9c4',
    color: '#f57f17',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  createBtn: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  form: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  formTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s'
  },
  select: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box'
  },
  aiBtn: {
    width: '100%',
    padding: '12px',
    background: '#FF6B6B',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: '600'
  },
  aiBox: {
    background: '#E8F5E9',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '2px solid #4CAF50'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  ticketsSection: {
    marginTop: '30px'
  },
  sectionTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  emptyText: {
    fontSize: '24px',
    margin: '0 0 10px 0'
  },
  emptySubtext: {
    color: '#999',
    margin: 0
  },
  ticket: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '15px'
  },
  ticketTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
    flex: 1
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  status: {
    padding: '5px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  priority: {
    padding: '5px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  description: {
    color: '#555',
    marginBottom: '15px',
    lineHeight: '1.6',
    fontSize: '15px'
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#999',
    paddingTop: '10px',
    borderTop: '1px solid #f0f0f0'
  },
  aiSuggestionBox: {
    marginTop: '12px',
    padding: '12px',
    background: '#fff3e0',
    borderRadius: '8px',
    fontSize: '14px',
    borderLeft: '3px solid #ff9800'
  },
  actions: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  deleteBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    color: '#d32f2f',
    background: '#ffebee',
    border: '1px solid #ef9a9a',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  noticeHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dismissBtn: {
    padding: '4px 8px',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    lineHeight: '1'
  },
  noNotices: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  noNoticesText: {
    fontSize: '18px',
    color: '#666',
    margin: '0 0 8px 0'
  },
  noNoticesSubtext: {
    fontSize: '14px',
    color: '#999',
    margin: 0
  },
};

export default StudentDashboard;