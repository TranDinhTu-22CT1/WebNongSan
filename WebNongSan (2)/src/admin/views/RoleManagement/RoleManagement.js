import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, ShieldCheck, Users, Trash2, 
  XCircle, CheckCircle, UserCog, UserPlus, Filter, ShieldAlert,
  ChevronLeft, ChevronRight
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
  const [data, setData] = useState({ admins: [], customers: [] });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- URL PARAMS & PHÂN TRANG ---
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'admins';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const ITEMS_PER_PAGE = 15;

  const roles = [
    { code: "SUPER_ADMIN", name: "Admin Tổng" },
    { code: "SUPPORT_ADMIN", name: "Admin CSKH" },
    { code: "USER_ROLE", name: "Customer" }
  ];

  // Hàm cập nhật URL
  const updateURL = (newTab, newPage) => {
    setSearchParams({ tab: newTab, page: newPage });
  };

  const handleTabChange = (tab) => {
    updateURL(tab, 1);
    setSearchTerm('');
  };

  const handlePageChange = (page) => {
    updateURL(activeTab, page);
  };

  // 1. LẤY DANH SÁCH USER TỪ API
  const fetchRolesData = async () => {
    setLoading(true);
    try {
      setApiError('');
      const res = await fetch(`${API_URL}?action=list`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data || { admins: [], customers: [] });
      } else {
        setApiError(result.message || 'Không thể tải dữ liệu phân quyền.');
      }
    } catch (err) {
      setApiError('Không thể kết nối API phân quyền.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  // 2. CẬP NHẬT QUYỀN TRUY CẬP
  const handleUpdateRole = async (id, newRoleCode) => {
    if(!window.confirm("Xác nhận thay đổi quyền truy cập của người dùng này?")) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'update_role', id, role: newRoleCode })
      });
      const result = await res.json();
      alert(result.message);
      if(result.status === 'success') fetchRolesData();
    } catch (err) { alert("Lỗi kết nối API"); }
  };

  // 3. KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleBan = async (id, currentStatus) => {
    const actionType = currentStatus === 'Banned' ? 'unban' : 'ban';
    if(!window.confirm(actionType === 'ban' ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?")) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'toggle_ban', id, action_type: actionType })
      });
      const result = await res.json();
      alert(result.message);
      if(result.status === 'success') fetchRolesData();
    } catch (err) { alert("Lỗi kết nối API"); }
  };

  // 4. GỬI CẢNH BÁO
  const handleWarnUser = async (id) => {
    const message = window.prompt("Nhập nội dung cảnh báo:", "Tài khoản vi phạm chính sách.");
    if (!message) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'warn_user', id, message })
      });
      const result = await res.json();
      alert(result.message);
    } catch (err) { alert("Lỗi kết nối API"); }
  };

  // --- LOGIC TÌM KIẾM & PHÂN TRANG ---
  const filteredList = useMemo(() => {
    const source = data[activeTab] || [];
    return source.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, activeTab, searchTerm]);

  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, safePage]);

  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 4) pages = [1, 2, 3, 4, 5, '...', totalPages];
      else if (safePage >= totalPages - 3) pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      else pages = [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
    }
    return pages;
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;

  return (
    <div className="admin-roles-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-roles-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1b2559; }
        .master-card { background: #fff; border-radius: 40px; padding: 45px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); max-width: 1300px; margin: 0 auto; }
        .tab-nav { display: flex; background: #f4f7fe; padding: 8px; border-radius: 20px; width: fit-content; gap: 10px; margin-bottom: 35px; }
        .tab-btn { padding: 12px 25px; border-radius: 15px; border: none; cursor: pointer; font-weight: 800; font-size: 14px; color: #a3aed0; background: transparent; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
        .tab-btn.active { background: #fff; color: #4318ff; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .search-area { background: #f4f7fe; border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; width: 380px; transition: 0.3s; }
        .search-area:focus-within { background: #fff; box-shadow: 0 0 0 2px #4318ff; }
        .search-area input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }
        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; text-align: left; }
        td { background: #fff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
        .role-select { padding: 10px 15px; border-radius: 14px; border: 2px solid #f4f7fe; font-weight: 700; color: #4318ff; outline: none; cursor: pointer; width: 100%; }
        .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; background: #f4f7fe; color: #707eae; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-action.warn:hover { background: #f59e0b; color: #fff; transform: translateY(-2px); }
        .btn-action.ban:hover { background: #e11d48; color: #fff; transform: translateY(-2px); }
        .btn-action.unban:hover { background: #10b981; color: #fff; transform: translateY(-2px); }

        /* Pagination Styles */
        .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding: 0 10px; }
        .page-info { font-size: 14px; font-weight: 600; color: #a3aed0; }
        .pagination-controls { display: flex; align-items: center; gap: 8px; }
        .p-btn { padding: 8px 15px; border: none; background: #f4f7fe; color: #4318ff; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; }
        .p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .n-btn { width: 35px; height: 35px; border: none; background: transparent; color: #a3aed0; font-weight: 700; cursor: pointer; border-radius: 10px; }
        .n-btn.active { background: #4318ff; color: white; }
      `}</style>

      <div className="master-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1.2px', margin: 0 }}>Phân quyền truy cập</h1>
            <p style={{ color: '#a3aed0', fontWeight: 500, marginTop: '5px' }}>
               Hiển thị {(safePage-1)*ITEMS_PER_PAGE + 1} - {Math.min(safePage*ITEMS_PER_PAGE, totalItems)} / {totalItems} thành viên
            </p>
          </div>
          <div className="search-area">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="tab-nav">
          <button className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => handleTabChange('admins')}>
            <UserCog size={18} /> ĐỘI NGŨ ADMIN ({data.admins?.length || 0})
          </button>
          <button className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => handleTabChange('customers')}>
            <Users size={18} /> KHÁCH HÀNG ({data.customers?.length || 0})
          </button>
        </div>

        {apiError && <div style={{background:'#fff1f2', color:'#e11d48', padding:'15px', borderRadius:'15px', marginBottom:'20px', fontWeight:700}}>{apiError}</div>}

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Thành viên</th>
                <th style={{ width: '250px' }}>Vai trò</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1b2559' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#a3aed0' }}>{user.email}</div>
                  </td>
                  <td>
                    <select className="role-select" value={user.role} onChange={(e) => handleUpdateRole(user.id, e.target.value)}>
                      {roles.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: user.status === 'Banned' ? '#e11d48' : '#10b981' }}>
                      ● {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleWarnUser(user.id)} className="btn-action warn" title="Cảnh báo"><ShieldAlert size={18} /></button>
                      <button onClick={() => handleToggleBan(user.id, user.status)} className={`btn-action ${user.status === 'Banned' ? 'unban' : 'ban'}`}>
                        {user.status === 'Banned' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <span className="page-info">Trang {safePage} / {totalPages}</span>
            <div className="pagination-controls">
              <button className="p-btn" disabled={safePage === 1} onClick={() => handlePageChange(safePage - 1)}><ChevronLeft size={16}/> Trước</button>
              {getPaginationGroup().map((p, i) => (
                p === '...' ? <span key={i}>...</span> :
                <button key={i} className={`n-btn ${safePage === p ? 'active' : ''}`} onClick={() => handlePageChange(p)}>{p}</button>
              ))}
              <button className="p-btn" disabled={safePage === totalPages} onClick={() => handlePageChange(safePage + 1)}>Sau <ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;