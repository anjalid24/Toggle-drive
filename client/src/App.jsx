import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Drive from './pages/Drive.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SharedFile from './pages/SharedFile.jsx';
import Layout from './components/Layout.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user && !loading ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user && !loading ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route path="/share/:token" element={<SharedFile />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Drive />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
