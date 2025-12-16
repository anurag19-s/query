import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GuestTicket from './pages/GuestTicket';
import TrackTicket from './pages/TrackTicket';

// Auth Check Wrapper Component
function AuthCheck({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Public routes: /, /guest, /track, /track/:id
    const publicRoutes = ['/', '/guest', '/track'];
    const isTrackRoute = location.pathname.startsWith('/track');
    const isPublicRoute = publicRoutes.includes(location.pathname) || isTrackRoute;

    if (!user && !isPublicRoute) {
      console.log('No user found, redirecting to login from:', location.pathname);
      navigate('/', { replace: true });
    }
  }, [user, location, navigate]);

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User loaded from localStorage:', parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No user in localStorage');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      console.log('ProtectedRoute: No user, redirecting to login');
      return <Navigate to="/" replace />;
    }
    
    if (!allowedRoles.includes(user.role)) {
      console.log(`ProtectedRoute: Access denied - User role is ${user.role}`);
      return <Navigate to="/" replace />;
    }
    
    console.log(`ProtectedRoute: Access granted for ${user.role}`);
    return children;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px',
        color: '#667eea'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthCheck user={user}>
        <Routes>
          {/* Public Routes */}
          <Route path="/guest" element={<GuestTicket />} />
          <Route path="/track" element={<TrackTicket />} />
          <Route path="/track/:id" element={<TrackTicket />} />

          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'student' ? <Navigate to="/student" replace /> :
                user.role === 'department' ? <Navigate to="/department" replace /> :
                user.role === 'admin' ? <Navigate to="/admin" replace /> :
                <Navigate to="/" replace />
              ) : (
                <Login setUser={setUser} />
              )
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/department"
            element={
              <ProtectedRoute allowedRoles={['department']}>
                <DepartmentDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthCheck>
    </BrowserRouter>
  );
}

export default App;