/* src/pages/Auth/ForgotPassword.js */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiSend, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../../api/apiClient';
import './Auth.css'; // Sử dụng chung file CSS với Login/Register

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0);

  const getLockoutMessage = (seconds) => `He thong tam gioi han gui OTP. Vui long thu lai sau ${seconds}s.`;

  useEffect(() => {
    if (lockSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setLockSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      alert("Vui lòng nhập Email của bạn!");
      return;
    }

    if (lockSeconds > 0) {
      setError(getLockoutMessage(lockSeconds));
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.requestPasswordResetOtp(email.trim());
      alert(response?.message || `Mã OTP đã được gửi đến: ${email}`);
      navigate('/verify-otp', { state: { email, tempToken: response?.temp_token || '' } });
    } catch (err) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
      if (Number(err?.retryAfter) > 0) {
        setLockSeconds(Number(err.retryAfter));
      }
    } finally {
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
          <h2 className="auth-title">Quên Mật Khẩu</h2>
          <p className="auth-subtitle">Nhập địa chỉ email đã đăng ký để nhận mã xác thực (OTP) khôi phục mật khẩu.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
          <div className="form-control">
            <label>Email đăng ký</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                placeholder="Ví dụ: email@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi Mã OTP'} <FiSend />
          </button>
          {lockSeconds > 0 && (
            <div className="lockout-hint">{getLockoutMessage(lockSeconds)}</div>
          )}
        </form>

        <div className="auth-link" style={{ marginTop: '30px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <FiArrowLeft /> Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
