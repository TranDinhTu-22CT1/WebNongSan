/* src/components/Layout/Header.js */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBell } from 'react-icons/fa';
import { useCart } from '../../store/CartContext';
import { useNotification } from '../../store/NotificationContext';
// 👇 Đảm bảo import đúng đường dẫn đến file API và biến môi trường của dự án
import { authAPI } from '../../utils/api'; 
import { API_BASE } from '../../config'; 
import './Header.css';

const Header = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  
  const [showNotify, setShowNotify] = useState(false);
  const notifyRef = useRef(null);

  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Thiết lập trạng thái đăng nhập ban đầu
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    setUserRole(role);
    setIsLoggedIn(!!token);
  }, []);

  // 👇 GỌI THẲNG authAPI TỪ FRONTEND ĐỂ LẤY DỮ LIỆU CHUẨN XÁC NHẤT
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const profile = await authAPI.getProfile();
          if (profile) {
            setUserName(profile.name || '');
            setUserAvatar(profile.avatar || '');
          }
        } catch (error) {
          console.error('Không thể tải thông tin user:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isLoggedIn]);

  // Lắng nghe sự kiện login/logout
  useEffect(() => {
    const handleLoginLogout = () => {
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');
      setUserRole(role);
      setIsLoggedIn(!!token);
      setShowProfileMenu(false);
      
      // Xóa data nếu đăng xuất
      if (!token) {
        setUserName('');
        setUserAvatar('');
      }
    };

    window.addEventListener('login', handleLoginLogout);
    window.addEventListener('logout', handleLoginLogout);
    
    return () => {
      window.removeEventListener('login', handleLoginLogout);
      window.removeEventListener('logout', handleLoginLogout);
    };
  }, []);

  // Đóng menu profile khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      navigate(`/?search=${e.target.value}`);
    }
  };

  // Đóng menu notify khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setShowNotify(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý chuẩn hóa đường dẫn ảnh Avatar
  const getAvatarSrc = (avatarData) => {
    if (!avatarData) return null;
    if (avatarData.startsWith('http')) return avatarData;
    const trimmed = avatarData.replace(/^\/+/, '');
    return `${API_BASE}/${trimmed}`;
  };

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
          {userRole === 'admin' && <Link to="/admin/panel" style={{ color: '#ff9800', fontWeight: 'bold' }}>⚙️ Quản lý</Link>}
        </nav>

        {/* --- KHU VỰC THÔNG BÁO --- */}
        <div 
          className="header-action-item notification-wrapper" 
          ref={notifyRef}
          onClick={() => {
            setShowNotify(!showNotify);
            if (!showNotify) markAllAsRead();
          }}
        >
          <div className="header-action-link">
            <FaBell size={20} className="notification-icon" />
          </div>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

          {showNotify && (
            <div className="notification-dropdown">
              <div className="notify-header">Thông báo mới</div>
              
              <div className="notify-list">
                {notifications.length > 0 ? (
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

        {/* --- GIỎ HÀNG --- */}
        <div className="header-action-item" style={{ position: 'relative' }}>
           <Link to="/cart" className="header-action-link">
              <FaShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">
                  {totalItems}
                </span>
              )}
           </Link>
        </div>

        {/* --- TÀI KHOẢN (CHỈ HIỂN THỊ AVATAR VÀ MENU DROPDOWN) --- */}
        <div className="header-action-item" ref={profileMenuRef}>
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
                      style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '2px solid #4CAF50',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                 ) : (
                    <div style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4CAF50', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                       <FaUser size={16} />
                    </div>
                 )}
               </button>

               {showProfileMenu && (
                 <div className="profile-dropdown-menu" style={{ minWidth: '220px' }}>
                   {/* ĐƯA TÊN VÀO TRONG MENU */}
                   <div className="profile-menu-header" style={{ 
                     borderBottom: '1px solid #eee', 
                     paddingBottom: '15px', 
                     marginBottom: '10px',
                     textAlign: 'center'
                   }}>
                     <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                       {userName || 'Khách hàng'}
                     </p>
                     <span style={{ fontSize: '12px', color: '#4CAF50', background: '#e8f5e9', padding: '3px 8px', borderRadius: '12px' }}>
                       Thành viên AgriMarket
                     </span>
                   </div>

                   <div className="profile-menu-items">
                     <Link to="/profile" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                       👤 Thông tin tài khoản
                     </Link>
                     
                     <Link to="/orders" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                       🛒 Lịch sử đơn hàng
                     </Link>

                     {userRole === 'admin' && (
                       <>
                         <div className="profile-menu-divider"></div>
                         <Link to="/admin/panel" className="profile-menu-item admin-item" onClick={() => setShowProfileMenu(false)}>
                           ⚙️ Quản lý Admin
                         </Link>
                       </>
                     )}

                     <div className="profile-menu-divider"></div>
                     <button 
                       className="profile-menu-item logout-item"
                       onClick={() => {
                         localStorage.removeItem('token');
                         localStorage.removeItem('user');
                         localStorage.removeItem('userRole');
                         setShowProfileMenu(false);
                         window.dispatchEvent(new Event('logout'));
                         navigate('/login');
                       }}
                       style={{ border: 'none', width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer', color: '#d32f2f' }}
                     >
                       🚪 Đăng xuất
                     </button>
                   </div>
                 </div>
               )}
             </>
           ) : (
             <Link to="/login" className="header-action-link" style={{ marginLeft: '10px' }}>
               <FaUser size={20} />
             </Link>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;