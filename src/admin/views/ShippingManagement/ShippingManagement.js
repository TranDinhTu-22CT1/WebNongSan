import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, Search, MapPin, Weight, Plus, Settings, CheckCircle, XCircle, 
  Clock, Eye, Trash2, Edit3, Navigation, ShieldCheck, Package, 
  ChevronRight, ChevronLeft, List, AlertTriangle, ThermometerSnowflake, Leaf, 
  Zap, Calendar, User, Store, ToggleLeft, ToggleRight, AlertOctagon,
  DollarSign
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_URL = `${API_BASE}/shipping.php`;

const ShippingManagement = () => {
  const [carriers, setCarriers] = useState([]);
  const [rates, setRates] = useState([]);
  const [ordersList, setOrdersList] = useState([]); // Danh sách đơn hàng
  
  const [activeTab, setActiveTab] = useState('tracking');
  const [trackingView, setTrackingView] = useState('list'); // 'list' hoặc 'detail'
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State cho Modals
  const [modalType, setModalType] = useState(null); // 'edit_carrier' | 'cancel_shipping' | 'edit_rate'
  const [targetItem, setTargetItem] = useState(null);
  
  // Dữ liệu nhập trong modal
  const [editData, setEditData] = useState({});
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. LẤY DỮ LIỆU (CÀI ĐẶT & DANH SÁCH ĐƠN) TỪ BACKEND ---
  const fetchData = async () => {
    try {
      // Gọi API lấy Settings (Carriers & Rates)
      const resSettings = await fetch(`${API_URL}?action=get_settings`);
      const resultSettings = await resSettings.json();
      if (resultSettings.status === 'success') {
        setCarriers(resultSettings.data.carriers);
        setRates(resultSettings.data.rates);
      }

      // Gọi API lấy List Orders cho Tab Hành Trình
      const resOrders = await fetch(`${API_URL}?action=list_shipping_orders`);
      const resultOrders = await resOrders.json();
      if (resultOrders.status === 'success') {
        setOrdersList(resultOrders.data);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu API:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HÀM HỖ TRỢ HIỂN THỊ ICON TIMELINE ---
  const getTimelineStyle = (status) => {
    const text = status?.toLowerCase() || "";
    if (text.includes('thành công') || text.includes('hoàn thành') || text.includes('đã giao')) return { icon: <CheckCircle size={16}/>, color: "#10b981" };
    if (text.includes('giao') || text.includes('vận chuyển')) return { icon: <Truck size={16}/>, color: "#4318ff" };
    if (text.includes('kho') || text.includes('đóng gói') || text.includes('lấy hàng')) return { icon: <Package size={16}/>, color: "#707eae" };
    if (text.includes('hủy')) return { icon: <XCircle size={16}/>, color: "#e11d48" };
    return { icon: <Store size={16}/>, color: "#f59e0b" };
  };

  // --- 3. XEM CHI TIẾT HÀNH TRÌNH 1 ĐƠN HÀNG ---
  const handleViewTracking = async (orderCode) => {
    // Đảm bảo orderCode có giá trị và chuyển thành chuỗi
    const cleanCode = String(orderCode || "").trim();
    
    if (!cleanCode || cleanCode === "undefined") {
       alert("Lỗi: Không tìm thấy mã đơn hàng hoặc ID hợp lệ!");
       return;
    }

    try {
      // Sử dụng encodeURIComponent để tránh lỗi ký tự đặc biệt trong URL
      const res = await fetch(`${API_URL}?action=track_order&code=${encodeURIComponent(cleanCode)}`);
      const result = await res.json();
      
      if (result.status === 'success') {
        const enrichedTimeline = result.data.timeline.map(t => {
          const style = getTimelineStyle(t.status);
          return { ...t, ...style };
        });
        setSelectedOrder({ ...result.data, timeline: enrichedTimeline });
        setTrackingView('detail');
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ API");
    }
  };

  // Tìm kiếm bằng Enter
  const handleSearchEnter = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleViewTracking(searchTerm.trim());
    }
  };

  // --- 4. BẬT TẮT TRẠNG THÁI (ĐỐI TÁC / GIÁ CƯỚC) ---
  const handleToggleStatus = async (id, type) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', id, type })
      });
      fetchData(); 
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  // --- 5. LƯU THAY ĐỔI ĐỐI TÁC VẬN CHUYỂN ---
  const handleSaveCarrier = async () => {
    if (!editData.name) return alert("Vui lòng nhập tên đối tác");
    setIsProcessing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_carrier', id: targetItem.id, ...editData })
      });
      const result = await res.json();
      if (result.status === 'success') {
        fetchData();
        setModalType(null);
      } else alert(result.message);
    } catch (err) {
      alert("Lỗi xử lý, vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 6. LƯU CẤU HÌNH PHÍ SHIP (MỚI) ---
  const handleSaveRate = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'edit_rate', 
          id: targetItem.id, 
          base: editData.base, 
          per_kg: editData.per_kg, 
          express: editData.express 
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Cập nhật bảng giá thành công!");
        fetchData();
        setModalType(null);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 7. HỦY VẬN CHUYỂN (ADMIN CƯỠNG CHẾ) ---
  const handleCancelShipping = async () => {
    if (!cancelReason.trim()) return alert("Vui lòng nhập lý do hủy!");
    setIsProcessing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_shipping', order_db_id: targetItem.db_id, reason: cancelReason })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Đã hủy vận chuyển thành công!");
        setModalType(null);
        setCancelReason('');
        // Refresh lại dữ liệu nếu đang ở view detail
        if (selectedOrder && (selectedOrder.id === targetItem.id || selectedOrder.db_id === targetItem.db_id)) {
           handleViewTracking(targetItem.order_code || targetItem.db_id); 
        }
        fetchData();
      } else alert(result.message);
    } catch (err) {
      alert("Lỗi xử lý, vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Lọc danh sách Order
  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      const code = String(o.order_code || o.db_id || o.id || '');
      const customer = String(o.customer || '');
      const vendor = String(o.vendor || '');
      return code.toLowerCase().includes(searchTerm.toLowerCase()) || 
             customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
             vendor.toLowerCase().includes(searchTerm.toLowerCase())
    });
  }, [ordersList, searchTerm]);

  return (
    <div className="shipping-admin-wrapper">
      <style>{`
        .shipping-admin-wrapper { padding: 50px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1b2559;}
        .master-form { background: #fff; border-radius: 40px; padding: 45px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.05); max-width: 1400px; margin: 0 auto; border: 1px solid #fff; }
        
        .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-title h1 { font-size: 34px; font-weight: 800; color: #1B2559; letter-spacing: -1.2px; margin: 0; }
        .header-title p { color: #a3aed0; margin-top: 8px;}
        
        .tab-group { display: flex; gap: 40px; border-bottom: 2px solid #f1f4f9; margin-bottom: 30px; }
        .tab-item { padding: 15px 5px; cursor: pointer; font-weight: 700; color: #a3aed0; position: relative; text-transform: uppercase; font-size: 14px; transition: 0.3s; }
        .tab-item.active { color: #4318ff; }
        .tab-item.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 3px; background: #4318ff; border-radius: 10px; }

        .search-ship { background: #f4f7fe; border-radius: 18px; padding: 12px 20px; display: flex; align-items: center; width: 380px; border: 1px solid transparent; transition: 0.3s; }
        .search-ship:focus-within { border-color: #4318ff; background: #fff; box-shadow: 0 10px 25px rgba(67, 24, 255, 0.05); }
        .search-ship input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }

        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; text-align: left;}
        td { background: #fff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; color: #1b2559; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }

        .timeline-container { border-left: 2px solid #f1f4f9; margin-left: 20px; padding-left: 30px; position: relative; }
        .timeline-item { position: relative; margin-bottom: 25px; }
        .timeline-dot { position: absolute; left: -39px; top: 0; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 3px solid; display: flex; align-items: center; justify-content: center; }
        
        .toggle-icon { cursor: pointer; transition: 0.3s; }
        .toggle-active { color: #10b981; }
        .toggle-inactive { color: #a3aed0; }
        
        .category-tag { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
        .cat-rau { background: #e6fcf5; color: #087f5b; }
        .cat-dong-lanh { background: #e7f5ff; color: #1971c2; }
        
        .badge-status { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; display: inline-block; }
        .badge-gray { background: #f1f5f9; color: #475569; }
        .badge-blue { background: #eff6ff; color: #2563eb; }
        .badge-green { background: #ecfdf5; color: #059669; }
        .badge-red { background: #fef2f2; color: #dc2626; }

        .btn-action-back { background: #f4f7fe; color: #4318ff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; margin-bottom: 25px; }
        .btn-action-back:hover { background: #e2e8f0; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(11, 16, 45, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow-y: auto;}
        .modal-card { background: white; border-radius: 30px; padding: 40px; width: 100%; max-width: 550px; box-shadow: 0 30px 60px rgba(0,0,0,0.1); margin: auto; }

        input[type="number"] { -moz-appearance: textfield; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div className="master-form">
        <div className="header-flex">
          <div className="header-title">
            <h1>Điều phối Vận chuyển</h1>
            <p>Tối ưu phí ship cho nông sản & Quản lý vận hành</p>
          </div>
          <div className="search-ship">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Tìm mã đơn, khách, vendor... (hoặc Enter để Track)" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
          </div>
        </div>

        <div className="tab-group">
          <div className={`tab-item ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => {setActiveTab('tracking'); setTrackingView('list');}}>Hành trình đơn</div>
          <div className={`tab-item ${activeTab === 'carriers' ? 'active' : ''}`} onClick={() => setActiveTab('carriers')}>Đối tác vận tải</div>
          <div className={`tab-item ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')}>Cấu hình phí ship</div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          
          {/* TAB 1: HÀNH TRÌNH ĐƠN */}
          {activeTab === 'tracking' && (
            trackingView === 'list' ? (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Người mua</th>
                      <th>Cửa hàng (Vendor)</th>
                      <th>Thời gian tạo</th>
                      <th>Trạng thái giao hàng</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(order => {
                      const displayId = order.order_code || order.db_id || order.id;
                      return (
                        <tr key={order.db_id || order.id}>
                          <td><b style={{color: '#1b2559'}}>#{displayId}</b></td>
                          <td><div style={{fontWeight: 600}}>{order.customer}</div></td>
                          <td>{order.vendor}</td>
                          <td style={{color: '#a3aed0', fontSize: '13px'}}>{order.created_at}</td>
                          <td>
                            <span className={`badge-status ${order.status === 'Đã hủy' ? 'badge-red' : order.status === 'Đã giao hàng' ? 'badge-green' : order.status === 'Đang giao hàng' ? 'badge-blue' : 'badge-gray'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => handleViewTracking(displayId)}
                              style={{borderRadius: 12, padding: '10px 16px', border: 'none', background: '#f4f7fe', color: '#4318ff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '0.2s'}}
                            >
                              <Eye size={16}/> Xem
                            </button>
                          </td>
                        </tr>
                      );
                    }) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '60px', color: '#94a3b8'}}><Navigation size={48} style={{opacity:0.2, margin:'0 auto 10px'}}/><p>Không tìm thấy đơn hàng phù hợp</p></td></tr>}
                  </tbody>
                </table>
              </div>
            ) : (
              selectedOrder && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <button onClick={() => setTrackingView('list')} className="btn-action-back">
                    <ChevronLeft size={18}/> Quay lại danh sách
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                    <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '30px', border: '1px solid #f1f4f9', height: 'fit-content' }}>
                      <h4 style={{ fontWeight: 800, color: '#1b2559', marginBottom: '20px' }}>Thông tin điều phối</h4>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', textTransform: 'uppercase' }}>Mã đơn hàng</div>
                        <div style={{ fontWeight: 700, color: '#4318ff' }}>#{selectedOrder.id}</div>
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', textTransform: 'uppercase' }}>Người mua</div>
                        <div style={{ fontWeight: 700 }}>{selectedOrder.customer}</div>
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', textTransform: 'uppercase' }}>Cửa hàng</div>
                        <div style={{ fontWeight: 700 }}>{selectedOrder.vendor}</div>
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', textTransform: 'uppercase' }}>Đơn vị vận chuyển</div>
                        <div style={{ fontWeight: 700 }}>{selectedOrder.carrier}</div>
                      </div>
                      
                      <button 
                        onClick={() => { setTargetItem(selectedOrder); setCancelReason(''); setModalType('cancel_shipping'); }}
                        style={{ width: '100%', padding: '15px', marginTop: '10px', borderRadius: '15px', border: 'none', background: '#fef2f2', color: '#e11d48', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                      >
                        HỦY VẬN CHUYỂN
                      </button>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 800, color: '#1b2559', marginBottom: '30px' }}>Chi tiết hành trình</h4>
                      <div className="timeline-container">
                        {selectedOrder.timeline.map((step, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-dot" style={{ color: step.color, borderColor: step.color }}>{step.icon}</div>
                            <div style={{ fontWeight: 800, color: '#1b2559', fontSize: '15px' }}>{step.status}</div>
                            <div style={{ fontSize: '12px', color: '#a3aed0', margin: '4px 0' }}>{step.time}</div>
                            <div style={{ fontSize: '13px', color: '#707eae' }}>{step.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          )}

          {/* TAB 2: ĐỐI TÁC VẬN TẢI */}
          {activeTab === 'carriers' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <table>
                <thead>
                  <tr>
                    <th>Đơn vị vận tải</th>
                    <th>Loại hình</th>
                    <th>Hoạt động</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {carriers.map(c => (
                    <tr key={c.id} style={{ opacity: c.is_active ? 1 : 0.5 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img src={c.logo_url} style={{ width: 45, borderRadius: '12px', background: '#f8fafc' }} alt="logo" />
                          <div style={{ fontWeight: 800 }}>{c.name}</div>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{c.type}</span></td>
                      <td>
                        <div onClick={() => handleToggleStatus(c.id, 'carrier')} className={`toggle-icon ${c.is_active ? 'toggle-active' : 'toggle-inactive'}`}>
                          {c.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => { setTargetItem(c); setEditData({name: c.name, contact: c.contact_phone}); setModalType('edit_carrier'); }}
                          style={{borderRadius:12, padding:10, border:'none', background:'#f4f7fe', cursor:'pointer', color:'#4318ff'}}
                        >
                          <Edit3 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CẤU HÌNH PHÍ (RATES) */}
          {activeTab === 'rates' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <table>
                <thead>
                  <tr>
                    <th>Khu vực & Loại hàng</th>
                    <th>Phí cơ bản</th>
                    <th>Phụ phí hỏa tốc</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(r => (
                    <tr key={r.id} style={{ opacity: r.is_active ? 1 : 0.5 }}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1b2559', marginBottom: '4px' }}>{r.zone_name}</div>
                        <span className={`category-tag ${r.product_type === 'Rau củ' ? 'cat-rau' : 'cat-dong-lanh'}`}>
                          {r.product_type === 'Rau củ' ? <Leaf size={10}/> : <ThermometerSnowflake size={10}/>} {r.product_type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#10b981' }}>{formatPrice(r.base_price)}</div>
                        <div style={{ fontSize: '11px', color: '#a3aed0' }}>+ {formatPrice(r.price_per_kg)} / 1kg</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#f59e0b' }}><Zap size={12} style={{display:'inline'}}/> {formatPrice(r.express_surcharge)}</div>
                      </td>
                      <td>
                        <div onClick={() => handleToggleStatus(r.id, 'rate')} className={`toggle-icon ${r.is_active ? 'toggle-active' : 'toggle-inactive'}`}>
                          {r.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => { 
                            setTargetItem(r); 
                            setEditData({base: r.base_price, per_kg: r.price_per_kg, express: r.express_surcharge}); 
                            setModalType('edit_rate'); 
                          }}
                          style={{borderRadius:12, padding:10, border:'none', background:'#f4f7fe', color:'#4318ff', cursor:'pointer'}}
                        >
                          <Settings size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            
            {/* Modal: Hủy Vận Chuyển */}
            {modalType === 'cancel_shipping' && (
              <div style={{ textAlign: 'center' }}>
                <AlertOctagon size={60} color="#e11d48" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontWeight: 800, color: '#1b2559' }}>Hủy vận chuyển #{targetItem.id || targetItem.order_code}</h3>
                <p style={{ color: '#a3aed0', marginBottom: '25px', fontSize: '14px' }}>Lệnh hủy từ Admin sẽ ngay lập tức dừng việc giao nhận hàng.</p>
                <textarea 
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #e0e5f2', background: '#f8fafc', height: '100px', outline: 'none', color: '#1e293b', resize: 'none' }}
                  placeholder="Lý do hủy..."
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#f4f7fe', fontWeight: 700, cursor: 'pointer', color: '#1b2559' }}>QUAY LẠI</button>
                  <button onClick={handleCancelShipping} disabled={isProcessing} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#e11d48', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN HỦY'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Sửa Đối Tác */}
            {modalType === 'edit_carrier' && (
              <>
                <h3 style={{ fontWeight: 800, marginBottom: '25px', color: '#1b2559' }}>Cập nhật đối tác</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#a3aed0', display: 'block', marginBottom: '5px' }}>TÊN ĐƠN VỊ</label>
                  <input 
                    value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e5f2', fontWeight: 600, color: '#1b2559', outline: 'none' }} 
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#a3aed0', display: 'block', marginBottom: '5px' }}>HOTLINE LIÊN HỆ</label>
                  <input 
                    value={editData.contact} onChange={e => setEditData({...editData, contact: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e5f2', fontWeight: 600, color: '#1b2559', outline: 'none' }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                  <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#f4f7fe', fontWeight: 700, cursor: 'pointer', color: '#1b2559' }}>HỦY</button>
                  <button onClick={handleSaveCarrier} disabled={isProcessing} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#4318ff', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                  </button>
                </div>
              </>
            )}

            {/* Modal: Sửa Giá Cước (MỚI) */}
            {modalType === 'edit_rate' && (
              <>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px'}}>
                  <div style={{background: '#f4f7fe', padding: '10px', borderRadius: '12px', color: '#4318ff'}}>
                    <DollarSign size={24}/>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: '#1b2559', margin: 0 }}>Cấu hình bảng giá</h3>
                    <p style={{fontSize: '12px', color: '#a3aed0', margin: 0}}>{targetItem?.zone_name} • {targetItem?.product_type}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', display: 'block', marginBottom: '6px' }}>PHÍ CƠ BẢN (VNĐ)</label>
                    <input 
                      type="number"
                      value={editData.base} 
                      onChange={e => setEditData({...editData, base: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e0e5f2', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', display: 'block', marginBottom: '6px' }}>PHÍ TRÊN MỖI KG (+ VNĐ)</label>
                    <input 
                      type="number"
                      value={editData.per_kg} 
                      onChange={e => setEditData({...editData, per_kg: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e0e5f2', fontWeight: 700, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#a3aed0', display: 'block', marginBottom: '6px' }}>PHỤ PHÍ HỎA TỐC (VNĐ)</label>
                    <input 
                      type="number"
                      value={editData.express} 
                      onChange={e => setEditData({...editData, express: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #e0e5f2', fontWeight: 700, color: '#f59e0b', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '35px' }}>
                  <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#f4f7fe', fontWeight: 700, cursor: 'pointer', color: '#1b2559' }}>ĐÓNG</button>
                  <button 
                    disabled={isProcessing}
                    onClick={handleSaveRate} 
                    style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: '#4318ff', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: isProcessing ? 0.7 : 1 }}
                  >
                    {isProcessing ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT GIÁ'}
                  </button>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManagement;