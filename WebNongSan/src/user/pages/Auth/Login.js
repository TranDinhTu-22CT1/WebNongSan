import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { authAPI } from '../../api/apiClient';
import { setAuthSession } from '../../utils/authStorage';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  const requestedRedirect = new URLSearchParams(location.search).get('redirect') || '/';
  const safeRedirect = requestedRedirect.startsWith('/') ? requestedRedirect : '/';

  const getLockoutMessage = (seconds) => `He thong tam gioi han dang nhap. Vui long thu lai sau ${seconds}s.`;

  useEffect(() => {
    if (lockSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setLockSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (lockSeconds > 0) {
      setError(getLockoutMessage(lockSeconds));
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login(email, password, rememberMe);
      const normalizedRole = String(response?.user?.role || '').toLowerCase();
      
      // Verify response has required fields
      if (!response.token || !response.user) {
        throw new Error('Phản hồi đăng nhập không hợp lệ: thiếu token hoặc user data');
      }
      
      setAuthSession({
        token: response.token,
        user: { ...response.user, role: normalizedRole || response.user?.role },
        rememberMe,
      });
      
      // Dispatch login event - gives all other components time to update
      setTimeout(() => {
        window.dispatchEvent(new Event('login'));
        setLoading(false);
        alert('Đăng nhập thành công!');

        if (normalizedRole === 'admin') {
          navigate('/admin/panel');
          return;
        }

        if (normalizedRole === 'vendor') {
          navigate('/vendor/dashboard');
          return;
        }

        navigate(safeRedirect);
      }, 100);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      if (Number(err?.retryAfter) > 0) {
        setLockSeconds(Number(err.retryAfter));
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            Agri<span>Market</span>
          </div>
          <h2 className="auth-title">Chào mừng trở lại!</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục mua sắm nông sản tươi sạch</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
          
          <div className="form-control">
            <label>Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-control">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {showPassword ? (
                <FiEyeOff className="password-toggle" onClick={() => setShowPassword(false)} />
              ) : (
                <FiEye className="password-toggle" onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'} <FiLogIn />
          </button>
          {lockSeconds > 0 && (
            <div className="lockout-hint">{getLockoutMessage(lockSeconds)}</div>
          )}
        </form>

        <div className="social-login">
          <div className="social-divider">Hoặc đăng nhập bằng</div>
          <div className="social-btn-group">
            <button className="social-btn google">
              <FaGoogle /> Google
            </button>
            <button className="social-btn facebook">
              <FaFacebookF /> Facebook
            </button>
          </div>
        </div>

        <div className="auth-link">
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
