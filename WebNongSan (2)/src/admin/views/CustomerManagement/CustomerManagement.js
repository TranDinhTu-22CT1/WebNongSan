import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Search, Eye, Key, ShieldCheck, ShoppingBag, 
  RefreshCcw, Mail, Phone, Calendar, CheckCircle, 
  XCircle, ShieldAlert, CreditCard, ShoppingBasket, Wallet, Trash2,
  ChevronLeft, ChevronRight
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
  const [customerOrders, setCustomerOrders] = useState([]); 
  const [newPassword, setNewPassword] = useState('USER@2026');

  // --- URL PARAMS PHÂN TRANG ---
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const ITEMS_PER_PAGE = 15;

  const handlePageChange = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNumber);
    setSearchParams(newParams);
  };

  useEffect(() => {
    if (searchTerm !== '') {
      handlePageChange(1);
    }
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setApiError('');
      const res = await fetch(`${API_URL}?action=list`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.status === 'success') {
        setCustomers(Array.isArray(result.data) ? result.data : []);
      } else {
        setCustomers([]);
        setApiError(result.message || 'Không thể tải dữ liệu khách hàng.');
      }
    } catch (err) {
      setCustomers([]);
      setApiError('Không thể kết nối API khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenOrders = async (customer) => {
    setSelectedCustomer(customer);
    setModalType('orders');
    try {
      const res = await fetch(`${API_URL}?action=orders&customer_id=${customer.id}`, { headers: getAuthHeaders() });
      const result = await res.json();
      setCustomerOrders(result.data || []);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng");
    }
  };

  const handleUpdatePassword = async () => {
    if(!window.confirm("Xác nhận đổi mật khẩu?")) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'update_password', id: selectedCustomer.id, password: newPassword })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Cập nhật thành công!");
        setModalType(null);
      }
    } catch (err) { alert("Lỗi server"); }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!customer?.id) return;
    const confirmed = window.confirm(`Xác nhận xóa tài khoản ${customer.name}? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'delete_customer', id: customer.id })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert('Đã xóa tài khoản khách hàng.');
        setModalType(null);
        setSelectedCustomer(null);
        fetchCustomers();
      } else { alert(`Lỗi: ${result.message}`); }
    } catch (err) { alert('Lỗi kết nối khi xóa tài khoản'); }
  };

  const handleDispute = async (decision) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'handle_dispute', order_code: 'ORD-9921', decision: decision })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Đã xử lý tranh chấp!");
        setModalType(null);
        fetchCustomers(); 
      }
    } catch (err) { alert("Lỗi kết nối"); }
  };

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
    );
    return filtered.sort((a, b) => (Number(b.total_orders) || 0) - (Number(a.total_orders) || 0));
  }, [customers, searchTerm]);

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, startIndex, endIndex]);

  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (safePage >= totalPages - 3) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
      }
    }
    return pages;
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Đang tải dữ liệu khách hàng...</div>;

  return (
    <div className="admin-customer-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-customer-wrapper { padding: 50px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .master-customer-container { background: #ffffff; border-radius: 32px; padding: 40px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05); max-width: 1400px; margin: 0 auto; }
        .form-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .header-info h1 { font-size: 32px; font-weight: 800; color: #1b2559; letter-spacing: -1.2px; margin: 0; }
        .header-info p { color: #a3aed0; margin: 5px 0 0 0; font-weight: 500; font-size: 15px; }
        .customer-count { color: #4318ff; font-weight: 700; background: #f4f7fe; padding: 4px 10px; border-radius: 8px; margin-left: 8px; }
        .search-box-unified { background: #f4f7fe; border-radius: 20px; padding: 12px 20px; display: flex; align-items: center; width: 380px; border: 1.5px solid transparent; transition: 0.3s; }
        .search-box-unified:focus-within { border-color: #4318ff; background: #fff; box-shadow: 0 10px 25px rgba(67, 24, 255, 0.05); }
        .search-box-unified input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }
        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; text-align: left; }
        td { background: #fff; padding: 18px 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 18px; border-bottom-left-radius: 18px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 18px; border-bottom-right-radius: 18px; }
        .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; background: #f4f7fe; color: #707eae; }
        .btn-action:hover { transform: translateY(-3px); background: #4318ff; color: #fff; }
        .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 0 10px; }
        .page-text-info { font-size: 14px; font-weight: 600; color: #a3aed0; }
        .pagination-controls { display: flex; align-items: center; gap: 8px; }
        .page-btn { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 14px; border: none; background: #f4f7fe; color: #4318ff; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { background: #4318ff; color: white; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 10px; font-weight: 700; color: #a3aed0; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .page-num-btn:hover:not(:disabled) { background: #f4f7fe; color: #4318ff; }
        .page-num-btn.active { background: #4318ff; color: white; box-shadow: 0 5px 15px rgba(67, 24, 255, 0.2); }
        .page-dots { color: #a3aed0; font-weight: 700; padding: 0 5px; letter-spacing: 2px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(11, 16, 45, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { background: white; border-radius: 35px; padding: 40px; width: 90%; max-width: 650px; }
      `}</style>

      <div className="master-customer-container">
        <div className="form-header-row">
          <div className="header-info">
            <h1>Quản lý Khách hàng</h1>
            <p>
              Dữ liệu thời gian thực từ hệ thống 
              <span className="customer-count">
                Hiển thị {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} / {totalItems} khách hàng
              </span>
            </p>
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

        {apiError ? <div style={{background:'#fff1f2', color:'#e11d48', padding:'15px', borderRadius:'15px', marginBottom:'20px', fontWeight:700}}>{apiError}</div> : null}

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Ví liên kết</th>
                <th>Tổng chi tiêu (Đã giao)</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length > 0 ? paginatedCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={customer.avatar} style={{ width: 48, height: 48, borderRadius: '14px', objectFit:'cover' }} alt="avt" />
                      <div>
                        <div style={{ fontWeight: 800, color: '#1b2559' }}>{customer.name}</div>
                        <div style={{ fontSize: '12px', color: '#a3aed0' }}>{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontSize:'13px', color: '#a3aed0'}}>
                       <Wallet size={14}/> Sandbox Mode
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#4318ff', fontSize: '15px' }}>
                      {formatCurrency(customer.total_spend)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#707eae', fontWeight: 600 }}>
                      {customer.total_orders || 0} đơn hàng
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setSelectedCustomer(customer); setModalType('view'); }} className="btn-action"><Eye size={18} /></button>
                      <button onClick={() => handleOpenOrders(customer)} className="btn-action"><ShoppingBag size={18} /></button>
                      <button onClick={() => { setSelectedCustomer(customer); setModalType('dispute'); }} className="btn-action" style={{color:'#e11d48'}}><RefreshCcw size={18} /></button>
                      <button onClick={() => { setSelectedCustomer(customer); setModalType('password'); }} className="btn-action"><Key size={18} /></button>
                      <button onClick={() => handleDeleteCustomer(customer)} className="btn-action" style={{color:'#ef4444'}}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '100px', color: '#a3aed0' }}>Không có khách hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="page-text-info">Trang {safePage} / {totalPages}</div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={safePage === 1} onClick={() => handlePageChange(safePage - 1)}><ChevronLeft size={16} /> Trước</button>
              {getPaginationGroup().map((item, index) => (
                item === '...' ? <span key={index} className="page-dots">...</span> : 
                <button key={index} className={`page-num-btn ${safePage === item ? 'active' : ''}`} onClick={() => handlePageChange(item)}>{item}</button>
              ))}
              <button className="page-btn" disabled={safePage === totalPages} onClick={() => handlePageChange(safePage + 1)}>Sau <ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {modalType && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h3 style={{ fontWeight: 800 }}>{modalType.toUpperCase()}</h3>
                <button onClick={() => setModalType(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={24} color="#a3aed0"/></button>
            </div>
            {modalType === 'view' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{gridColumn:'1/-1', display: 'flex', gap: '20px', marginBottom: '10px'}}>
                    <img src={selectedCustomer.avatar} style={{width: 60, height: 60, borderRadius: '15px', objectFit: 'cover'}} alt="avt"/>
                    <div>
                        <div style={{fontWeight: 800, fontSize: '18px', color: '#1b2559'}}>{selectedCustomer.name}</div>
                        <div style={{fontSize: '13px', color: '#a3aed0', marginTop: '4px'}}>Gia nhập: {selectedCustomer.joinDate}</div>
                    </div>
                </div>
                <div style={{ padding: '15px', background: '#f4f7fe', borderRadius: '16px' }}><div style={{ fontSize: '11px', color: '#a3aed0', fontWeight: 800 }}>SĐT</div><div>{selectedCustomer.phone || 'N/A'}</div></div>
                <div style={{ padding: '15px', background: '#f4f7fe', borderRadius: '16px' }}><div style={{ fontSize: '11px', color: '#a3aed0', fontWeight: 800 }}>EMAIL</div><div>{selectedCustomer.email}</div></div>
                <div style={{gridColumn:'1/-1', padding: '15px', background: '#f4f7fe', borderRadius: '16px' }}><div style={{ fontSize: '11px', color: '#a3aed0', fontWeight: 800 }}>ĐỊA CHỈ</div><div>{selectedCustomer.address || 'Chưa cập nhật'}</div></div>
              </div>
            )}
            {modalType === 'orders' && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                 {customerOrders.length > 0 ? customerOrders.map((order, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '18px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                        <div><div style={{ fontWeight: 800, fontSize: '14px' }}>{order.order_code}</div><div style={{ fontSize: '12px', color: '#a3aed0' }}>{order.date}</div></div>
                        <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, color: '#4318ff' }}>{formatCurrency(order.total_amount)}</div><div style={{ fontSize: '11px', fontWeight: 800, color: order.delivery_status === 'Hủy' ? '#e11d48' : '#10b981' }}>{order.delivery_status}</div></div>
                    </div>
                 )) : <p style={{textAlign: 'center', color: '#a3aed0', padding: '20px'}}>Không có lịch sử mua hàng</p>}
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
                <input type="text" style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700 }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button onClick={handleUpdatePassword} style={{ width: '100%', height: 50, background: '#4318ff', color: '#fff', border:'none', borderRadius:'15px', marginTop: '20px', fontWeight: 700 }}>CẬP NHẬT MẬT KHẨU</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;