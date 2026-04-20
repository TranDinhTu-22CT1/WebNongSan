/* src/components/Layout/Header.js */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiShoppingCart, FiUser, FiClipboard, FiMenu, FiX, FiMessageSquare } from 'react-icons/fi';
import { useCart } from '../../store/CartContext';
import { useNotification } from '../../store/NotificationContext';
import { clearAuthSession, getAuthToken, getStoredUser } from '../../utils/authStorage';
import './Header.css';

// Thêm biến API_BASE để load ảnh nếu đường dẫn ảnh là tương đối
const API_BASE = 'http://localhost/nongsan-api';

const Header = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotification();
  
  const [showNotify, setShowNotify] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastItems, setToastItems] = useState([]);
  
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(''); // Thêm state lưu Avatar
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifyRef = useRef(null);
  const profileMenuRef = useRef(null);
  const seenNotifRef = useRef(new Set());
  const hasInitializedNotifRef = useRef(false);

  // Initialize login state from persisted or session-based auth storage
  useEffect(() => {
    const token = getAuthToken();
    const user = getStoredUser() || {};
    setIsLoggedIn(!!token);
    setUserName(user.name || '');
    setUserAvatar(user.avatar || ''); // Lấy avatar trực tiếp từ local storage
  }, []);

  // Listen for login/logout events to update header
  useEffect(() => {
    const handleLoginLogout = () => {
      const token = getAuthToken();
      const user = getStoredUser() || {};
      setIsLoggedIn(!!token);
      setUserName(user.name || '');
      setUserAvatar(user.avatar || ''); // Lấy avatar trực tiếp từ local storage
      setShowProfileMenu(false);
    };

    window.addEventListener('login', handleLoginLogout);
    window.addEventListener('logout', handleLoginLogout);
    
    return () => {
      window.removeEventListener('login', handleLoginLogout);
      window.removeEventListener('logout', handleLoginLogout);
    };
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!Array.isArray(notifications)) return;

    if (!hasInitializedNotifRef.current) {
      notifications.forEach((n) => seenNotifRef.current.add(String(n.id)));
      hasInitializedNotifRef.current = true;
      return;
    }

    const incomingUnread = notifications.filter((n) => n?.unread);
    const newOnes = incomingUnread.filter((n) => !seenNotifRef.current.has(String(n.id))).slice(0, 2);

    if (newOnes.length === 0) {
      return;
    }

    newOnes.forEach((n) => seenNotifRef.current.add(String(n.id)));
    const toastBatch = newOnes.map((n) => ({
      id: `toast-${n.id}-${Date.now()}`,
      title: n.title,
      desc: n.desc,
    }));

    setToastItems((prev) => [...prev, ...toastBatch]);

    toastBatch.forEach((toast) => {
      window.setTimeout(() => {
        setToastItems((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4500);
    });
  }, [notifications]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const keyword = e.target.value.trim();
      navigate(keyword ? `/shop?search=${encodeURIComponent(keyword)}` : '/shop');
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setShowNotify(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Hàm xử lý đường dẫn ảnh Avatar
  // Hàm xử lý đường dẫn ảnh Avatar (Đã cập nhật)
  const getAvatarSrc = (avatarData) => {
    if (!avatarData || avatarData === 'null' || avatarData === 'undefined') return null;
    
    // Nếu là link http(s) hoặc là chuỗi base64 thì giữ nguyên
    if (avatarData.startsWith('http') || avatarData.startsWith('data:image')) {
      return avatarData;
    }
    
    // Nếu là đường dẫn tương đối, ghép với API_BASE
    const trimmed = avatarData.replace(/^\/+/, '');
    return `${API_BASE}/${trimmed}`;
  };

  return (
    <>
    <header className="header-container">
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      <Link to="/" className="logo">AgriMarket</Link>

      <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Trang Chủ</Link>
        <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Sản Phẩm</Link>
        <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>Giới Thiệu</Link>
        <Link to="/voucher" className={location.pathname === '/voucher' ? 'active' : ''}>Ưu Đãi</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Liên Hệ</Link>
      </nav>

      <div className="actions">
        <div className="search-box" style={{ width: isSearchOpen ? '200px' : 'auto' }}>
          <FiSearch 
            className="action-icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
          />
          {isSearchOpen && (
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              onKeyDown={handleSearch}
              autoFocus
            />
          )}
        </div>

        <div 
          className="notification-wrapper" 
          ref={notifyRef}
          onClick={() => {
            setShowNotify(!showNotify);
            if (!showNotify) markAllAsRead();
          }}
        >
          <FiBell className="action-icon" />
          {unreadCount > 0 && <span className="notification-badge"></span>}

          {showNotify && (
            <div className="notification-dropdown">
              <div className="notify-header">Thông báo mới</div>
              
              <div className="notify-list">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((item) => (
                    <div key={item.id} className={`notify-item ${item.unread ? 'unread' : ''}`} onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }}>
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
                      e.stopPropagation();
                      setShowNotify(false);
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

        <div className="cart-icon-wrapper">
            <Link to="/messages" title="Tin nhắn">
              <FiMessageSquare className="action-icon" />
            </Link>
          </div>

          <div className="cart-icon-wrapper">
           <Link to="/orders" title="Lịch sử đơn hàng">
              <FiClipboard className="action-icon" />
           </Link>
        </div>

        <div className="cart-icon-wrapper">
           <Link to="/cart" title="Giỏ hàng">
              <FiShoppingCart className="action-icon" />
              {totalItems > 0 && (
                <span className="cart-badge">
                  {totalItems}
                </span>
              )}
           </Link>
        </div>

        {/* 👇 PROFILE AVATAR (KHÔNG GỌI API, CHỈ HIỂN THỊ ẢNH) */}
        <div className="cart-icon-wrapper" ref={profileMenuRef}>
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer', 
                  padding: '0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginLeft: '10px'
                }}
              >
                {userAvatar ? (
                  <img 
                    src={getAvatarSrc(userAvatar)} 
                    alt="Avatar" 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4CAF50' }} 
                  />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <FiUser size={18} />
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown-menu" style={{ minWidth: '200px', right: 0 }}>
                  {/* Tên người dùng hiển thị bên trong menu */}
                  <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', textAlign: 'center', background: '#fafafa', borderRadius: '8px 8px 0 0' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333', fontSize: '15px' }}>{userName || 'Khách hàng'}</p>
                    <span style={{ fontSize: '12px', color: '#4CAF50', background: '#e8f5e9', padding: '3px 8px', borderRadius: '10px' }}>Thành viên</span>
                  </div>

                  <Link to="/profile" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                    Thông tin tài khoản
                  </Link>
                  
                  <Link to="/orders" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                    Lịch sử đơn hàng
                  </Link>

                  <button 
                    className="profile-menu-item logout-item"
                    onClick={() => {
                      clearAuthSession();
                      setShowProfileMenu(false);
                      window.dispatchEvent(new Event('logout'));
                      navigate('/login');
                    }}
                    style={{ border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer', padding: '10px 15px', color: '#d32f2f' }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="account-btn" style={{ marginLeft: '10px' }}>
              <FiUser className="account-icon" /> <span>Tài Khoản</span>
            </Link>
          )}
        </div>
      </div>
    </header>
    <div className="notif-toast-stack" aria-live="polite">
      {toastItems.map((toast) => (
        <div key={toast.id} className="notif-toast-item">
          <strong>{toast.title}</strong>
          <p>{toast.desc}</p>
        </div>
      ))}
    </div>
    </>
  );
};

export default Header;