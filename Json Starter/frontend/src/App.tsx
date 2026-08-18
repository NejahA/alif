import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import { Toaster as HotToaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/api-docs" element={<Navigate to="http://localhost:4000/api-docs" replace />} />
        <Route path="/health" element={<Navigate to="http://localhost:4000/health" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <HotToaster position="top-right" />
    </div>
  );
}

export default App;