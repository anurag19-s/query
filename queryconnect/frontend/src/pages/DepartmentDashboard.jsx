import { useState, useEffect } from 'react';
import axios from 'axios';

function DepartmentDashboard({ user, onLogout }) {
  // ✅ TWO-STEP SECURITY: First verify department access
  const [isVerified, setIsVerified] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotices, setShowNotices] = useState(true);

  // Department codes for verification (matches your backend)
  const DEPARTMENT_CODES = {
    'IT': 'IT-DEPT-2025',
    'Hostel': 'HOSTEL-DEPT-2025',
    'Academics': 'ACADEMICS-DEPT-2025',
    'Library': 'LIBRARY-DEPT-2025',
    'Sports': 'SPORTS-DEPT-2025',
    'Administration': 'ADMIN-DEPT-2025',
    'Transport': 'TRANSPORT-DEPT-2025'
  };

  // ✅ STEP 1: Verify department access with security code
  const handleVerification = () => {
    if (!selectedDepartment) {
      setVerificationError('Please select a department');
      return;
    }

    if (!securityCode) {
      setVerificationError('Please enter security code');
      return;
    }

    // Check if code matches department
    if (DEPARTMENT_CODES[selectedDepartment] === securityCode) {
      setIsVerified(true);
      setVerificationError('');
      fetchDepartmentTickets(selectedDepartment);
      fetchNotifications();
    } else {
      setVerificationError('Invalid security code for this department');
    }
  };

  // ✅ STEP 2: Fetch tickets for verified department only
  const fetchDepartmentTickets = async (department) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter tickets for this specific department only
      const deptTickets = response.data.filter(
        ticket => ticket.department === department
      );

      setTickets(deptTickets);
      setFilteredTickets(deptTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

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

  // Update ticket status
  const handleStatusUpdate = async (ticketId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchDepartmentTickets(selectedDepartment);
      alert(`Ticket status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };
  // Update ticket priority
  const handlePriorityUpdate = async (ticketId, priority) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}`,
        { priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchDepartmentTickets(selectedDepartment);
      alert(`Ticket priority updated to: ${priority}`);
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  // Add comment to ticket
  const handleAddComment = async (ticketId) => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/tickets/${ticketId}/comments`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComment('');
      fetchDepartmentTickets(selectedDepartment);
      setSelectedTicket(null);
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  // Filter by status
  const filterByStatus = (status) => {
    if (status === 'all') {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(t => t.status === status));
    }
  };

  // Get status badge color
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
      case 'High': return '#dc2626';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#666';
    }
  };

  // ✅ SECURITY GATE: Show verification form first
  if (!isVerified) {
    return (
      <div style={styles.verificationContainer}>
        <div style={styles.verificationCard}>
          <div style={styles.lockIcon}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 style={styles.verificationTitle}>Department Verification</h1>
          <p style={styles.verificationSubtitle}>Verify your department access</p>
          <p style={styles.loggedInAs}>Logged in as: <strong>{user.name}</strong></p>

          {verificationError && (
            <div style={styles.errorBox}>{verificationError}</div>
          )}

          <div style={styles.verificationForm}>
            <label style={styles.label}>Select Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={styles.select}
            >
              <option value="">Choose Department...</option>
              <option value="IT">IT Department</option>
              <option value="Hostel">Hostel Department</option>
              <option value="Academics">Academics Department</option>
              <option value="Administration">Administration Department</option>
              <option value="Library">Library Department</option>
              <option value="Sports">Sports Department</option>
              <option value="Transport">Transport Department</option>
            </select>

            <label style={styles.label}>Security Code</label>
            <input
              type="text"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Enter department security code"
              style={styles.input}
            />

            <button onClick={handleVerification} style={styles.verifyBtn}>
              Verify & Access Dashboard
            </button>

            <button onClick={onLogout} style={styles.logoutBtnAlt}>
              Logout
            </button>
          </div>

          <div style={styles.codesReference}>
            <p style={styles.codesTitle}>Department Security Codes:</p>
            <ul style={styles.codesList}>
              <li>• IT: IT-DEPT-2025</li>
              <li>• Hostel: HOSTEL-DEPT-2025</li>
              <li>• Academics: ACADEMICS-DEPT-2025</li>
              <li>• Library: LIBRARY-DEPT-2025</li>
              <li>• Sports: SPORTS-DEPT-2025</li>
              <li>• Administration: ADMIN-DEPT-2025</li>
              <li>• Transport: TRANSPORT-DEPT-2025</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ✅ VERIFIED: Show department dashboard
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{selectedDepartment} Department Dashboard</h1>
          <p style={styles.welcome}>Welcome, {user.name} ({user.email})</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{tickets.length}</h3>
          <p style={styles.statLabel}>Total Tickets</p>
        </div>
        <div style={{ ...styles.statCard, background: '#fef3c7' }}>
          <h3 style={{ ...styles.statNumber, color: '#f59e0b' }}>
            {tickets.filter(t => t.status === 'Pending').length}
          </h3>
          <p style={styles.statLabel}>Pending</p>
        </div>
        <div style={{ ...styles.statCard, background: '#dbeafe' }}>
          <h3 style={{ ...styles.statNumber, color: '#2196F3' }}>
            {tickets.filter(t => t.status === 'In Progress').length}
          </h3>
          <p style={styles.statLabel}>In Progress</p>
        </div>
        <div style={{ ...styles.statCard, background: '#d1fae5' }}>
          <h3 style={{ ...styles.statNumber, color: '#10b981' }}>
            {tickets.filter(t => t.status === 'Resolved').length}
          </h3>
          <p style={styles.statLabel}>Resolved</p>
        </div>
      </div>
      {/* Notice Board */}

      {/* Notice Board */}
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
                <p style={styles.noNoticesSubtext}>Department updates will appear here</p>
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

      {/* Filter Buttons */}
      <div style={styles.filterSection}>
        <button onClick={() => filterByStatus('all')} style={styles.filterBtn}>
          All Tickets
        </button>
        <button onClick={() => filterByStatus('Pending')} style={{ ...styles.filterBtn, background: '#fef3c7', color: '#f59e0b' }}>
          Pending
        </button>
        <button onClick={() => filterByStatus('In Progress')} style={{ ...styles.filterBtn, background: '#dbeafe', color: '#2196F3' }}>
          In Progress
        </button>
        <button onClick={() => filterByStatus('Resolved')} style={{ ...styles.filterBtn, background: '#d1fae5', color: '#10b981' }}>
          Resolved
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={styles.loadingBox}>
          <p>Loading tickets...</p>
        </div>
      )}

      {/* No Tickets */}
      {!loading && filteredTickets.length === 0 && (
        <div style={styles.noTickets}>
          <p>No tickets assigned to {selectedDepartment} department yet.</p>
        </div>
      )}

      {/* Tickets List */}
      {!loading && filteredTickets.length > 0 && (
        <div style={styles.ticketsSection}>
          {filteredTickets.map((ticket) => (
            <div key={ticket._id} style={styles.ticket}>
              <div style={styles.ticketHeader}>
                <div>
                  <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                  <p style={styles.studentName}>By: {ticket.studentName || 'Unknown'}</p>
                </div>
                <span style={{ ...styles.status, background: getStatusColor(ticket.status) }}>
                  {ticket.status}
                </span>
              </div>

              <p style={styles.description}>{ticket.description}</p>

              {ticket.aiSuggestion && (
                <div style={styles.aiBox}>
                  <strong>AI Suggestion:</strong> {ticket.aiSuggestion}
                </div>
              )}

              <div style={styles.ticketMeta}>
                <span>Priority: <strong style={{ color: getPriorityColor(ticket.priority) }}>{ticket.priority}</strong></span>
                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              <div style={styles.actionSection}>
                <div style={styles.updateControls}>
                  <div style={styles.statusUpdate}>
                    <label style={styles.smallLabel}>Update Status:</label>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div style={styles.priorityUpdate}>
                    <label style={styles.smallLabel}>Update Priority:</label>
                    <select
                      value={ticket.priority}
                      onChange={(e) => handlePriorityUpdate(ticket._id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        borderColor: getPriorityColor(ticket.priority),
                        color: getPriorityColor(ticket.priority),
                        fontWeight: 'bold'
                      }}
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                    </select>
                  </div>
                </div>

                {selectedTicket === ticket._id ? (
                  <div style={styles.commentBox}>
                    <label style={styles.smallLabel}>Add Comment / Solution:</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add notes, updates, or solution details..."
                      style={styles.textarea}
                      rows="4"
                    />
                    <div style={styles.commentButtons}>
                      <button onClick={() => handleAddComment(ticket._id)} style={styles.submitBtn}>
                        Submit Comment
                      </button>
                      <button onClick={() => {
                        setSelectedTicket(null);
                        setComment('');
                      }} style={styles.cancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSelectedTicket(ticket._id)} style={styles.addCommentBtn}>
                    Add Comment
                  </button>
                )}
              </div>

              {/* Display existing comments */}
              {ticket.comments && ticket.comments.length > 0 && (
                <div style={styles.commentsSection}>
                  <strong style={styles.commentsTitle}>Comments History:</strong>
                  {ticket.comments.map((c, idx) => (
                    <div key={idx} style={styles.comment}>
                      <p style={styles.commentText}>
                        <strong>{c.by}</strong> ({c.role}): {c.text}
                      </p>
                      <p style={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  // Verification Screen Styles
  verificationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  verificationCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    maxWidth: '450px',
    width: '100%',
    padding: '40px',
    textAlign: 'center'
  },
  lockIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  verificationTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  verificationSubtitle: {
    color: '#666',
    marginBottom: '10px'
  },
  loggedInAs: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '20px'
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  verificationForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px'
  },
  label: {
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#374151',
    fontSize: '14px',
    marginBottom: '-10px'
  },
  select: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none'
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none'
  },
  verifyBtn: {
    padding: '14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  logoutBtnAlt: {
    padding: '12px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  codesReference: {
    background: '#f3f4f6',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'left'
  },
  codesTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '10px'
  },
  codesList: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
    paddingLeft: '20px',
    listStyle: 'none'
  },

  // Dashboard Styles
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: { color: '#667eea', marginBottom: '5px', fontSize: '24px' },
  welcome: { color: '#666', fontSize: '14px' },
  headerButtons: { display: 'flex', gap: '10px' },
  switchBtn: {
    padding: '10px 20px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statNumber: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#667eea' },
  statLabel: { color: '#666', fontSize: '14px', margin: 0 },
  filterSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    background: 'white',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  filterBtn: {
    padding: '10px 20px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  loadingBox: {
    background: 'white',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  noTickets: {
    background: 'white',
    padding: '40px',
    textAlign: 'center',
    color: '#999',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  ticketsSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  ticket: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  ticketTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' },
  studentName: { color: '#999', fontSize: '13px', margin: 0 },
  status: {
    padding: '6px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  description: { color: '#666', marginBottom: '15px', lineHeight: '1.6' },
  aiBox: {
    background: '#f0f9ff',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    borderLeft: '3px solid #2196F3'
  },
  ticketMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e5e7eb'
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  statusUpdate: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  smallLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#374151'
  },
  statusSelect: {
    padding: '8px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  commentBox: {
    background: '#f9fafb',
    padding: '15px',
    borderRadius: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginTop: '10px',
    marginBottom: '10px',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  commentButtons: {
    display: 'flex',
    gap: '10px'
  },
  submitBtn: {
    flex: 1,
    padding: '10px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  addCommentBtn: {
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  commentsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  commentsTitle: {
    display: 'block',
    marginBottom: '10px',
    color: '#374151',
    fontSize: '14px'
  },
  comment: {
    background: '#eff6ff',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '10px',
    borderLeft: '3px solid #667eea'
  },
  commentText: {
    fontSize: '14px',
    color: '#333',
    margin: '0 0 5px 0'
  },
  commentDate: {
    fontSize: '12px',
    color: '#999',
    margin: 0
  },
  noticeBoard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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

export default DepartmentDashboard;