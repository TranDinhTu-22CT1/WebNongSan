import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; // Dùng lại file trang trí cũ

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      alert("Vui lòng nhập Email của bạn!");
      return;
    }

    // Giả lập gửi mail thành công
    alert(`Một email hướng dẫn lấy lại mật khẩu đã được gửi tới: ${email}\nVui lòng kiểm tra hộp thư đến.`);
    
    // Chuyển người dùng quay lại trang đăng nhập
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <h2>Quên Mật Khẩu</h2>
      <p style={{marginBottom: 20, color: '#666', fontSize: '14px'}}>
        Nhập email đã đăng ký để nhận hướng dẫn lấy lại mật khẩu.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-control">
          <label>Email đăng ký</label>
          <input 
            type="email" 
            placeholder="Ví dụ: email@gmail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="auth-btn">Gửi Yêu Cầu</button>
      </form>

      <div className="auth-link">
        <p>Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập lại</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;