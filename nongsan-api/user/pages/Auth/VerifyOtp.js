/* src/pages/Auth/VerifyOtp.js */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../api/apiClient';
import './Auth.css';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy email được truyền từ trang trước (nếu không có thì dùng email mẫu)
  const email = location.state?.email || "email@example.com";
  const tempToken = location.state?.tempToken || '';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();

    setError('');
    const otpValue = otp.trim();
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập mã OTP gồm 6 số.');
      return;
    }

    if (!tempToken) {
      setError('Phiên xác thực không hợp lệ. Vui lòng gửi lại OTP.');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyPasswordResetOtp(tempToken, otpValue);
      alert(response?.message || 'Xác thực thành công!');
      navigate('/reset-password', {
        state: {
          email,
          resetToken: response?.reset_token || '',
        },
      });
    } catch (err) {
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>Nhập Mã Xác Thực</h2>
        <p style={{ marginBottom: 18, color: '#666', fontSize: '12px', lineHeight: 1.5 }}>
          Mã xác thực gồm 6 số đã được gửi tới email: <b>{email}</b>
        </p>

        <form className="auth-form" onSubmit={handleVerify}>
          {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
          <div className="form-control">
            <label>Mã OTP</label>
            <input
              type="text"
              placeholder="Nhập mã 6 số"
              value={otp}
              maxLength="6"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              style={{
                textAlign: 'center',
                letterSpacing: '3px',
                fontSize: '17px',
                fontWeight: '700'
              }}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Đang xác thực...' : 'Xác Nhận'}</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
