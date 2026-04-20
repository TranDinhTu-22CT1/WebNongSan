import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShieldCheck, Store, Users, Trash2, 
  XCircle, CheckCircle, UserCog, UserPlus, Filter, ShieldAlert
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_URL = `${API_BASE}/handle_role.php`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}`, 'X-Access-Token': token } : {}),
  };
};

const RoleManagement = () => {
  const [data, setData] = useState({ admins: [], vendors: [], customers: [] });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'vendors' | 'customers'
  const [searchTerm, setSearchTerm] = useState('');

  const roles = [
    { code: "SUPER_ADMIN", name: "Admin Tổng" },
    { code: "SUPPORT_ADMIN", name: "Admin CSKH" },
    { code: "VENDOR_ROLE", name: "Vendor" },
    { code: "USER_ROLE", name: "Customer" }
  ];

  // 1. LẤY DANH SÁCH USER TỪ API
  const fetchRolesData = async () => {
    setLoading(true);
    try {
      setApiError('');
      const res = await fetch(`${API_URL}?action=list`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data || { admins: [], vendors: [], customers: [] });
      } else {
        setData({ admins: [], vendors: [], customers: [] });
        setApiError(result.message || 'Khong the tai du lieu phan quyen.');
      }
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      setData({ admins: [], vendors: [], customers: [] });
      setApiError('Khong the ket noi API phan quyen. Vui long dang nhap lai hoac kiem tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  // 2. CẬP NHẬT QUYỀN TRUY CẬP (ROLE)
  const handleUpdateRole = async (id, newRoleCode) => {
    if(!window.confirm("Xác nhận thay đổi quyền truy cập của người dùng này?")) return;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_role',
          id: id,
          role: newRoleCode
        })
      });
      const result = await res.json();
      alert(result.message);
      
      if(result.status === 'success') {
        fetchRolesData(); // Tải lại danh sách sau khi update thành công
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  // 3. KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleBan = async (id, currentStatus) => {
    const actionType = currentStatus === 'Banned' ? 'unban' : 'ban';
    const confirmMsg = actionType === 'ban' ? "Bạn muốn khóa tài khoản này?" : "Bạn muốn mở khóa tài khoản này?";
    
    if(!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'toggle_ban',
          id: id,
          action_type: actionType
        })
      });
      const result = await res.json();
      alert(result.message);
      
      if(result.status === 'success') {
        fetchRolesData();
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  // 4. GỬI CẢNH BÁO
  const handleWarnUser = async (id) => {
    const message = window.prompt("Nhập nội dung cảnh báo:", "Tài khoản của bạn có dấu hiệu vi phạm chính sách.");
    if (!message) return; // Hủy nếu không nhập gì

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'warn_user',
          id: id,
          admin_id: 1, // ID của admin đang thao tác (Cần lấy từ state đăng nhập thực tế)
          message: message
        })
      });
      const result = await res.json();
      alert(result.message);
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  const filteredList = useMemo(() => {
    if (!data[activeTab]) return [];
    return data[activeTab].filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, activeTab, searchTerm]);

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Inter' }}>Đang tải dữ liệu phân quyền...</div>;
  }

  return (
    <div className="admin-roles-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-roles-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1b2559; }
        .master-card { background: #fff; border-radius: 40px; padding: 45px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); max-width: 1300px; margin: 0 auto; border: 1px solid #fff; }
        
        /* TAB NAVIGATION */
        .tab-nav { display: flex; background: #f4f7fe; padding: 8px; border-radius: 20px; width: fit-content; gap: 10px; margin-bottom: 35px; }
        .tab-btn { 
          padding: 12px 25px; border-radius: 15px; border: none; cursor: pointer; 
          font-weight: 800; font-size: 14px; color: #a3aed0; background: transparent; 
          transition: 0.3s; display: flex; align-items: center; gap: 10px;
        }
        .tab-btn.active { background: #fff; color: #4318ff; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        /* SEARCHBAR */
        .search-area { background: #f4f7fe; border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; width: 380px; transition: 0.3s; }
        .search-area:focus-within { background: #fff; box-shadow: 0 0 0 2px #4318ff; }
        .search-area input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }

        /* TABLE */
        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; text-align: left; }
        td { background: #fff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }

        .role-select { 
          padding: 10px 15px; border-radius: 14px; border: 2px solid #f4f7fe; 
          font-weight: 700; color: #4318ff; outline: none; cursor: pointer; width: 100%;
        }
        .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; background: #f4f7fe; color: #707eae; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-action.warn:hover { background: #f59e0b; color: #fff; transform: translateY(-2px); }
        .btn-action.ban:hover { background: #e11d48; color: #fff; transform: translateY(-2px); }
        .btn-action.unban:hover { background: #10b981; color: #fff; transform: translateY(-2px); }
        .api-error-banner { margin: 14px 0 16px; border: 1px solid #fee2e2; background: #fff1f2; color: #9f1239; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 700; }
      `}</style>

      <div className="master-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1.2px', margin: 0 }}>Phân quyền truy cập</h1>
            <p style={{ color: '#a3aed0', fontWeight: 500, marginTop: '5px' }}>Quản lý và cấp quyền từ cơ sở dữ liệu</p>
          </div>
          <div className="search-area">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder={`Tìm trong ${activeTab === 'admins' ? 'đội ngũ Admin' : activeTab === 'vendors' ? 'đối tác Vendor' : 'khách hàng'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3 PHẦN TRUY CẬP RIÊNG BIỆT (TABS) */}
        <div className="tab-nav">
          <button className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
            <UserCog size={18} /> ĐỘI NGŨ ADMIN ({data.admins?.length || 0})
          </button>
          <button className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
            <Store size={18} /> ĐỐI TÁC VENDOR ({data.vendors?.length || 0})
          </button>
          <button className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
            <Users size={18} /> KHÁCH HÀNG ({data.customers?.length || 0})
          </button>
        </div>

        {apiError ? <div className="api-error-banner">{apiError}</div> : null}

        {/* LIST DANH SÁCH TƯƠNG ỨNG */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{activeTab === 'admins' ? 'Nhân viên' : activeTab === 'vendors' ? 'Chủ gian hàng' : 'Người mua'}</th>
                <th style={{ width: '250px' }}>Cấp vai trò (Role)</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1b2559', fontSize: '15px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#a3aed0', fontWeight: 600 }}>{user.email}</div>
                  </td>
                  <td>
                    <select 
                      className="role-select"
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    >
                      {roles.map(r => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '11px', fontWeight: 800, 
                      color: user.status === 'Banned' || user.status === 'Offline' ? '#a3aed0' : '#10b981' 
                    }}>
                      ● {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleWarnUser(user.id)} className="btn-action warn" title="Gửi cảnh báo">
                        <ShieldAlert size={18} />
                      </button>
                      
                      {user.status === 'Banned' ? (
                        <button onClick={() => handleToggleBan(user.id, user.status)} className="btn-action unban" style={{ background: '#d1fae5' }} title="Mở khóa">
                          <CheckCircle size={18} color="#059669" />
                        </button>
                      ) : (
                        <button onClick={() => handleToggleBan(user.id, user.status)} className="btn-action ban" style={{ background: '#fff1f2' }} title="Khóa tài khoản">
                          <XCircle size={18} color="#e11d48" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#a3aed0' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
            <p style={{ fontWeight: 600 }}>Không tìm thấy thành viên nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;