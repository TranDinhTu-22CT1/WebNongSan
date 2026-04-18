import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, ordersAPI, BACKEND_BASE_URL } from '../../api/apiClient';
import { clearAuthSession, getStoredUser, setAuthSession, isRememberedLogin, getAuthToken } from '../../utils/authStorage';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = getAuthToken();
        const storedUser = getStoredUser();
        if (!authToken || !storedUser) {
          navigate('/login');
          return;
        }

        const userData = storedUser;
        // Normalize avatar to absolute URL pointing to backend
        const normalizeAvatar = (avatar) => {
          if (!avatar) return null;
          if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
          const cleaned = avatar.replace(/^\/+/, '');
          return `${BACKEND_BASE_URL}/${cleaned}`;
        };

        if (userData.avatar) {
          userData.avatar = normalizeAvatar(userData.avatar);
        }

        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });

        // Fetch updated profile from backend
        const profileData = await authAPI.getProfile();
        if (profileData && profileData.avatar) {
          profileData.avatar = normalizeAvatar(profileData.avatar);
        }
        setUser(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });

        // Fetch user orders
        const ordersData = await ordersAPI.getAll();
        setOrders(ordersData || []);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    if (file) {
      // Basic client-side validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Chỉ cho phép định dạng ảnh JPG/PNG/GIF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Kích thước ảnh phải ≤ 5MB');
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setUploadError('');
      const res = await authAPI.updateProfile(formData.email, formData.name, formData.phone, formData.address, avatarFile);
      const updatedUser = { ...user, ...formData };

      // If server returned an avatar path, prefer that (persisted); otherwise use preview
      if (res && res.avatar) {
        // Ensure absolute URL so browser requests go to backend server
        if (res.avatar.startsWith('/')) {
          updatedUser.avatar = `${BACKEND_BASE_URL}${res.avatar}`;
        } else {
          updatedUser.avatar = res.avatar;
        }
      } else if (avatarFile && avatarPreview) {
        updatedUser.avatar = avatarPreview;
      }

      setAuthSession({
        token: getAuthToken(),
        user: updatedUser,
        rememberMe: isRememberedLogin(),
      });
      setUser(updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      alert(res && res.message ? res.message : 'Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  if (loading) {
    return <div className="profile-container" style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (error) {
    return <div className="profile-container" style={{ padding: '20px', color: '#d32f2f' }}>{error}</div>;
  }

  if (!user) {
    return <div className="profile-container" style={{ padding: '20px' }}>Vui lòng đăng nhập</div>;
  }

  return (
    <div className="profile-container">
      {/* Cột trái: Sidebar */}
      <div className="profile-sidebar">
        <div className="user-avatar">
          <div className="avatar-frame">
            <img src={user.avatar || "https://i.pravatar.cc/150?img=5"} alt="Avatar" className="avatar-img" />
          </div>
          <div className="user-name">{user.name}</div>
        </div>
        <ul className="profile-menu">
          <li 
            className={activeTab === 'info' ? 'active' : ''} 
            onClick={() => setActiveTab('info')}
          >
            Thông tin tài khoản
          </li>
          <li 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            Lịch sử đơn hàng
          </li>
          <li style={{color: 'red', cursor: 'pointer'}} onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>

      {/* Cột phải: Nội dung thay đổi theo Tab */}
      <div className="profile-content">
        {activeTab === 'info' && (
          <div>
            <h2 style={{color: '#2e7d32', marginBottom: '20px'}}>Thông tin cá nhân</h2>
            
            {isEditing ? (
              <div>
                <div className="info-group">
                  <span className="info-label">Ảnh đại diện</span>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img 
                      src={avatarPreview || user.avatar || "https://i.pravatar.cc/150?img=5"} 
                      alt="Avatar preview" 
                      className="avatar-preview-img"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        id="avatarInput"
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="file-input-hidden"
                      />

                      <button
                        type="button"
                        className="upload-btn"
                        onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                      >
                        Chọn ảnh mới
                      </button>

                      <span style={{ color: '#666', fontSize: '13px' }}>PNG, JPG (≤ 5MB)</span>
                    </div>
                    {uploadError && (
                      <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
                        {uploadError}
                      </div>
                    )}
                    </div>
                  </div>
                <div className="info-group">
                  <span className="info-label">Họ và tên</span>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '5px'
                    }}
                  />
                </div>
                <div className="info-group">
                  <span className="info-label">Email</span>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '5px'
                    }}
                  />
                </div>
                <div className="info-group">
                  <span className="info-label">Số điện thoại</span>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone || ''}
                    onChange={handleChange}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '5px'
                    }}
                  />
                </div>
                <div className="info-group">
                  <span className="info-label">Địa chỉ</span>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address || ''}
                    onChange={handleChange}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '5px'
                    }}
                  />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button 
                    className="auth-btn" 
                    style={{width: 'auto'}}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button 
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: '#f5f5f5'
                    }}
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="info-group">
                  <span className="info-label">Họ và tên</span>
                  <div className="info-value">{user.name || 'N/A'}</div>
                </div>
                <div className="info-group">
                  <span className="info-label">Email</span>
                  <div className="info-value">{user.email || 'N/A'}</div>
                </div>
                <div className="info-group">
                  <span className="info-label">Số điện thoại</span>
                  <div className="info-value">{user.phone || 'N/A'}</div>
                </div>
                <div className="info-group">
                  <span className="info-label">Địa chỉ</span>
                  <div className="info-value">{user.address || 'N/A'}</div>
                </div>
                <button 
                  className="auth-btn" 
                  style={{width: 'auto'}}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{color: '#2e7d32', marginBottom: '20px'}}>Lịch sử đơn hàng</h2>
            {orders.length > 0 ? (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{fontWeight: 'bold'}}>{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td style={{color: '#d32f2f', fontWeight: 'bold'}}>{order.totalPrice.toLocaleString('vi-VN')}đ</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Chưa có đơn hàng nào</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
