import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Eye,
  XCircle,
  Truck,
  CheckCircle,
  User,
  MapPin,
  CreditCard,
  Clock,
  ShoppingBag,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Package,
  DollarSign,
  Info,
  ShieldAlert,
  Database // Thêm icon database cho tổng số
} from 'lucide-react';

import { API_BASE } from 'src/config';

// API endpoint for orders
const API_URL = `${API_BASE}/api_orders.php`;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(null);
  
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // --- 1. LẤY DỮ LIỆU TỪ BACKEND ---
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}?action=list_orders`);
      const result = await res.json();
      if (result.status === 'success') {
        setOrders(result.data);
      } else {
        console.error('Lỗi từ server:', result.message);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. BỘ LỌC TÌM KIẾM & TAB ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = o.id.toLowerCase().includes(searchLower) || 
                          o.customer.toLowerCase().includes(searchLower);
      
      if (activeTab === 'Cancelled') return o.status === 'Cancelled' && matchSearch;
      return o.status === activeTab && matchSearch;
    });
  }, [orders, activeTab, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // --- 3. LOGIC PHÂN TRANG ---
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Helper lấy tên Tab tiếng Việt cho đẹp
  const getActiveTabName = () => {
    switch(activeTab) {
      case 'Pending': return 'Chờ lấy hàng';
      case 'Shipping': return 'Đang giao';
      case 'Completed': return 'Đã giao';
      case 'Cancelled': return 'Đã hủy';
      default: return activeTab;
    }
  };

  // --- 4 & 5. CÁC HÀM XỬ LÝ API (Giữ nguyên) ---
  const handleUpdateStatus = async (db_id, newStatus) => {
    const statusText = newStatus === 'Shipping' ? 'Đang giao hàng' : 'Đã giao hàng';
    if (!window.confirm(`Xác nhận chuyển đơn hàng sang trạng thái: ${statusText}?`)) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', db_id: db_id, status: newStatus })
      });
      const result = await res.json();
      if (result.status === 'success') {
        fetchOrders(); 
        setModalType(null);
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn để thông báo cho Khách hàng!");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_order', db_id: selectedOrder.db_id, reason: cancelReason })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Đã hủy đơn hàng thành công!");
        fetchOrders();
        setModalType(null);
        setCancelReason(''); 
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="admin-order-wrapper">
      <style>{`
        .admin-order-wrapper { padding: 50px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .master-order-card {
          background: #ffffff; border-radius: 35px; padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04); border: 1px solid #ffffff;
          max-width: 1400px; margin: 0 auto;
        }

        .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .header-text h1 { font-size: 32px; font-weight: 800; color: #1b2559; letter-spacing: -1.2px; margin: 0; }
        .header-text p { color: #a3aed0; margin: 5px 0 0 0; font-weight: 500; }

        /* --- CSS MỚI CHO BANNER THỐNG KÊ --- */
        .stats-insight-banner {
          display: inline-flex; align-items: center; gap: 15px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          padding: 10px 20px; border-radius: 20px; margin-top: 15px;
        }
        .stat-part { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; font-weight: 500; }
        .stat-part strong { color: #0f172a; font-weight: 700; font-size: 14px; }
        .stat-divider { width: 1px; height: 18px; background: #cbd5e1; }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4318ff; box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.15);
        }
        /* ---------------------------------- */

        .search-input-group {
          background: #f4f7fe; border-radius: 20px; padding: 12px 20px;
          display: flex; align-items: center; width: 380px;
          border: 1px solid transparent; transition: 0.3s;
        }
        .search-input-group:focus-within { border-color: #4318ff; background: #fff; box-shadow: 0 10px 25px rgba(67, 24, 255, 0.05); }
        .search-input-group input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }

        .tabs-container { display: flex; background: #f4f7fe; padding: 6px; border-radius: 20px; width: fit-content; gap: 5px; margin-bottom: 30px; overflow-x: auto; max-width: 100%; }
        .tab-item {
          padding: 12px 25px; border-radius: 15px; border: none; cursor: pointer;
          font-weight: 700; font-size: 13px; color: #a3aed0; background: transparent;
          transition: 0.3s; text-transform: uppercase; white-space: nowrap;
        }
        .tab-item.active { background: #fff; color: #4318ff; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }

        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; text-align: left; }
        td { background: #fff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }

        .badge-status { padding: 7px 15px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; display: inline-block; }
        .status-Pending { background: #fff7ed; color: #c2410c; }
        .status-Shipping { background: #e0f2fe; color: #0369a1; }
        .status-Completed { background: #f0fdf4; color: #15803d; }
        .status-Cancelled { background: #fef2f2; color: #b91c1c; }

        .btn-box { 
          width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; transition: 0.2s; 
          background: #f4f7fe; color: #707eae; flex-shrink: 0;
        }
        .btn-box:hover:not(:disabled) { transform: translateY(-3px); background: #4318ff; color: #fff; }
        .btn-box:disabled { opacity: 0.5; cursor: not-allowed; }

        .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 25px; padding: 0 10px; }
        .pagination-info { color: #a3aed0; font-size: 14px; font-weight: 600; }
        .pagination-controls { display: flex; gap: 8px; align-items: center; }
        .page-btn { 
          min-width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0; 
          background: #fff; color: #707eae; font-weight: 600; cursor: pointer; transition: 0.2s; 
          display: flex; align-items: center; justify-content: center;
        }
        .page-btn:hover:not(:disabled) { background: #f4f7fe; color: #4318ff; border-color: #4318ff; }
        .page-btn.active { background: #4318ff; color: #fff; border-color: #4318ff; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-dots { color: #a3aed0; font-weight: 600; padding: 0 5px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(11, 16, 45, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow-y: auto; }
        .modal-form { background: white; border-radius: 35px; padding: 40px; width: 100%; max-width: 650px; position: relative; margin: auto; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #eef2f8; }
        .label-muted { color: #a3aed0; font-weight: 600; font-size: 14px; }
        .value-bold { color: #1b2559; font-weight: 700; font-size: 14px; text-align: right; word-break: break-word; max-width: 60%; }
      `}</style>

      <div className="master-order-card">
        <div className="header-row">
          <div className="header-text">
            <h1>Quản lý Đơn hàng</h1>
            <p>Xác nhận đơn, theo dõi vận chuyển và xử lý lỗi hệ thống</p>
            
            {/* THÊM BANNER THỐNG KÊ Ở ĐÂY */}
            <div className="stats-insight-banner">
              <div className="stat-part">
                <Database size={16} color="#4318ff" />
                <span>Tổng hệ thống: <strong style={{color: '#4318ff'}}>{orders.length}</strong></span>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-part">
                <div className="pulse-dot"></div>
                <span>
                  Đang xem: <strong>{getActiveTabName()}</strong> 
                  {totalItems > 0 ? (
                    <span style={{ color: '#94a3b8', marginLeft: '5px' }}>
                      (Trang {currentPage} • {startItem} - {endItem} / {totalItems})
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', marginLeft: '5px' }}>(0 đơn hàng)</span>
                  )}
                </span>
              </div>
            </div>
            {/* KẾT THÚC BANNER THỐNG KÊ */}
            
          </div>
          
          <div className="search-input-group">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Mã đơn hoặc tên khách hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="tabs-container">
          <button className={`tab-item ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>
            Chờ lấy hàng ({orders.filter(o => o.status === 'Pending').length})
          </button>
          <button className={`tab-item ${activeTab === 'Shipping' ? 'active' : ''}`} onClick={() => setActiveTab('Shipping')}>
            Đang giao ({orders.filter(o => o.status === 'Shipping').length})
          </button>
          <button className={`tab-item ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>
            Đã giao ({orders.filter(o => o.status === 'Completed').length})
          </button>
          <button className={`tab-item ${activeTab === 'Cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('Cancelled')}>
            Đã hủy ({orders.filter(o => o.status === 'Cancelled').length})
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? paginatedOrders.map(order => (
                <tr key={order.db_id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1b2559' }}>#{order.id}</div>
                    <div style={{ fontSize: '12px', color: '#a3aed0', marginTop: '4px' }}><Clock size={12} style={{verticalAlign:'middle'}}/> {order.date}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#1b2559' }}><User size={13} style={{display:'inline', marginBottom:2}}/> {order.customer}</span>
                    </div>
                  </td>
                  <td>
                    {/* ĐÃ CHỈNH SỬA: Xóa order.shipFee và hiển thị Miễn phí */}
                    <div style={{ fontWeight: 800, color: '#1b2559' }}>{formatPrice(order.total)}</div>
                    <div style={{ fontSize: '11px', color: '#a3aed0', marginTop: '2px' }}>
                      Phí ship: <span style={{color: '#10b981', fontWeight: 700}}>Miễn phí</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-status status-${order.status}`}>
                      {order.status === 'Pending' ? 'Chờ lấy hàng' : order.status === 'Shipping' ? 'Đang vận chuyển' : order.status === 'Completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setSelectedOrder(order); setModalType('view'); }} className="btn-box" title="Xem chi tiết"><Eye size={18} /></button>
                      
                      {order.status === 'Pending' && (
                        <>
                          <button disabled={isProcessing} onClick={() => handleUpdateStatus(order.db_id, 'Shipping')} className="btn-box" style={{ color: '#10b981', background: '#f0fdf4' }} title="Cập nhật thành Đang giao"><Truck size={18} /></button>
                          <button onClick={() => { setSelectedOrder(order); setCancelReason(''); setModalType('cancel'); }} className="btn-box" style={{ color: '#e11d48', background: '#fef2f2' }} title="Hủy đơn hàng"><XCircle size={18} /></button>
                        </>
                      )}
                      
                      {order.status === 'Shipping' && (
                         <button disabled={isProcessing} onClick={() => handleUpdateStatus(order.db_id, 'Completed')} className="btn-box" style={{ color: '#10b981', background: '#f0fdf4' }} title="Xác nhận Đã giao xong"><CheckCircle size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '80px 0', color: '#a3aed0' }}>
                    <ShoppingBag size={48} style={{ margin: '0 auto 15px', opacity: 0.2 }} />
                    <p style={{ fontWeight: 600 }}>Không tìm thấy đơn hàng nào ở mục này</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- GIAO DIỆN PHÂN TRANG (Giữ nguyên) --- */}
        {totalItems > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Hiển thị {startItem} - {endItem} / {totalItems} đơn hàng
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="page-dots">...</span>
                ) : (
                  <button 
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {modalType && selectedOrder && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-form" onClick={e => e.stopPropagation()}>
            {modalType === 'view' && (
              <>
                <h3 style={{ fontWeight: 800, color: '#1b2559', marginBottom: '30px', borderLeft: '5px solid #4318ff', paddingLeft: '15px' }}>
                  CHI TIẾT ĐƠN HÀNG #{selectedOrder.id}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#f4f7fe', padding: '20px', borderRadius: '24px' }}>
                    <h6 style={{ fontWeight: 800, fontSize: '12px', color: '#a3aed0', marginBottom: '15px' }}>THÔNG TIN NGƯỜI MUA</h6>
                    <div className="detail-row"><span className="label-muted">Họ tên:</span><span className="value-bold">{selectedOrder.customer}</span></div>
                    <div className="detail-row"><span className="label-muted">Địa chỉ:</span><span className="value-bold">{selectedOrder.address || 'Chưa cập nhật'}</span></div>
                    <div className="detail-row"><span className="label-muted">Thanh toán:</span><span className="value-bold">{selectedOrder.payment || 'Tiền mặt'}</span></div>
                  </div>
                  <div style={{ background: '#f4f7fe', padding: '20px', borderRadius: '24px' }}>
                    <h6 style={{ fontWeight: 800, fontSize: '12px', color: '#a3aed0', marginBottom: '15px' }}>THÔNG TIN GIAO DỊCH</h6>
                    <div className="detail-row"><span className="label-muted">Lập lúc:</span><span className="value-bold">{selectedOrder.date}</span></div>
                    <div className="detail-row"><span className="label-muted">Trạng thái:</span>
                      <span className="value-bold text-success" style={{color: '#10b981'}}>
                        {selectedOrder.status === 'Pending' ? 'Chờ lấy hàng' : selectedOrder.status === 'Shipping' ? 'Đang giao' : selectedOrder.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ border: '2px solid #f1f4f9', padding: '20px', borderRadius: '24px' }}>
                  <div className="detail-row"><span className="label-muted">Tiền hàng:</span><span className="value-bold">{formatPrice(selectedOrder.total)}</span></div>
                  
                  {/* ĐÃ CHỈNH SỬA: Hiển thị Miễn phí thay vì tính phí ship */}
                  <div className="detail-row">
                    <span className="label-muted">Phí giao hàng:</span>
                    <span className="value-bold" style={{color: '#10b981'}}>Miễn phí</span>
                  </div>
                  <div className="detail-row" style={{ border: 'none' }}>
                    <span className="label-muted" style={{color:'#1b2559', fontSize:16}}>Tổng cộng:</span>
                    <span className="value-bold" style={{color:'#4318ff', fontSize:18}}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
                <button onClick={() => setModalType(null)} style={{ width: '100%', marginTop: '30px', padding: '16px', borderRadius: '18px', border: 'none', background: '#1b2559', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
                  ĐÓNG THÔNG TIN
                </button>
              </>
            )}

            {modalType === 'cancel' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fff1f2', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                   <ShieldAlert size={40} color="#e11d48" />
                </div>
                <h3 style={{ fontWeight: 800, color: '#1b2559' }}>Hủy đơn hàng cưỡng chế?</h3>
                <p style={{ color: '#a3aed0', marginBottom: '25px', fontSize: '14px', lineHeight: 1.5 }}>
                  Khi Admin thực hiện lệnh này, đơn hàng #{selectedOrder.id} sẽ bị hủy ngay lập tức.<br/> 
                  <b style={{color: '#b91c1c'}}>Đơn hàng sau khi hủy sẽ không thể khôi phục.</b>
                </p>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #e0e5f2', outline: 'none', height: '120px', background: '#f8fafc', fontSize: '14px', resize: 'none', color: '#1e293b' }} 
                  placeholder="Lý do hủy đơn (Bắt buộc - Thông tin này sẽ gửi tới khách hàng)..."
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                  <button disabled={isProcessing} onClick={() => setModalType(null)} style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', background: '#f4f7fe', color: '#1b2559', fontWeight: 700, cursor: 'pointer' }}>
                    QUAY LẠI
                  </button>
                  <button disabled={isProcessing} onClick={handleCancelOrder} style={{ flex: 1, padding: '16px', borderRadius: '18px', border: 'none', background: '#e11d48', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN HỦY'}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;