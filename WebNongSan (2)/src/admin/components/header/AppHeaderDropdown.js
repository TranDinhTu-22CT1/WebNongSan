import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilUser, cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { clearAuthSession } from '../../../user/utils/authStorage.js'

// Avatar mặc định
import defaultAvatar from './../../assets/images/avatars/8.jpg'
import { API_BASE } from 'src/config';

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    id: '', // Thêm ID vào state để xử lý logout
    name: 'Người dùng',
    avatar: defaultAvatar,
    role: ''
  })

  const loadUserData = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        let finalAvatar = defaultAvatar;

        if (user.avatar && user.avatar.trim() !== '') {
          finalAvatar = user.avatar.startsWith('http') 
            ? user.avatar 
            : `${API_BASE}/${user.avatar.replace(/^\//, '')}`;
        }

        setUserData({
          id: user.id || '', // Lưu ID để dùng cho logout
          name: user.name || 'Người dùng',
          avatar: finalAvatar,
          role: user.role || ''
        });
      } catch (e) {
        console.error("Lỗi đọc dữ liệu user", e);
      }
    }
  }

  useEffect(() => {
    loadUserData();
    const handleStorageChange = () => loadUserData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- HÀM XỬ LÝ ĐĂNG XUẤT (CẬP NHẬT IS_ONLINE = 0) ---
  const handleLogout = async () => {
    if (userData.id) {
      try {
        // Gọi API logout để cập nhật is_online về 0 trong DB
        await fetch(`${API_BASE}/logout.php?id=${userData.id}`, {
          method: 'GET'
        });
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái Offline:", error);
      }
    }

    // Xóa sạch dữ liệu và chuyển hướng
    clearAuthSession();
    navigate('/login', { replace: true });
  }

  const goToProfile = () => {
    if (userData.role === 'admin') navigate('/admin/admin-profile');
    else navigate('/VendorProfile');
  }

  return (
    <CDropdown variant="nav-item">
      <style>{`
        .header-avatar-container {
          width: 40px !important;
          height: 40px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 50% !important;
          border: 2px solid #ebedef;
        }

        .header-avatar-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center;
        }

        .dropdown-user-name {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <div className="header-avatar-container">
          <img 
            src={userData.avatar} 
            alt="User Avatar" 
            className="header-avatar-img" 
          />
        </div>
      </CDropdownToggle>
      
      <CDropdownMenu className="pt-0" placement="bottom-end" style={{ minWidth: '230px' }}>
        <CDropdownHeader className="bg-body-secondary py-3">
          <div className="small text-muted fw-semibold mb-1">Tài khoản</div>
          <div className="fw-bold dropdown-user-name">
            {userData.name}
          </div>
          <div className="small text-primary fw-bold">
             {userData.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'VENDOR PARTNER'}
          </div>
        </CDropdownHeader>
        
        <CDropdownItem onClick={goToProfile} style={{ cursor: 'pointer' }} className="py-2">
          <CIcon icon={cilUser} className="me-2 text-primary" />
          {userData.role === 'admin' ? 'Hồ sơ Admin' : 'Hồ sơ cửa hàng'}
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }} className="py-2 text-danger font-weight-bold">
          <CIcon icon={cilLockLocked} className="me-2" />
          Đăng xuất
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown