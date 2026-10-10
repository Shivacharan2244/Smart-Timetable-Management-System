import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated() && currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/faculty/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Check if redirected due to session expiration
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setErrorMessage('Your session has expired. Please sign in again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/faculty/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to connect to the authentication service. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <Calendar className="login-logo-icon" size={32} />
          </div>
          <h1 className="login-title">Smart Timetable Management System</h1>
          <p className="login-subtitle">Modern Academic Operations & Scheduling Command Center</p>
        </div>

        {errorMessage && (
          <div className="login-alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Institutional Email</label>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="e.g. admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-login"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading-flex">
                <span className="spinner-sm"></span>
                <span>Signing in...</span>
              </span>
            ) : (
              <span className="btn-text-flex">
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="login-demo-helper">
          <div className="demo-helper-title">
            <ShieldCheck size={14} />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleFillDemo('admin@gmail.com', 'admin123')}
            >
              <ShieldCheck size={13} className="text-cyan" />
              <span>Admin (admin@gmail.com)</span>
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleFillDemo('faculty@gmail.com', 'faculty123')}
            >
              <GraduationCap size={13} className="text-indigo" />
              <span>Faculty (faculty@gmail.com)</span>
            </button>
          </div>
        </div>

        <div className="login-footer-security">
          <span>Protected with BCrypt Hashing & JWT Authorization</span>
        </div>
      </div>
    </div>
  );
}
