import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaYoutube, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Cột 1: Thông tin chung */}
        <div className="footer-section">
          <h3>Về AgriMarket</h3>
          <p>Chúng tôi cung cấp nông sản sạch, tươi ngon từ các nông trại đạt chuẩn VietGAP trực tiếp đến bàn ăn của gia đình bạn.</p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div className="footer-section">
          <h3>Liên kết</h3>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/about">Giới thiệu</Link></li> {/* Lát nữa sẽ tạo */}
            <li><Link to="/contact">Liên hệ</Link></li>
            <li><Link to="/support">Hỗ trợ & FAQ</Link></li>
          </ul>
        </div>

        {/* Cột 3: Liên hệ */}
        <div className="footer-section">
          <h3>Liên hệ</h3>
          <p><FaMapMarkerAlt /> 123 Đường Nông Nghiệp, Đà Nẵng</p>
          <p><FaPhone /> 0912.345.678</p>
          <p><FaEnvelope /> hotro@agrimarket.com</p>
        </div>

        {/* Cột 4: Mạng xã hội */}
        <div className="footer-section">
          <h3>Kết nối</h3>
          <div className="social-icons">
             <FaFacebook size={24} style={{cursor: 'pointer'}} />
             <FaYoutube size={24} style={{cursor: 'pointer'}} />
             <FaInstagram size={24} style={{cursor: 'pointer'}} />
          </div>
        </div>
      </div>

      <div className="copyright">
        © 2026 AgriMarket - Nông Sản Sạch Việt Nam. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;