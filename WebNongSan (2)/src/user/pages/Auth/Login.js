import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { authAPI } from '../../api/apiClient';
import { setAuthSession } from '../../utils/authStorage';
import './Auth.css';

// --- Import thư viện Firebase ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// --- Cấu hình Firebase của bạn ---
const firebaseConfig = {
  apiKey: "AIzaSyBlyWfLCJ5OaOAUaoXh3sa6ltR2wtZGQfc",
  authDomain: "nongsan-b11c6.firebaseapp.com",
  projectId: "nongsan-b11c6",
  storageBucket: "nongsan-b11c6.firebasestorage.app",
  messagingSenderId: "935174201060",
  appId: "1:935174201060:web:96192e7b1314dc991496f1",
  measurementId: "G-L8VG7T7J1D"
};

// Khởi tạo Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

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

  const getLockoutMessage = (seconds) => `Hệ thống tạm giới hạn đăng nhập. Vui lòng thử lại sau ${seconds}s.`;

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
      
      if (!response.token || !response.user) {
        throw new Error('Phản hồi đăng nhập không hợp lệ: thiếu token hoặc user data');
      }
      
      setAuthSession({
        token: response.token,
        user: { ...response.user, role: normalizedRole || response.user?.role },
        rememberMe,
      });
      
      setTimeout(() => {
        window.dispatchEvent(new Event('login'));
        setLoading(false);
        alert('Đăng nhập thành công!');

        if (normalizedRole === 'admin') {
          navigate('/admin/panel');
          return;
        }

        // Đã xóa phần điều hướng của Vendor tại đây
        // Người dùng bình thường (customer/user) sẽ đi tới trang được yêu cầu hoặc trang chủ
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

  // --- Hàm xử lý đăng nhập bằng Google ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      setAuthSession({
        token: token,
        user: { 
          id: user.uid,
          uid: user.uid,
          email: user.email, 
          name: user.displayName || 'Người dùng Google',
          avatar: user.photoURL,
          role: 'user' 
        },
        rememberMe: true,
      });

      setTimeout(() => {
        window.dispatchEvent(new Event('login'));
        setLoading(false);
        alert('Đăng nhập bằng Google thành công!');
        navigate(safeRedirect);
      }, 100);

    } catch (err) {
      console.error("Lỗi Google Login: ", err);
      setError('Đăng nhập Google thất bại: ' + (err.message || 'Vui lòng thử lại!'));
      setLoading(false);
    }
  };

  // --- Hàm xử lý đăng nhập bằng GitHub ---
  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const githubUsername = result._tokenResponse?.screenName || user.reloadUserInfo?.screenName;
      const finalName = user.displayName || githubUsername || 'Người dùng GitHub';

      setAuthSession({
        token: token,
        user: { 
          id: user.uid,
          uid: user.uid,
          email: user.email, 
          name: finalName,
          avatar: user.photoURL,
          role: 'user' 
        },
        rememberMe: true,
      });

      setTimeout(() => {
        window.dispatchEvent(new Event('login'));
        setLoading(false);
        alert('Đăng nhập bằng GitHub thành công!');
        navigate(safeRedirect);
      }, 100);

    } catch (err) {
      console.error("Lỗi GitHub Login: ", err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Email này đã được liên kết với một phương thức đăng nhập khác (VD: Google).');
      } else {
        setError('Đăng nhập GitHub thất bại: ' + (err.message || 'Vui lòng thử lại!'));
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
            <button 
              type="button" 
              className="social-btn google" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FaGoogle /> Google
            </button>
            
            <button 
              type="button" 
              className="social-btn github" 
              onClick={handleGithubLogin}
              disabled={loading}
              style={{ backgroundColor: '#24292e', color: '#fff' }}
            >
              <FaGithub /> GitHub
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