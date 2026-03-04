import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; // Import file trang trí

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Giả lập đăng nhập thành công
    if (email && password) {
      alert("Đăng nhập thành công!");
      navigate('/'); // Chuyển hướng về trang chủ
    } else {
      alert("Vui lòng nhập đầy đủ thông tin!");
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng Nhập</h2>
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-control">
          <label>Email</label>
          <input 
            type="email" 
            placeholder="Nhập email của bạn" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label>Mật khẩu</label>
          <input 
            type="password" 
            placeholder="Nhập mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="auth-btn">Đăng Nhập</button>
      </form>

      <div className="auth-link">
        <p>Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        <p style={{marginTop: 5}}><Link to="/forgot-password">Quên mật khẩu?</Link></p>
      </div>
    </div>
  );
};

export default Login;