import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [filterDept, setFilterDept] = useState('All');

  const departments = ['All', 'Academics', 'Hostel', 'Library', 'IT', 'Administration'];

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'In Progress': return '#2196F3';
      case 'Resolved': return '#4CAF50';
      default: return '#666';
    }
  };

  const filteredTickets = filterDept === 'All' 
    ? tickets 
    : tickets.filter(t => t.department === filterDept);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.welcome}>Welcome, {user.name}!</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.stats}>
        <div style={{...styles.statCard, borderLeft: '4px solid #667eea'}}>
          <h2>{analytics.total}</h2>
          <p>Total Tickets</p>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #ffa500'}}>
          <h2>{analytics.pending}</h2>
          <p>Pending</p>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #2196F3'}}>
          <h2>{analytics.inProgress}</h2>
          <p>In Progress</p>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #4CAF50'}}>
          <h2>{analytics.resolved}</h2>
          <p>Resolved</p>
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
        <h2>All Tickets {filterDept !== 'All' && `- ${filterDept}`}</h2>
        {filteredTickets.length === 0 ? (
          <p style={styles.noTickets}>No tickets found.</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.col1}>ID</div>
              <div style={styles.col2}>Title</div>
              <div style={styles.col3}>Student</div>
              <div style={styles.col4}>Department</div>
              <div style={styles.col5}>Status</div>
              <div style={styles.col6}>Date</div>
            </div>
            {filteredTickets.map(ticket => (
              <div key={ticket.id} style={styles.tableRow}>
                <div style={styles.col1}>#{ticket.id}</div>
                <div style={styles.col2}>
                  <strong>{ticket.title}</strong>
                  <p style={styles.description}>{ticket.description.substring(0, 80)}...</p>
                </div>
                <div style={styles.col3}>{ticket.studentName}</div>
                <div style={styles.col4}>
                  <span style={styles.deptBadge}>{ticket.department}</span>
                </div>
                <div style={styles.col5}>
                  <span style={{...styles.status, background: getStatusColor(ticket.status)}}>
                    {ticket.status}
                  </span>
                </div>
                <div style={styles.col6}>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.deptBreakdown}>
        <h2>Department Breakdown</h2>
        <div style={styles.deptGrid}>
          {['Academics', 'Hostel', 'Library', 'IT', 'Administration'].map(dept => {
            const deptTickets = tickets.filter(t => t.department === dept);
            const pending = deptTickets.filter(t => t.status === 'Pending').length;
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
                    <strong style={{color: '#ffa500'}}>{pending}</strong>
                    <p>Pending</p>
                  </div>
                  <div>
                    <strong style={{color: '#4CAF50'}}>{resolved}</strong>
                    <p>Resolved</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: { color: '#667eea', marginBottom: '5px', fontSize: '32px' },
  welcome: { color: '#666' },
  logoutBtn: {
    padding: '10px 20px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
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
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  filterSection: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: { fontWeight: 'bold', fontSize: '16px' },
  select: {
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  ticketsSection: { marginBottom: '40px' },
  noTickets: { textAlign: 'center', color: '#999', padding: '40px' },
  table: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  tableHeader: {
    display: 'flex',
    background: '#667eea',
    color: 'white',
    padding: '15px',
    fontWeight: 'bold'
  },
  tableRow: {
    display: 'flex',
    padding: '15px',
    borderBottom: '1px solid #eee',
    alignItems: 'center'
  },
  col1: { flex: '0 0 60px' },
  col2: { flex: '1' },
  col3: { flex: '0 0 150px' },
  col4: { flex: '0 0 130px' },
  col5: { flex: '0 0 120px' },
  col6: { flex: '0 0 120px' },
  description: { 
    fontSize: '14px', 
    color: '#666', 
    marginTop: '5px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  deptBadge: {
    padding: '5px 10px',
    background: '#f0f0f0',
    borderRadius: '5px',
    fontSize: '14px'
  },
  status: {
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  deptBreakdown: { marginTop: '40px' },
  deptGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  deptCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  deptStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '15px',
    textAlign: 'center'
  }
};

export default AdminDashboard;