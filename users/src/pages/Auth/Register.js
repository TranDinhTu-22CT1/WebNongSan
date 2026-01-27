import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    // Giả lập đăng ký thành công
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <h2>Đăng Ký Tài Khoản</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <div className="form-control">
          <label>Họ và tên</label>
          <input type="text" name="name" placeholder="Nguyễn Văn A" onChange={handleChange} />
        </div>
        <div className="form-control">
          <label>Email</label>
          <input type="email" name="email" placeholder="email@example.com" onChange={handleChange} />
        </div>
        <div className="form-control">
          <label>Mật khẩu</label>
          <input type="password" name="password" placeholder="******" onChange={handleChange} />
        </div>
        <div className="form-control">
          <label>Nhập lại mật khẩu</label>
          <input type="password" name="confirmPassword" placeholder="******" onChange={handleChange} />
        </div>

        <button type="submit" className="auth-btn">Đăng Ký</button>
      </form>

      <div className="auth-link">
        <p>Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
};

export default Register;