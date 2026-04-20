import React, { useState, useEffect } from 'react';
import ProfileCardComponent from "../../components/profileCard/ProfileCardComponent";
import { API_BASE } from 'src/config';
import './AdminProfile.scss';

const API_URL = `${API_BASE}/get_profile_admin.php`;

const AdminProfile = () => {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser.id || localStorage.getItem('userId');

  const [adminInfo, setAdminInfo] = useState({
    id: userId,
    name: '',
    title: 'Quản trị viên hệ thống',
    handle: '',
    avatarUrl: '',
    description: '',
    phone: '',
    address: '',
    status: 'Đang trực tuyến',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ ...adminInfo });
  const [selectedFile, setSelectedFile] = useState(null);

  const formatAvatarUrl = (url) => {
    if (!url || url.trim() === '') return 'https://i.pravatar.cc/300?img=admin';
    if (url.startsWith('http')) return url;
    return `${API_BASE}/${url}`;
  };

  const fetchProfile = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.status === 'success') {
        const db = result.data;
        const normalizedAvatar = formatAvatarUrl(db.avatar);
        
        const mappedData = {
          ...adminInfo,
          name: db.name || '',
          handle: db.email ? db.email.split('@')[0] : 'admin',
          avatarUrl: normalizedAvatar,
          description: db.description || 'Hệ thống quản lý nông sản.',
          phone: db.phone || '',
          address: db.address || ''
        };
        setAdminInfo(mappedData);
        setFormState(mappedData);
      }
    } catch (err) {
      console.error("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormState(prev => ({ ...prev, avatarUrl: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // --- LƯU HỒ SƠ & ĐỒNG BỘ HEADER ---
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append('id', userId);
    formData.append('name', formState.name);
    formData.append('phone', formState.phone);
    formData.append('address', formState.address);
    formData.append('description', formState.description);
    
    // Nếu có file mới thì gửi file, nếu không gửi link ảnh cũ để PHP xử lý
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    } else {
      formData.append('current_avatar', adminInfo.avatarUrl);
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (result.status === 'success') {
        // Lấy link ảnh mới từ server, nếu server không trả về thì dùng link hiện tại trong formState
        const finalAvatar = formatAvatarUrl(result.new_avatar || formState.avatarUrl);
        
        // CẬP NHẬT LOCALSTORAGE - ĐÂY LÀ CHỖ QUAN TRỌNG ĐỂ HEADER THAY ĐỔI
        const updatedUser = { 
          ...storedUser, 
          name: formState.name, 
          avatar: finalAvatar 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // PHÁT TÍN HIỆU ĐỂ AppHeaderDropdown.js NHẬN DỮ LIỆU MỚI
        window.dispatchEvent(new Event('user:updated')); 

        setAdminInfo({ 
          ...formState, 
          avatarUrl: finalAvatar 
        });
        
        alert("Cập nhật thành công!");
        setIsEditing(false);
        setSelectedFile(null);
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  if (loading) return <div className="p-5 text-center">Đang xác thực hồ sơ Admin...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="card-preview-section">
          <ProfileCardComponent {...adminInfo} className="admin-card-custom" enableTilt={true} />
          {!isEditing && (
            <button className="btn-edit-mode" onClick={() => setIsEditing(true)}>Thiết lập hồ sơ</button>
          )}
        </div>

        {isEditing && (
          <div className="admin-form-section">
            <form className="admin-glass-form" onSubmit={handleSave}>
              <h2 className="form-title">Chỉnh sửa Admin</h2>
              <div className="input-grid">
                <div className="field">
                  <label>Họ và Tên</label>
                  <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} required />
                </div>
                <div className="field">
                  <label>Số điện thoại</label>
                  <input type="text" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} />
                </div>
                <div className="field full-width">
                  <label>Địa chỉ công tác</label>
                  <input type="text" value={formState.address} onChange={e => setFormState({...formState, address: e.target.value})} placeholder="Nhập địa chỉ..." />
                </div>
                <div className="field full-width">
                  <label>Ghi chú / Mô tả</label>
                  <textarea value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} rows="3" />
                </div>
              </div>
              <div className="field full-width">
                <label>Ảnh đại diện mới</label>
                <div className="upload-zone">
                  <input type="file" accept="image/*" onChange={handleImageChange} id="file-up" hidden />
                  <label htmlFor="file-up" className="btn-upload">Chọn ảnh từ máy</label>
                  <span className="file-name">{selectedFile ? selectedFile.name : "Định dạng hỗ trợ: JPG, PNG, WEBP"}</span>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>
                <button type="submit" className="btn-submit">Cập nhật hồ sơ</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;