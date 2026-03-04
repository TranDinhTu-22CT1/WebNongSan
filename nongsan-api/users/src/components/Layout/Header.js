/* src/components/Layout/Header.js */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBell } from 'react-icons/fa';
import { useCart } from '../../store/CartContext';
import { useNotification } from '../../store/NotificationContext';
import './Header.css';

const Header = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ kho thông báo
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  
  const [showNotify, setShowNotify] = useState(false);
  const notifyRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      navigate(`/?search=${e.target.value}`);
    }
  };

  // Click ra ngoài thì tắt menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setShowNotify(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-container">
      <Link to="/" className="logo">🌾 AgriMarket</Link>

      <div className="search-box">
        <FaSearch color="#666" />
        <input 
          type="text" 
          placeholder="Tìm kiếm rau, củ, quả..." 
          onKeyDown={handleSearch}
        />
      </div>

      <div className="actions">
        <nav className="nav-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/voucher">Ưu đãi</Link>
          <Link to="/contact">Liên hệ</Link>
        </nav>

        {/* --- KHU VỰC THÔNG BÁO --- */}
        <div 
          className="notification-wrapper" 
          ref={notifyRef}
          onClick={() => {
            setShowNotify(!showNotify);
            if (!showNotify) markAllAsRead(); // Mở ra là tính đã đọc
          }}
        >
          <FaBell className="notification-icon" />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

          {showNotify && (
            <div className="notification-dropdown">
              <div className="notify-header">Thông báo mới</div>
              
              <div className="notify-list">
                {notifications.length > 0 ? (
                  // CHỈ LẤY 5 TIN MỚI NHẤT
                  notifications.slice(0, 5).map((item) => (
                    <div key={item.id} className={`notify-item ${item.unread ? 'unread' : ''}`}>
                      <img src={item.image || "https://cdn-icons-png.flaticon.com/512/3602/3602145.png"} alt="icon" className="notify-img" />
                      <div className="notify-content">
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                        <span className="notify-time">{item.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{padding: '15px', textAlign: 'center', color: '#999'}}>Chưa có thông báo nào</p>
                )}
              </div>

              {/* --- NÚT XEM TẤT CẢ (MỚI THÊM) --- */}
              <div style={{
                  borderTop: '1px solid #eee', 
                  padding: '12px', 
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px'
              }}>
                  <Link 
                    to="/notifications" 
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
                      setShowNotify(false); // Đóng menu
                    }}
                    style={{
                      color: '#2e7d32', 
                      fontWeight: 'bold', 
                      fontSize: '13px', 
                      textDecoration: 'none',
                      display: 'block'
                    }}
                  >
                    Xem tất cả thông báo &rarr;
                  </Link>
              </div>

            </div>
          )}
        </div>

        {/* --- GIỎ HÀNG --- */}
        <div className="cart-icon" style={{ position: 'relative' }}>
           <Link to="/cart" style={{ color: 'white' }}>
              <FaShoppingCart />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -10,
                  backgroundColor: 'red', color: 'white',
                  borderRadius: '50%', padding: '2px 6px',
                  fontSize: '12px', fontWeight: 'bold'
                }}>
                  {totalItems}
                </span>
              )}
           </Link>
        </div>

        {/* --- TÀI KHOẢN --- */}
        <div className="cart-icon">
           <Link to="/login" style={{color: 'white'}}>
             <FaUser />
           </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;