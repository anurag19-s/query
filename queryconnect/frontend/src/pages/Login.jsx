import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const payload = isRegister
        ? { email, password, name }
        : { email, password };

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        payload
      );

      if (isRegister) {
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setName('');
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);

        // Redirect based on role
        if (response.data.user.role === 'student') {
          navigate('/student');
        } else if (response.data.user.role === 'department') {
          navigate('/department');
        } else if (response.data.user.role === 'admin') {
          navigate('/admin');
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'An error occurred'
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>QueryConnect</h1>
        <p style={styles.subtitle}>
          {isRegister ? 'Create Account' : 'Welcome back!'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.primaryButton}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p style={styles.switchText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            style={styles.link}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setName('');
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>

        <p style={styles.switchText}>
          Or{' '}
          <span
            style={styles.link}
            onClick={() => navigate('/guest')}
          >
            continue as guest
          </span>
        </p>

        {/* Test Accounts */}
        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>🧪 Test Accounts:</p>
          <p style={styles.infoItem}>👨‍🎓 Student: ankush.mahadole.mca25@mespune.in / 123456</p>
          <p style={styles.infoItem}>👨‍🎓 Student: test.student.mca25@mespune.in / 123456</p>
          <p style={styles.infoItem}>💻 IT Dept: it@mespune.in / 123456</p>
          <p style={styles.infoItem}>📚 Academics: academics@mespune.in / 123456</p>
          <p style={styles.infoItem}>🏠 Hostel: hostel@mespune.in / 123456</p>
          <p style={styles.infoItem}>📖 Library: library@mespune.in / 123456</p>
          <p style={styles.infoItem}>🏛️ Administration: administration@mespune.in / 123456</p>
          <p style={styles.infoItem}>⚽ Sports: sports@mespune.in / 123456</p>
          <p style={styles.infoItem}>🚌 Transport: transport@mespune.in / 123456</p>
          <p style={styles.infoItem}>👑 Admin: admin@mespune.in / 123456</p>

          <p style={{ ...styles.infoTitle, marginTop: 8 }}>ℹ️ Registration Info:</p>
          <p style={styles.infoItem}>
            <strong>Students:</strong> Use your college email (name.mca25@mespune.in)
          </p>
          <p style={styles.infoItem}>
            <strong>Department Staff:</strong> Use your official department email
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px 28px 24px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    textAlign: 'center',
    margin: 0,
    color: '#4f46e5',
  },
  subtitle: {
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '6px',
    marginBottom: '20px',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  primaryButton: {
    marginTop: '6px',
    width: '100%',
    padding: '10px 12px',
    borderRadius: '9999px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#4f46e5',
    cursor: 'pointer',
  },
  switchText: {
    marginTop: '14px',
    fontSize: '13px',
    textAlign: 'center',
    color: '#6b7280',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600',
    cursor: 'pointer',
  },
  infoBox: {
    marginTop: '18px',
    padding: '10px 12px',
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
    border: '1px dashed #e5e7eb',
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px',
  },
  infoItem: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '2px',
  },
};

export default Login;