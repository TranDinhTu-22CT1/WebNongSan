import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, RefreshCcw, Search, XCircle, CreditCard, Banknote,
  Calendar, Hash, Check, Clock, AlertCircle, History, Download
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_URL = `${API_BASE}/api_payments.php`;

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('payout');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State quản lý việc load dữ liệu và chờ API
  const [payouts, setPayouts] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // FETCH DỮ LIỆU TỪ BACKEND
  const fetchData = async () => {
    try {
      const resPayout = await fetch(`${API_URL}?action=list_payouts`);
      const dataPayout = await resPayout.json();
      if (dataPayout.status === 'success') {
        setPayouts(dataPayout.data);
      }

      const resRefund = await fetch(`${API_URL}?action=list_refunds`);
      const dataRefund = await resRefund.json();
      if (dataRefund.status === 'success') {
        setRefunds(dataRefund.data);
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu API:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset tìm kiếm khi đổi Tab
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  // LOGIC TÌM KIẾM TỨC THÌ (LIVE SEARCH)
  const filteredPayouts = payouts.filter(p => {
    if (activeTab !== 'payout') return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      p.id.toLowerCase().includes(searchLower) || 
      p.vendor.toLowerCase().includes(searchLower)
    );
  });

  const filteredRefunds = refunds.filter(r => {
    if (activeTab !== 'refund') return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(searchLower) || 
      r.customer.toLowerCase().includes(searchLower) ||
      r.vendor.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // HÀM XỬ LÝ PHÊ DUYỆT (GỌI API)
  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);

    const isPayout = activeTab === 'payout';
    const actionType = isPayout ? 'approve_payout' : 'approve_refund';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, db_id: selectedItem.db_id }) // db_id được trả về từ api_payments.php
      });
      const result = await res.json();
      
      if (result.status === 'success') {
        alert(result.message);
        setIsModalOpen(false);
        fetchData(); // Load lại dữ liệu ngay sau khi duyệt thành công
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ API!');
    } finally {
      setIsProcessing(false);
    }
  };

  // TÍNH TOÁN THỐNG KÊ (Dựa trên dữ liệu thực tế)
  const statsPayout = {
    totalApproved: payouts.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + (curr.raw_amount || 0), 0),
    pendingCount: payouts.filter(p => p.status === 'Pending').length
  };

  const statsRefund = {
    totalRefunded: refunds.filter(r => r.status === 'Approved').reduce((acc, curr) => acc + (curr.raw_amount || 0), 0),
    openTickets: refunds.filter(r => r.status === 'Pending' || r.status === 'Dispute').length,
    resolvedTickets: refunds.filter(r => r.status === 'Approved' || r.status === 'Rejected').length
  };

  return (
    <div className="payment-admin-wrapper">
      <style>{`
        /* KHÓA MÀU SÁNG TUYỆT ĐỐI */
        .payment-admin-wrapper { 
          color-scheme: light !important; padding: 40px 20px;  
          min-height: 100vh; font-family: 'Inter', sans-serif; color: #1e293b !important;
          display: flex; justify-content: center; background: #f8fafc;
        }
        .main-admin-card {
          background: #ffffff !important; width: 100%; max-width: 1150px;
          border-radius: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          overflow: hidden; border: 1px solid #e2e8f0; height: fit-content;
        }
        .card-toolbar {
          padding: 24px 32px; background: #ffffff !important;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .tab-group { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; }
        .tab-btn { 
          padding: 8px 20px; border-radius: 10px; border: none; font-size: 14px; 
          font-weight: 700; cursor: pointer; transition: 0.2s; color: #64748b; background: none;
        }
        .tab-btn.active { background: #ffffff !important; color: #4318ff !important; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .search-container { position: relative; width: 350px; }
        .search-input {
          width: 100%; padding: 12px 16px 12px 42px; border-radius: 14px;
          border: 1px solid #e2e8f0; background: #f8fafc !important;
          font-size: 14px; outline: none; transition: 0.2s; color: #1e293b !important;
        }
        .search-input:focus { border-color: #4318ff; background: #fff !important; box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.05); }
        .card-body { padding: 32px; background: #ffffff !important; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .stat-box { background: #f8fafc !important; padding: 20px; border-radius: 20px; border: 1px solid #f1f5f9; }
        .table-section { border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; background: #fff !important; }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 16px 24px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        td { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b !important; }
        .badge { padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }
        .badge-blue { background: #eff6ff !important; color: #2563eb !important; }
        .badge-green { background: #ecfdf5 !important; color: #059669 !important; }
        .badge-red { background: #fef2f2 !important; color: #dc2626 !important; }
        .btn-action { padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-weight: 700; cursor: pointer; color: #1e293b !important; transition: 0.2s; }
        .btn-action:hover { border-color: #cbd5e1; background: #f8fafc; }
        .overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-form { background: #fff !important; border-radius: 32px; width: 600px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      `}</style>

      <div className="main-admin-card">
        {/* Toolbar: 1 hàng duy nhất cho Tab và Live Search */}
        <div className="card-toolbar">
          <div className="tab-group">
            <button className={`tab-btn ${activeTab === 'payout' ? 'active' : ''}`} onClick={() => setActiveTab('payout')}>
              Phê duyệt rút tiền
            </button>
            <button className={`tab-btn ${activeTab === 'refund' ? 'active' : ''}`} onClick={() => setActiveTab('refund')}>
              Khiếu nại hoàn tiền
            </button>
          </div>

          <div className="search-container">
            <Search size={18} color="#94a3b8" style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)'}} />
            <input 
              type="text" 
              className="search-input" 
              placeholder={activeTab === 'payout' ? "Gõ mã PAY hoặc tên cửa hàng..." : "Gõ mã REF, tên KH hoặc Vendor..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật ngay khi gõ
            />
          </div>
        </div>

        <div className="card-body">
          {activeTab === 'payout' ? (
            <>
              <div className="stats-row">
                <StatCard icon={<Banknote color="#4318ff"/>} label="Số tiền duyệt" value={`${statsPayout.totalApproved.toLocaleString('vi-VN')}đ`} />
                <StatCard icon={<Clock color="#ea580c"/>} label="Đơn rút treo" value={`${statsPayout.pendingCount.toString().padStart(2, '0')} yêu cầu`} />
                <StatCard icon={<ShieldCheck color="#059669"/>} label="An toàn" value="Tuyệt đối" />
              </div>

              <div className="table-section">
                <table>
                  <thead>
                    <tr>
                      <th>Mã PAY</th>
                      <th>Cửa hàng</th>
                      <th>Số dư khả dụng</th>
                      <th>Số tiền rút</th>
                      <th>Trạng thái</th>
                      <th style={{textAlign: 'right'}}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.length > 0 ? filteredPayouts.map(p => (
                      <tr key={p.db_id}>
                        <td style={{fontWeight: 700}}>{p.id}</td>
                        <td style={{fontWeight: 600}}>{p.vendor}</td>
                        <td style={{color: '#64748b'}}>{p.balance}đ</td>
                        <td style={{fontWeight: 800, color: '#4318ff'}}>{p.amount}đ</td>
                        <td>
                          <span className={`badge ${p.status === 'Pending' ? 'badge-blue' : p.status === 'Approved' ? 'badge-green' : 'badge-red'}`}>
                            {p.status === 'Pending' ? 'Đợi duyệt' : p.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
                          </span>
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <button className="btn-action" onClick={() => handleOpenDetail(p)}>
                            {p.status === 'Pending' ? 'Duyệt' : 'Xem'}
                          </button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Không tìm thấy lệnh rút phù hợp</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="stats-row">
                <StatCard icon={<RefreshCcw color="#dc2626"/>} label="Quỹ hoàn trả" value={`${statsRefund.totalRefunded.toLocaleString('vi-VN')}đ`} />
                <StatCard icon={<AlertCircle color="#dc2626"/>} label="Ticket mở" value={`${statsRefund.openTickets.toString().padStart(2, '0')} ticket`} />
                <StatCard icon={<History color="#059669"/>} label="Xử lý xong" value={`${statsRefund.resolvedTickets.toString().padStart(2, '0')} đơn`} />
              </div>

              <div className="table-section">
                <table>
                  <thead>
                    <tr>
                      <th>Mã REF</th>
                      <th>Khách hàng</th>
                      <th>Vendor bị khiếu nại</th>
                      <th>Số tiền</th>
                      <th>Lý do</th>
                      <th style={{textAlign: 'right'}}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefunds.length > 0 ? filteredRefunds.map(r => (
                      <tr key={r.db_id}>
                        <td style={{fontWeight: 700}}>{r.id}</td>
                        <td style={{fontWeight: 600}}>{r.customer}</td>
                        <td>{r.vendor}</td>
                        <td style={{fontWeight: 800, color: '#dc2626'}}>{r.amount}đ</td>
                        <td style={{fontSize: '13px', color: '#64748b'}}>{r.reason}</td>
                        <td style={{textAlign: 'right'}}>
                          <button className="btn-action" onClick={() => handleOpenDetail(r)}>
                             {(r.status === 'Pending' || r.status === 'Dispute') ? 'Phân xử' : 'Xem'}
                          </button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Không tìm thấy khiếu nại phù hợp</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal xử lý Duyệt/Hoàn */}
      {isModalOpen && selectedItem && (
        <div className="overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-form" onClick={e => e.stopPropagation()}>
            <div style={{padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2 style={{fontSize: '18px', fontWeight: 900, color: '#1b2559'}}>
                {activeTab === 'payout' ? 'Phê duyệt rút tiền' : 'Xử lý hoàn tiền'}
              </h2>
              <XCircle size={24} color="#94a3b8" cursor="pointer" onClick={() => setIsModalOpen(false)}/>
            </div>
            
            <div style={{padding: '24px'}}>
              <div style={{textAlign: 'center', padding: '24px', background: '#f0f7ff', borderRadius: '24px', border: '1px dashed #4318ff', marginBottom: '24px'}}>
                <div style={{fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase'}}>Giá trị đơn</div>
                <div style={{fontSize: '32px', fontWeight: 900, color: activeTab === 'payout' ? '#4318ff' : '#dc2626'}}>
                  {selectedItem.amount}đ
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px'}}>
                <InfoItem label="ID yêu cầu" value={selectedItem.id} />
                <InfoItem label={activeTab === 'payout' ? "Bên yêu cầu" : "Thông tin Đối chiếu"} value={activeTab === 'payout' ? selectedItem.vendor : `${selectedItem.customer} ➔ ${selectedItem.vendor}`} />
                <InfoItem label="Thời gian" value={selectedItem.date} />
                <InfoItem label="Thông tin nguồn" value={selectedItem.method || selectedItem.orderId} />
              </div>

              <div style={{padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b'}}>
                <strong>Thông tin thêm / Lý do:</strong>
                <p style={{marginTop: '8px', color: '#475569', lineHeight: 1.5}}>
                  {selectedItem.notes || selectedItem.reason || "Không có thêm ghi chú."}
                </p>
                <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', fontSize: '13px'}}>
                  Trạng thái hiện tại: <span style={{fontWeight: 700, color: selectedItem.status === 'Pending' || selectedItem.status === 'Dispute' ? '#f59e0b' : '#10b981'}}>{selectedItem.status}</span>
                </div>
              </div>
            </div>

            <div style={{padding: '20px 24px', background: '#f8fafc', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px'}}>
               <button className="btn-action" onClick={() => setIsModalOpen(false)}>Đóng lại</button>
               
               {/* CHỈ HIỂN THỊ NÚT DUYỆT KHI ĐƠN CHƯA ĐƯỢC DUYỆT */}
               {(selectedItem.status === 'Pending' || selectedItem.status === 'Dispute') && (
                 <button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  style={{
                    padding: '12px 20px', borderRadius: '12px', border: 'none', 
                    background: activeTab === 'payout' ? '#4318ff' : '#dc2626', 
                    color: '#fff', fontWeight: 700, 
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1
                  }}
                 >
                   {isProcessing ? 'Đang xử lý...' : (activeTab === 'payout' ? 'Duyệt lệnh rút' : 'Đồng ý hoàn tiền')}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="stat-box">
    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
      {icon} <span style={{fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase'}}>{label}</span>
    </div>
    <div style={{fontSize: '20px', fontWeight: 900, color: '#1e293b'}}>{value}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div style={{padding: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px'}}>
    <div style={{fontSize: '10px', color: '#94a3b8', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase'}}>{label}</div>
    <div style={{fontSize: '13px', fontWeight: 700, color: '#1e293b'}}>{value}</div>
  </div>
);

export default PaymentManagement;