import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Search, Eye, Key, ShieldCheck, ShoppingBag, 
  RefreshCcw, Mail, Phone, Calendar, CheckCircle, 
  XCircle, ShieldAlert, CreditCard, ShoppingBasket, Wallet, Trash2
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_URL = `${API_BASE}/handle_customers.php`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}`, 'X-Access-Token': token } : {}),
  };
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]); // Lưu đơn hàng fetch từ API
  const [newPassword, setNewPassword] = useState('USER@2026');

  // --- 1. FETCH DANH SÁCH KHÁCH HÀNG ---
  const fetchCustomers = async () => {
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
        setCustomers(Array.isArray(result.data) ? result.data : []);
      } else {
        setCustomers([]);
        setApiError(result.message || 'Khong the tai du lieu khach hang.');
      }
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
      setCustomers([]);
      setApiError('Khong the ket noi API khach hang. Vui long dang nhap lai hoac kiem tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- 2. FETCH ĐƠN HÀNG KHI MỞ MODAL ---
  const handleOpenOrders = async (customer) => {
    setSelectedCustomer(customer);
    setModalType('orders');
    try {
      const res = await fetch(`${API_URL}?action=orders&customer_id=${customer.id}`, {
        headers: getAuthHeaders()
      });
      const result = await res.json();
      setCustomerOrders(result.data || []);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng");
    }
  };

  // --- 3. ĐỔI MẬT KHẨU ---
  const handleUpdatePassword = async () => {
    if(!window.confirm("Xác nhận đổi mật khẩu?")) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_password',
          id: selectedCustomer.id,
          password: newPassword
        })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Cập nhật thành công!");
        setModalType(null);
      }
    } catch (err) {
      alert("Lỗi server");
    }
  };

  // --- 4. XÓA TÀI KHOẢN KHÁCH HÀNG ---
  const handleDeleteCustomer = async (customer) => {
    if (!customer?.id) return;

    const confirmed = window.confirm(
      `Xác nhận xóa tài khoản ${customer.name}? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'delete_customer',
          id: customer.id,
        })
      });

      const result = await res.json();
      if (result.status === 'success') {
        alert('Đã xóa tài khoản khách hàng.');
        setModalType(null);
        setSelectedCustomer(null);
        fetchCustomers();
      } else {
        alert(`Lỗi: ${result.message || 'Không thể xóa tài khoản'}`);
      }
    } catch (err) {
      alert('Lỗi kết nối khi xóa tài khoản');
    }
  };

  // --- 5. XỬ LÝ TRANH CHẤP ---
  const handleDispute = async (decision) => {
    // Lưu ý: Phần này cần mã đơn hàng thực tế (order_code)
    // Ở đây mình ví dụ xử lý cho đơn mới nhất hoặc đơn cố định
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'handle_dispute',
          order_code: 'ORD-9921', // Cần lấy mã thực tế từ sub-component
          decision: decision
        })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Đã xử lý tranh chấp!");
        setModalType(null);
        fetchCustomers(); // Load lại tiền spend nếu có thay đổi
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // --- LOGIC TÌM KIẾM ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Đang tải dữ liệu khách hàng...</div>;

  return (
    <div className="admin-customer-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        /* Giữ nguyên phần CSS của bạn */
        .admin-customer-wrapper { padding: 50px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .master-customer-container { background: #ffffff; border-radius: 32px; padding: 40px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05); max-width: 1400px; margin: 0 auto; }
        .form-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .header-info h1 { font-size: 32px; font-weight: 800; color: #1b2559; letter-spacing: -1.2px; margin: 0; }
        .header-info p { color: #a3aed0; margin: 5px 0 0 0; font-weight: 500; font-size: 15px; }
        .search-box-unified { background: #f4f7fe; border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; width: 380px; border: 1.5px solid transparent; transition: 0.3s; }
        .search-box-unified:focus-within { border-color: #4318ff; background: #fff; box-shadow: 0 10px 25px rgba(67, 24, 255, 0.05); }
        .search-box-unified input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }
        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; }
        td { background: #fff; padding: 18px 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 18px; border-bottom-left-radius: 18px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 18px; border-bottom-right-radius: 18px; }
        .tag { padding: 6px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .tag-Verified { background: #e6fffa; color: #047857; }
        .tag-Warning { background: #fff1f2; color: #e11d48; }
        .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; background: #f4f7fe; color: #707eae; }
        .btn-action:hover { transform: translateY(-3px); background: #4318ff; color: #fff; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(11, 16, 45, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background: white; border-radius: 35px; padding: 40px; width: 90%; max-width: 650px; }
        .api-error-banner { margin-bottom: 16px; border: 1px solid #fee2e2; background: #fff1f2; color: #9f1239; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 700; }
      `}</style>

      <div className="master-customer-container">
        <div className="form-header-row">
          <div className="header-info">
            <h1>Quản lý Khách hàng</h1>
            <p>Dữ liệu thời gian thực từ hệ thống</p>
          </div>
          <div className="search-box-unified">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Tìm khách hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

  {apiError ? <div className="api-error-banner">{apiError}</div> : null}

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Ví liên kết</th>
                <th>Tổng chi tiêu</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={customer.avatar} style={{ width: 48, height: 48, borderRadius: '14px' }} alt="avt" />
                      <div>
                        <div style={{ fontWeight: 800, color: '#1b2559' }}>{customer.name}</div>
                        <div style={{ fontSize: '12px', color: '#a3aed0' }}>{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="zalopay-status zalopay-unlinked" style={{fontSize:'13px', color: '#a3aed0'}}>
                       <Wallet size={14}/> Sandbox Mode
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#4318ff' }}>{customer.spend}</div>
                    <div style={{ fontSize: '12px', color: '#707eae' }}>{customer.totalOrders} đơn hàng</div>
                  </td>
                  <td>
                    <span className={`tag tag-${customer.status}`}>{customer.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setSelectedCustomer(customer); setModalType('view'); }} className="btn-action"><Eye size={18} /></button>
                      <button onClick={() => handleOpenOrders(customer)} className="btn-action"><ShoppingBag size={18} /></button>
                      <button onClick={() => { setSelectedCustomer(customer); setModalType('dispute'); }} className="btn-action" style={{color:'#e11d48'}}><RefreshCcw size={18} /></button>
                      <button onClick={() => { setSelectedCustomer(customer); setModalType('password'); }} className="btn-action"><Key size={18} /></button>
                      <button onClick={() => handleDeleteCustomer(customer)} className="btn-action" style={{color:'#ef4444'}} title="Xóa tài khoản"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>Không có khách hàng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL SYSTEM --- */}
      {modalType && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h3 style={{ fontWeight: 800 }}>{modalType.toUpperCase()}</h3>
                <button onClick={() => setModalType(null)} style={{ border: 'none', background: 'none' }}><XCircle/></button>
            </div>

            {modalType === 'view' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{gridColumn:'1/-1', display: 'flex', gap: '20px', marginBottom: '10px'}}>
                    <img src={selectedCustomer.avatar} style={{width: 60, borderRadius: '15px'}} />
                    <div>
                        <div style={{fontWeight: 800}}>{selectedCustomer.name}</div>
                        <div style={{fontSize: '13px', color: '#a3aed0'}}>Gia nhập: {selectedCustomer.joinDate}</div>
                    </div>
                </div>
                <InfoBox label="SĐT" value={selectedCustomer.phone} />
                <InfoBox label="Email" value={selectedCustomer.email} />
                <div style={{gridColumn:'1/-1'}}><InfoBox label="Địa chỉ" value={selectedCustomer.address || 'Chưa cập nhật'} /></div>
              </div>
            )}

            {modalType === 'orders' && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                 {customerOrders.length > 0 ? customerOrders.map((order, idx) => (
                    <OrderRow key={idx} {...order} isDanger={order.status === 'Hủy'} />
                 )) : <p>Không có lịch sử mua hàng</p>}
              </div>
            )}

            {modalType === 'dispute' && (
              <div style={{ textAlign: 'center' }}>
                <ShieldAlert size={60} color="#e11d48" style={{ marginBottom: '20px' }} />
                <p>Xử lý yêu cầu hoàn tiền gần nhất của khách hàng?</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                  <button onClick={() => handleDispute('refund')} style={{ flex: 1, height: 50, background: '#10b981', color: '#fff', border:'none', borderRadius:'15px', fontWeight:700 }}>Chấp nhận</button>
                  <button onClick={() => handleDispute('reject')} style={{ flex: 1, height: 50, background: '#4318ff', color: '#fff', border:'none', borderRadius:'15px', fontWeight:700 }}>Từ chối</button>
                </div>
              </div>
            )}

            {modalType === 'password' && (
              <div style={{ textAlign: 'center' }}>
                <Key size={60} color="#f59e0b" style={{ marginBottom: '20px' }} />
                <input 
                    type="text" 
                    style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 700 }} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={handleUpdatePassword} style={{ width: '100%', height: 50, background: '#4318ff', color: '#fff', border:'none', borderRadius:'15px', marginTop: '20px', fontWeight: 700 }}>CẬP NHẬT</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBox = ({ label, value }) => (
  <div style={{ padding: '15px', background: '#f4f7fe', borderRadius: '16px' }}>
    <div style={{ fontSize: '10px', color: '#a3aed0', fontWeight: 800 }}>{label}</div>
    <div style={{ fontSize: '14px', fontWeight: 700 }}>{value}</div>
  </div>
);

const OrderRow = ({ id, date, price, status, isDanger }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '18px', marginBottom: '10px' }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: '14px' }}>#{id}</div>
      <div style={{ fontSize: '12px', color: '#a3aed0' }}>{date}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontWeight: 800, color: '#4318ff' }}>{price}</div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: isDanger ? '#e11d48' : '#10b981' }}>{status}</div>
    </div>
  </div>
);

export default CustomerManagement;