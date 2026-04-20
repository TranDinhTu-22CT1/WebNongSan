import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { authAPI } from '../../api/apiClient';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 32) {
      setError('Mật khẩu phải có độ dài từ 6 đến 32 ký tự!');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.registerInit(formData.name, formData.email, formData.password, 'customer');
      setTempToken(response?.temp_token || '');
      setStep('otp');
      alert(response?.message || 'Mã xác nhận đã được gửi tới email của bạn.');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.trim();
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập mã OTP gồm 6 số.');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyRegister(tempToken, otpValue);
      alert(response?.message || 'Xác thực thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Xác thực OTP thất bại.');
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
          <h2 className="auth-title">Tạo tài khoản mới</h2>
          <p className="auth-subtitle">Tham gia cùng chúng tôi để mua sắm nông sản tươi sạch mỗi ngày</p>
        </div>

        {step === 'form' ? (
        <form className="auth-form" onSubmit={handleRegister}>
          {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
          <div className="form-control">
            <label>Họ và tên</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input 
                type="text" 
                name="name" 
                placeholder="Ví dụ: Nguyễn Văn A" 
                onChange={handleChange} 
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-control">
            <label>Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                name="email" 
                placeholder="Ví dụ: email@example.com" 
                onChange={handleChange} 
                required
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
                name="password" 
                placeholder="Tạo mật khẩu (6-32 ký tự)" 
                onChange={handleChange} 
                maxLength={32}
                required
                disabled={loading}
              />
              {showPassword ? (
                <FiEyeOff className="password-toggle" onClick={() => setShowPassword(false)} />
              ) : (
                <FiEye className="password-toggle" onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>
          
          <div className="form-control">
            <label>Nhập lại mật khẩu</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Nhập lại mật khẩu vừa tạo" 
                onChange={handleChange} 
                maxLength={32}
                required
                disabled={loading}
              />
              {showConfirmPassword ? (
                <FiEyeOff className="password-toggle" onClick={() => setShowConfirmPassword(false)} />
              ) : (
                <FiEye className="password-toggle" onClick={() => setShowConfirmPassword(true)} />
              )}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang gửi mã...' : 'Đăng Ký'} <FiUserPlus />
          </button>
        </form>
        ) : (
        <form className="auth-form" onSubmit={handleVerifyOtp}>
          {error && <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
          <div className="form-control">
            <label>Mã xác thực OTP</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="text"
                placeholder="Nhập 6 số OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
          </button>

          <button
            type="button"
            className="social-btn"
            onClick={() => {
              setStep('form');
              setOtp('');
              setError('');
            }}
            disabled={loading}
          >
            Quay lại chỉnh sửa thông tin
          </button>
        </form>
        )}

        <div className="social-login">
          <div className="social-divider">Hoặc đăng ký bằng</div>
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
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
