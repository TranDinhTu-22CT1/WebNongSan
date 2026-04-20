/* src/pages/Auth/ResetPassword.js */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../api/apiClient';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken) {
      setError('Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resetPassword(resetToken, password);
      alert(response?.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>Đặt Lại Mật Khẩu</h2>
        <form className="auth-form" onSubmit={handleReset}>
          {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
          <div className="form-control">
            <label>Mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu mới" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-control">
            <label>Nhập lại mật khẩu</label>
            <input 
              type="password" 
              placeholder="Nhập lại mật khẩu mới" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu Mật Khẩu'}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
