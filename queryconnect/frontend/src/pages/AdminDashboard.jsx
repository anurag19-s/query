import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [filterDept, setFilterDept] = useState('All');
  const [expandedTickets, setExpandedTickets] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [reassignModal, setReassignModal] = useState({ show: false, ticketId: null, currentDept: '' });
  const [newDepartment, setNewDepartment] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeAudience, setNoticeAudience] = useState('student');
  const [noticeDepartment, setNoticeDepartment] = useState('All');
  const [noticeTicketId, setNoticeTicketId] = useState('');

  const departments = ['All', 'Academics', 'Hostel', 'Library', 'IT', 'Administration', 'Sports', 'Transport'];

  useEffect(() => {
    fetchTickets();
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      fetchAnalytics(); // Refresh analytics after deletion
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update ticket in UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      alert(`Ticket status changed to ${newStatus}`);
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Status change error:', error);
      alert(error.response?.data?.message || 'Failed to change status');
    }
  };
  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}`,
        { priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === ticketId ? { ...ticket, priority: newPriority } : ticket
        )
      );

      alert(`Ticket priority changed to ${newPriority}`);
    } catch (error) {
      console.error('Priority change error:', error);
      alert(error.response?.data?.message || 'Failed to change priority');
    }
  };

  const openReassignModal = (ticketId, currentDept) => {
    setReassignModal({ show: true, ticketId, currentDept });
    setNewDepartment(currentDept);
  };

  const closeReassignModal = () => {
    setReassignModal({ show: false, ticketId: null, currentDept: '' });
    setNewDepartment('');
  };

  const handleReassign = async () => {
    if (newDepartment === reassignModal.currentDept) {
      alert('Please select a different department');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${reassignModal.ticketId}`,
        {
          department: newDepartment,
          status: 'Pending' // Reset status to Pending when reassigning
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update ticket in UI
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === reassignModal.ticketId
            ? { ...ticket, department: newDepartment, status: 'Pending' }
            : ticket
        )
      );

      alert(`Ticket reassigned to ${newDepartment} department`);
      closeReassignModal();
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Reassign error:', error);
      alert(error.response?.data?.message || 'Failed to reassign ticket');
    }
  };
  const sendNotification = async () => {
    if (!noticeTitle || !noticeMessage) {
      alert('Title and message are required');
      return;
    }

    // Validate ticket ID if audience is student
    if (noticeAudience === 'student' && !noticeTicketId) {
      alert('Ticket ID is required to send notification to a specific student');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const body = {
        title: noticeTitle,
        message: noticeMessage,
        audience: noticeAudience,
      };

      // If sending to student, ticket ID is mandatory to identify the student
      if (noticeAudience === 'student') {
        body.ticketId = noticeTicketId;
      }

      // If sending to department
      if (noticeAudience === 'department' && noticeDepartment !== 'All') {
        body.department = noticeDepartment;
      }

      // If sending to both
      if (noticeAudience === 'both') {
        // Optional: can attach to a ticket or send general
        if (noticeTicketId) {
          body.ticketId = noticeTicketId;
        }
        if (noticeDepartment !== 'All') {
          body.department = noticeDepartment;
        }
      }

      await axios.post('http://localhost:5000/api/notifications', body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Notification sent successfully!');
      setNoticeTitle('');
      setNoticeMessage('');
      setNoticeTicketId('');
      setNoticeAudience('student');
      setNoticeDepartment('All');
    } catch (error) {
      console.error('Notification error:', error);
      alert(error.response?.data?.message || 'Failed to send notification');
    }
  };
  const toggleTicketExpand = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const toggleComments = (ticketId) => {
    setExpandedComments(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'In Progress': return '#2196F3';
      case 'Resolved': return '#4CAF50';
      case 'Closed': return '#666';
      default: return '#666';
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

  const filteredTickets = filterDept === 'All'
    ? tickets
    : tickets.filter(t => t.department === filterDept);

  return (
    <div style={styles.container}>
      {/* Reassign Modal */}
      {reassignModal.show && (
        <div style={styles.modalOverlay} onClick={closeReassignModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Reassign Ticket</h2>
            <p style={styles.modalText}>
              Current Department: <strong>{reassignModal.currentDept}</strong>
            </p>
            <label style={styles.label}>Select New Department:</label>
            <select
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              style={styles.select}
            >
              {departments.filter(d => d !== 'All').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeReassignModal}>
                Cancel
              </button>
              <button style={styles.confirmBtn} onClick={handleReassign}>
                Reassign Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.welcome}>Welcome, {user.name}!</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.stats}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #667eea' }}>
          <h2>{analytics.total}</h2>
          <p>Total Tickets</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #ffa500' }}>
          <h2>{analytics.pending}</h2>
          <p>Pending</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #2196F3' }}>
          <h2>{analytics.inProgress}</h2>
          <p>In Progress</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #4CAF50' }}>
          <h2>{analytics.resolved}</h2>
          <p>Resolved</p>
        </div>
      </div>
      <div style={styles.deptBreakdown}>
        <h2>Department Breakdown</h2>
        <div style={styles.deptGrid}>
          {['Academics', 'Hostel', 'Library', 'IT', 'Administration', 'Sports', 'Transport'].map(dept => {
            const deptTickets = tickets.filter(t => t.department === dept);
            const pending = deptTickets.filter(t => t.status === 'Pending').length;
            const inProgress = deptTickets.filter(t => t.status === 'In Progress').length;
            const resolved = deptTickets.filter(t => t.status === 'Resolved').length;

            return (
              <div key={dept} style={styles.deptCard}>
                <h3>{dept}</h3>
                <div style={styles.deptStats}>
                  <div>
                    <strong>{deptTickets.length}</strong>
                    <p>Total</p>
                  </div>
                  <div>
                    <strong style={{ color: '#ffa500' }}>{pending}</strong>
                    <p>Pending</p>
                  </div>
                  <div>
                    <strong style={{ color: '#2196F3' }}>{inProgress}</strong>
                    <p>In Progress</p>
                  </div>
                  <div>
                    <strong style={{ color: '#4CAF50' }}>{resolved}</strong>
                    <p>Resolved</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Notification Sender */}
      <div style={styles.notificationSection}>
        <h2>📢 Send Notification</h2>
        <div style={styles.notificationForm}>
          <input
            type="text"
            placeholder="Notification Title"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="Notification Message"
            value={noticeMessage}
            onChange={(e) => setNoticeMessage(e.target.value)}
            style={styles.textarea}
            rows="3"
          />
          <div style={styles.notificationControls}>
            <div>
              <label style={styles.label}>Audience:</label>
              <select
                value={noticeAudience}
                onChange={(e) => setNoticeAudience(e.target.value)}
                style={styles.select}
              >
                <option value="student">Specific Student (via Ticket)</option>
                <option value="department">Department</option>
                <option value="both">All (Students & Departments)</option>
              </select>
            </div>


            {/* Show Ticket ID field for student audience */}
            {noticeAudience === 'student' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Ticket ID (Required)</label>
                <input
                  type="text"
                  placeholder="Enter ticket ID to notify student"
                  value={noticeTicketId}
                  onChange={e => setNoticeTicketId(e.target.value)}
                  style={styles.input}
                  required
                />
                <span style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  The student who created this ticket will receive the notification.
                </span>
              </div>
            )}


            {/* Show Department field for department audience */}
            {noticeAudience === 'department' && (
              <div>
                <label style={styles.label}>Department:</label>
                <select
                  value={noticeDepartment}
                  onChange={(e) => setNoticeDepartment(e.target.value)}
                  style={styles.select}
                >
                  {departments.filter(d => d !== 'All').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Show optional fields for 'both' audience */}
            {noticeAudience === 'both' && (
              <>
                <div>
                  <label style={styles.label}>Ticket ID (Optional):</label>
                  <input
                    type="text"
                    placeholder="Optional - link to a ticket"
                    value={noticeTicketId}
                    onChange={(e) => setNoticeTicketId(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Department Filter (Optional):</label>
                  <select
                    value={noticeDepartment}
                    onChange={(e) => setNoticeDepartment(e.target.value)}
                    style={styles.select}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <button onClick={sendNotification} style={styles.sendNotificationBtn}>
            Send Notification
          </button>
        </div>
      </div>

      <div style={styles.filterSection}>
        <label style={styles.label}>Filter by Department:</label>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          style={styles.select}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div style={styles.ticketsSection}>
        <h2>All Tickets ({filteredTickets.length}) {filterDept !== 'All' && `- ${filterDept}`}</h2>
        {filteredTickets.length === 0 ? (
          <p style={styles.noTickets}>No tickets found.</p>
        ) : (
          <div style={styles.ticketsList}>
            {filteredTickets.map(ticket => (
              <div key={ticket._id} style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                  <div style={styles.ticketHeaderLeft}>
                    <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                    <div style={styles.ticketMeta}>
                      <span>👤 {ticket.studentName || 'Guest User'}</span>
                      <span>🏢 {ticket.department}</span>
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <button
                        style={styles.copyIdBtn}
                        onClick={() => {
                          navigator.clipboard.writeText(ticket._id);
                          alert('Ticket ID copied!');
                        }}
                      >
                        📋 Copy Ticket ID
                      </button>
                    </div>
                  </div>
                  <div style={styles.headerRight}>
                    <div style={styles.badges}>
                      <span style={{ ...styles.status, background: getStatusColor(ticket.status) }}>
                        {ticket.status}
                      </span>
                      {ticket.priority && (
                        <span style={{ ...styles.priority, background: getPriorityColor(ticket.priority) }}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <div style={styles.statusControl}>
                      <label style={styles.statusLabel}>Change Status:</label>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div style={styles.statusControl}>
                      <label style={styles.statusLabel}>Priority:</label>
                      <select
                        value={ticket.priority || 'None'}
                        onChange={(e) => handlePriorityChange(ticket._id, e.target.value === 'None' ? null : e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="None">None</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <p style={styles.description}>
                  {expandedTickets[ticket._id]
                    ? ticket.description
                    : `${ticket.description.substring(0, 150)}${ticket.description.length > 150 ? '...' : ''}`}
                </p>

                {ticket.description.length > 150 && (
                  <button
                    style={styles.expandBtn}
                    onClick={() => toggleTicketExpand(ticket._id)}
                  >
                    {expandedTickets[ticket._id] ? '▲ Show Less' : '▼ Show More'}
                  </button>
                )}

                {ticket.aiSuggestion && (
                  <div style={styles.aiSuggestionBox}>
                    <strong>🤖 AI Suggested:</strong> {ticket.aiSuggestion}
                  </div>
                )}

                {/* Comments Section */}
                {ticket.comments && ticket.comments.length > 0 && (
                  <div style={styles.commentsSection}>
                    <div style={styles.latestCommentBox}>
                      <strong style={styles.commentLabel}>
                        💬 Latest Update from {ticket.comments[ticket.comments.length - 1].by}:
                      </strong>
                      <p style={styles.commentText}>
                        {ticket.comments[ticket.comments.length - 1].text}
                      </p>
                      <span style={styles.commentMeta}>
                        {ticket.comments[ticket.comments.length - 1].role} •
                        {new Date(ticket.comments[ticket.comments.length - 1].createdAt).toLocaleString()}
                      </span>

                      {/* Show expand button if there are older comments */}
                      {ticket.comments.length > 1 && !expandedComments[ticket._id] && (
                        <button
                          type="button"
                          style={styles.expandCommentsBtn}
                          onClick={() => toggleComments(ticket._id)}
                        >
                          +{ticket.comments.length - 1} more comment{ticket.comments.length - 1 > 1 ? 's' : ''}
                        </button>
                      )}

                      {/* Show all older comments when expanded */}
                      {ticket.comments.length > 1 && expandedComments[ticket._id] && (
                        <div style={styles.olderCommentsContainer}>
                          <div style={styles.olderCommentsHeader}>
                            <strong>Previous Comments:</strong>
                            <button
                              type="button"
                              style={styles.collapseBtn}
                              onClick={() => toggleComments(ticket._id)}
                            >
                              ▲ Collapse
                            </button>
                          </div>
                          {ticket.comments.slice(0, -1).map((comment, idx) => (
                            <div key={idx} style={styles.olderComment}>
                              <div style={styles.olderCommentHeader}>
                                <strong>{comment.by}</strong>
                                <span style={styles.olderCommentRole}>({comment.role})</span>
                              </div>
                              <p style={styles.olderCommentText}>{comment.text}</p>
                              <span style={styles.olderCommentMeta}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    style={styles.reassignBtn}
                    onClick={() => openReassignModal(ticket._id, ticket.department)}
                  >
                    🔄 Reassign Department
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(ticket._id)}
                  >
                    🗑️ Delete Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
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
  title: { color: '#667eea', marginBottom: '5px', fontSize: '32px' },
  welcome: { color: '#666' },
  logoutBtn: {
    padding: '10px 20px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  filterSection: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'white',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  label: { fontWeight: 'bold', fontSize: '16px' },
  select: {
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  ticketsSection: { marginBottom: '40px' },
  noTickets: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    background: 'white',
    borderRadius: '10px'
  },
  ticketsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  ticketCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    gap: '15px'
  },
  ticketHeaderLeft: {
    flex: 1
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-end'
  },
  statusControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  statusSelect: {
    padding: '6px 10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  ticketTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    color: '#333'
  },
  ticketMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '14px',
    color: '#666',
    flexWrap: 'wrap'
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
    lineHeight: '1.6',
    fontSize: '15px',
    marginBottom: '10px'
  },
  expandBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    color: '#667eea',
    background: 'transparent',
    border: '1px solid #667eea',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    marginBottom: '10px'
  },
  aiSuggestionBox: {
    marginTop: '12px',
    padding: '12px',
    background: '#fff3e0',
    borderRadius: '8px',
    fontSize: '14px',
    borderLeft: '3px solid #ff9800'
  },
  commentsSection: {
    marginTop: '15px'
  },
  latestCommentBox: {
    padding: '12px',
    background: '#e3f2fd',
    borderRadius: '8px',
    fontSize: '14px',
    borderLeft: '3px solid #2196F3'
  },
  commentLabel: {
    display: 'block',
    marginBottom: '6px',
    color: '#1565c0'
  },
  commentText: {
    margin: '6px 0',
    color: '#424242',
    lineHeight: '1.5'
  },
  commentMeta: {
    fontSize: '12px',
    color: '#757575',
    fontStyle: 'italic'
  },
  expandCommentsBtn: {
    marginTop: '10px',
    padding: '6px 12px',
    fontSize: '12px',
    color: '#1976d2',
    background: 'transparent',
    border: '1px solid #90caf9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    display: 'block'
  },
  olderCommentsContainer: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #90caf9'
  },
  olderCommentsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    color: '#1565c0'
  },
  collapseBtn: {
    padding: '4px 10px',
    fontSize: '11px',
    color: '#1976d2',
    background: 'transparent',
    border: '1px solid #90caf9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  olderComment: {
    background: '#f5f9ff',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '8px',
    borderLeft: '2px solid #64b5f6'
  },
  olderCommentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  olderCommentRole: {
    fontSize: '12px',
    color: '#757575',
    fontStyle: 'italic'
  },
  olderCommentText: {
    margin: '4px 0',
    color: '#424242',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  olderCommentMeta: {
    fontSize: '11px',
    color: '#999',
    fontStyle: 'italic'
  },
  actions: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  reassignBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    color: '#1976d2',
    background: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s'
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    minWidth: '400px',
    maxWidth: '500px'
  },
  modalTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '24px'
  },
  modalText: {
    marginBottom: '20px',
    color: '#666',
    fontSize: '15px'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '25px'
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  confirmBtn: {
    padding: '10px 20px',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  deptBreakdown: {
    marginTop: '40px',
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  deptGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  deptCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0'
  },
  deptStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '15px',
    textAlign: 'center'
  },
  notificationSection: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  notificationForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px'
  },
  notificationControls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  sendNotificationBtn: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px'
  },
  copyIdBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    color: '#667eea',
    background: '#f0f4ff',
    border: '1px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none'
  },
  textarea: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none'
  },
};

export default AdminDashboard;