import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Eye, Key, CheckCircle, Ban, 
  Unlock, ShoppingBag, AlertOctagon, 
  XCircle, Wallet, RefreshCcw
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_URL = `${API_BASE}/handle_vendors.php`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [tempPassword, setTempPassword] = useState('AGRI2026_NEW');

  // --- 1. FETCH DỮ LIỆU ---
  const fetchVendors = async () => {
    try {
      const res = await fetch(API_URL);
      const result = await res.json();
      if (result.status === 'success') {
        setVendors(result.data);
      }
    } catch (err) {
      console.error("Lỗi fetch vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // --- 2. XỬ LÝ CẬP NHẬT TRẠNG THÁI ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'update_status', id, status: newStatus })
      });
      const result = await res.json();
      if (result.status === 'success') {
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
        setModalType(null);
      }
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  // --- 3. XỬ LÝ ĐỔI MẬT KHẨU ---
  const handlePasswordUpdate = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          action: 'update_password', 
          id: selectedVendor.id, 
          password: tempPassword 
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Đã cập nhật mật khẩu mới cho đối tác!");
        setModalType(null);
      }
    } catch (err) {
      alert("Lỗi server");
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => 
      v.status === activeTab && 
      (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vendors, activeTab, searchTerm]);

  if (loading) return <div style={{padding: 50, textAlign: 'center'}}><RefreshCcw className="animate-spin" /> Đang tải...</div>;

  return (
    <div className="admin-vendor-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {/* CSS GIỮ NGUYÊN NHƯ CODE CŨ CỦA BẠN */}
      <style>{`
        .admin-vendor-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .master-vendor-card { background: #ffffff; border-radius: 35px; padding: 40px; box-shadow: 0 20px 45px rgba(0,0,0,0.04); max-width: 1400px; margin: 0 auto; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .search-container { background: #f4f7fe; border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; width: 350px; }
        .search-container input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }
        .tabs-row { display: flex; background: #f4f7fe; padding: 6px; border-radius: 20px; width: fit-content; gap: 5px; margin-bottom: 30px; }
        .tab-btn { padding: 12px 25px; border-radius: 15px; border: none; cursor: pointer; font-weight: 700; color: #a3aed0; background: transparent; transition: 0.3s; }
        .tab-btn.active { background: #fff; color: #4318ff; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 13px; text-transform: uppercase; font-weight: 700; }
        td { background: #fff; padding: 18px 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 18px; border-bottom-left-radius: 18px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 18px; border-bottom-right-radius: 18px; }
        .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; background: #f4f7fe; color: #707eae; transition: 0.2s; }
        .btn-action:hover { transform: translateY(-3px); background: #4318ff; color: #fff; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(11,16,45,0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background: white; border-radius: 35px; padding: 40px; width: 90%; max-width: 550px; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="master-vendor-card">
        <div className="header-flex">
          <div className="header-text">
            <h1>Quản lý Đối tác</h1>
            <p>Dữ liệu thời gian thực từ hệ thống</p>
          </div>
          <div className="search-container">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Tìm tên hoặc email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="tabs-row">
          {['Active', 'Pending', 'Banned'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Active' ? 'ĐÃ DUYỆT' : tab === 'Pending' ? 'CHỜ DUYỆT' : 'BỊ KHÓA'} 
              ({vendors.filter(v => v.status === tab).length})
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Thông tin đối tác</th>
                <th>Ví Sandbox</th>
                <th>Sản phẩm</th>
                <th>Ngày tham gia</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(vendor => (
                <tr key={vendor.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={vendor.avatar} alt="v" style={{width: 45, height: 45, borderRadius: 12}} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#1b2559' }}>{vendor.name}</div>
                        <div style={{ fontSize: '12px', color: '#a3aed0' }}>{vendor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{color: '#a3aed0', fontWeight: 700, fontSize: '13px'}}><Wallet size={14}/> Chưa liên kết</div></td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#4318ff' }}>{vendor.totalProducts} <ShoppingBag size={12} style={{display:'inline', marginBottom:3}}/></div>
                    <div style={{ fontSize: '12px', color: '#f59e0b' }}>★ {vendor.rating}</div>
                  </td>
                  <td>
                    <div style={{ color: '#1b2559', fontWeight: 600 }}>{vendor.joinDate}</div>
                    <div style={{ fontSize: '12px', color: '#a3aed0' }}>{vendor.phone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setSelectedVendor(vendor); setModalType('view'); }} className="btn-action"><Eye size={18} /></button>
                      
                      {activeTab === 'Pending' && (
                        <button onClick={() => handleUpdateStatus(vendor.id, 'Active')} className="btn-action" style={{ color: '#10b981' }}><CheckCircle size={18} /></button>
                      )}

                      {activeTab !== 'Banned' ? (
                        <button onClick={() => { setSelectedVendor(vendor); setModalType('ban'); }} className="btn-action" style={{ color: '#e11d48' }}><Ban size={18} /></button>
                      ) : (
                        <button onClick={() => handleUpdateStatus(vendor.id, 'Active')} className="btn-action" style={{ color: '#10b981' }}><Unlock size={18} /></button>
                      )}

                      <button onClick={() => { setSelectedVendor(vendor); setModalType('password'); }} className="btn-action"><Key size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL SYSTEM --- */}
      {modalType && selectedVendor && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            {modalType === 'view' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <img src={selectedVendor.avatar} style={{ width: 100, borderRadius: 30 }} alt="v" />
                  <h2 style={{ color: '#1b2559', marginTop: 15 }}>{selectedVendor.name}</h2>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><label style={{fontSize:10, fontWeight:800, color:'#a3aed0'}}>EMAIL</label><div style={{fontWeight:700}}>{selectedVendor.email}</div></div>
                  <div><label style={{fontSize:10, fontWeight:800, color:'#a3aed0'}}>PHONE</label><div style={{fontWeight:700}}>{selectedVendor.phone}</div></div>
                  <div><label style={{fontSize:10, fontWeight:800, color:'#a3aed0'}}>THAM GIA</label><div style={{fontWeight:700}}>{selectedVendor.joinDate}</div></div>
                  <div><label style={{fontSize:10, fontWeight:800, color:'#a3aed0'}}>SẢN PHẨM</label><div style={{fontWeight:700}}>{selectedVendor.totalProducts}</div></div>
                </div>
              </>
            )}

            {modalType === 'password' && (
              <>
                <h3 style={{ fontWeight: 800, color: '#1b2559' }}>Cấp lại mật khẩu</h3>
                <input 
                  type="text" 
                  style={{width:'100%', padding:'12px', borderRadius:'12px', border:'1px solid #e0e5f2', marginTop: 15}} 
                  value={tempPassword} 
                  onChange={(e) => setTempPassword(e.target.value)}
                />
                <button onClick={handlePasswordUpdate} style={{ width: '100%', marginTop: '20px', padding: '15px', borderRadius: '15px', background: '#4318ff', color: 'white', fontWeight: 700, border: 'none' }}>CẬP NHẬT</button>
              </>
            )}

            {modalType === 'ban' && (
              <div style={{ textAlign: 'center' }}>
                <AlertOctagon size={60} color="#e11d48" />
                <h3 style={{ fontWeight: 800, marginTop: 15 }}>Đình chỉ đối tác?</h3>
                <p style={{ color: '#a3aed0' }}>Khóa quyền kinh doanh của <b>{selectedVendor.name}</b></p>
                <div style={{ display: 'flex', gap: '10px', marginTop: 25 }}>
                  <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#f4f7fe' }}>HỦY</button>
                  <button onClick={() => handleUpdateStatus(selectedVendor.id, 'Banned')} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#e11d48', color: 'white', fontWeight: 700 }}>KHÓA NGAY</button>
                </div>
              </div>
            )}
            <button onClick={() => setModalType(null)} style={{ width: '100%', marginTop: 15, border: 'none', background: 'none', color: '#a3aed0' }}>Đóng cửa sổ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;