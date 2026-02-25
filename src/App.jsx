import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { AppProvider } from './context/AppContext';
import { initializeAdMob } from './utils/adService';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import Profile from './pages/Profile';
import Settlements from './pages/Settlements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import splashScreenImg from '../assets/splash.png';

// Protect routes that require authentication and wrap them in the persistent Layout
const ProtectedLayout = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user isn't a mock user and hasn't verified their email, kick them out to login.
  // We use user.isAnonymous or email as heuristic for mock users since they might not have emailVerified.
  const isMockUser = user.uid === 'test-user-id' || user.uid === 'demo-user-id';
  if (!isMockUser && user.emailVerified === false) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    initializeAdMob();

    // Show splash screen
    const timer = setTimeout(() => setSplashFinished(true), 1500);

    // Check for our local test bypass first
    const mockUser = sessionStorage.getItem('MOCK_FIREBASE_USER');
    if (mockUser) {
      try {
        setUser(JSON.parse(mockUser));
        setLoading(false);
        return; // Don't setup Firebase listener if mocked
      } catch (e) {
        console.error("Mock parse error", e);
      }
    }

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (loading || !splashFinished) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: '#0a0e1a', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <img src={splashScreenImg} alt="CoBill Yükleniyor" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  return (
    <AppProvider user={user}>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />

          {/* Protected Routes mapped inside a persistent Layout to prevent UI stutter/flashes */}
          <Route element={<ProtectedLayout user={user} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/group/:groupId" element={<GroupDetail />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
