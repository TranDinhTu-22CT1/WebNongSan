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
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

const API_BASE = 'http://localhost/nongsan-api/'; // Khai báo đường dẫn API

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  
  const [userId, setUserId] = useState(null) // Thêm state lưu ID để đăng xuất
  const [userName, setUserName] = useState('Khách hàng')
  const [userAvatar, setUserAvatar] = useState(avatar8)

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            if (user.id) setUserId(user.id); // Lấy ID từ localStorage
            if (user.name) setUserName(user.name);
            if (user.avatar) setUserAvatar(user.avatar);
        } catch (e) {
            console.error("Lỗi đọc dữ liệu user", e);
        }
    }
  }, []);

  // Chuyển hàm thành async để gọi API
  const handleLogout = async () => {
    if (userId) {
      try {
        // Gọi API cập nhật is_online = 0
        await fetch(`${API_BASE}logout.php?id=${userId}`, {
          method: 'GET'
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái offline:", error);
      }
    }

    // Tiến hành xóa cache nội bộ và điều hướng
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    alert('Đã đăng xuất thành công!');
    navigate('/login', { replace: true });
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={userAvatar} size="md" />
      </CDropdownToggle>
      
      {/* Thêm min-width để dropdown rộng ra một chút cho tên dài không bị xấu */}
      <CDropdownMenu className="pt-0" placement="bottom-end" style={{ minWidth: '220px' }}>
        
        {/* --- PHẦN HEADER ĐƯỢC CHỈNH SỬA --- */}
        <CDropdownHeader className="bg-body-secondary py-3">
            <div className="small text-muted fw-semibold mb-1">Xin chào,</div>
            <div className="fw-bold fs-5 text-dark text-uppercase text-truncate">
                {userName}
            </div>
        </CDropdownHeader>
        {/* ---------------------------------- */}
        
        <CDropdownItem 
            onClick={() => navigate('/VendorProfile')} 
            style={{ cursor: 'pointer' }}
            className="py-2"
        >
          <CIcon icon={cilUser} className="me-2 text-primary" />
          Hồ sơ cửa hàng
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem 
            onClick={handleLogout} 
            style={{ cursor: 'pointer' }}
            className="py-2 text-danger"
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Đăng xuất
        </CDropdownItem>
        
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown