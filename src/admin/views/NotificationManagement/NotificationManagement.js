import React, { useState, useEffect } from 'react';
import { 
  Send, Bell, ShoppingBag, Users, Store, Calendar ,
  Trash2, Clock, Zap, StopCircle, CheckCircle2, AlertCircle, Timer, X, User
} from 'lucide-react';

// ĐỔI ĐƯỜNG DẪN NÀY THÀNH ĐƯỜNG DẪN TỚI FILE PHP CỦA BẠN
const API_BASE_URL = 'http://localhost/nongsan-api/admin_notifications.php'; 

const NotificationManagement = () => {
  const [activeTab, setActiveTab] = useState('create'); 
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Thông tin Admin từ localStorage
  const [currentAdmin, setCurrentAdmin] = useState({ id: null, name: 'Admin' });

  // Form States
  const [targetGroup, setTargetGroup] = useState('ALL');
  const [notiType, setNotiType] = useState('GENERAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Time States
  const [timeMode, setTimeMode] = useState('AUTO'); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Cancel Modal States
  const [cancelModal, setCancelModal] = useState({ isOpen: false, id: null });
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  // Lấy thông tin user ngay khi component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setCurrentAdmin({
          id: userObj.id || null,
          name: userObj.name || 'Admin'
        });
      } catch (e) {
        console.error("Lỗi parse user data", e);
      }
    }
  }, []);

  // Helper lấy Token để gửi kèm header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Fetch danh sách khi mở tab Lịch sử
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}?action=list`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.status === 'success') {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
      return;
    }

    if (timeMode === 'MANUAL' && !startTime) {
      alert("Vui lòng chọn thời gian bắt đầu!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title,
        content,
        targetGroup,
        notiType,
        startTime: timeMode === 'MANUAL' ? startTime : null, 
        endTime: endTime || null,
        adminId: currentAdmin.id // Lấy ID đã lưu trong state (từ localStorage)
      };

      const res = await fetch(`${API_BASE_URL}?action=create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        alert("🎉 " + data.message);
        setTitle('');
        setContent('');
        setEndTime('');
        setStartTime('');
        setTimeMode('AUTO');
        setActiveTab('history');
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelModal = (id) => {
    setCancelReason('');
    setCancelModal({ isOpen: true, id });
  };

  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy thông báo!");
      return;
    }

    setIsCanceling(true);
    try {
      const res = await fetch(`${API_BASE_URL}?action=cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          id: cancelModal.id, 
          cancelReason: cancelReason,
          adminId: currentAdmin.id 
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCancelModal({ isOpen: false, id: null });
        fetchHistory();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi khi hủy thông báo!");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn thông báo này?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}?action=delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          id,
          adminId: currentAdmin.id
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchHistory();
      }
    } catch (error) {
      alert("Lỗi khi xóa thông báo!");
    }
  };

  const getDisplayStatus = (item) => {
    if (item.status === 'CANCELLED') return { text: 'Đã hủy', color: '#e11d48', bg: '#fff1f2', icon: <AlertCircle size={14}/> };
    
    const now = new Date();
    const start = item.start_time ? new Date(item.start_time) : new Date(item.created_at);
    const end = item.end_time ? new Date(item.end_time) : null;

    if (now < start) return { text: 'Chờ phát', color: '#d97706', bg: '#fef3c7', icon: <Timer size={14}/> };
    if (end && now > end) return { text: 'Đã kết thúc', color: '#64748b', bg: '#f1f5f9', icon: <CheckCircle2 size={14}/> };
    
    return { text: 'Đang phát', color: '#10b981', bg: '#ecfdf5', icon: <Zap size={14}/> };
  };

  return (
    <div className="admin-noti-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-noti-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1b2559; position: relative; }
        .master-card { background: #ffffff; border-radius: 40px; padding: 45px; box-shadow: 0 30px 70px -10px rgba(0,0,0,0.04); max-width: 1350px; margin: 0 auto; transition: all 0.3s ease;}
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-title h1 { font-size: 34px; font-weight: 800; letter-spacing: -1.5px; margin: 0; background: linear-gradient(90deg, #1b2559, #4318ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .admin-profile-badge { display: flex; align-items: center; gap: 12px; background: #fff; padding: 8px 16px; border-radius: 100px; border: 1px solid #E0E5F2; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .admin-avatar { width: 32px; height: 32px; border-radius: 50%; background: #4318ff; display: flex; align-items: center; justify-content: center; color: #fff; }

        .tab-nav { display: flex; background: #F4F7FE; padding: 6px; border-radius: 20px; width: fit-content; gap: 8px; margin-bottom: 40px; }
        .tab-btn { padding: 12px 30px; border-radius: 16px; border: none; cursor: pointer; font-weight: 800; font-size: 14px; color: #a3aed0; background: transparent; transition: 0.3s; }
        .tab-btn.active { background: #fff; color: #4318ff; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        
        .noti-form-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 60px; }
        .input-group { margin-bottom: 30px; }
        .input-label { display: block; font-size: 12px; font-weight: 800; color: #A3AED0; text-transform: uppercase; margin-bottom: 12px; }
        .form-input { width: 100%; padding: 16px 20px; border-radius: 18px; border: 2px solid #F4F7FE; background: #F4F7FE; font-weight: 600; color: #1B2559; outline: none; font-size: 15px; box-sizing: border-box; transition: all 0.3s;}
        .form-input:focus { border-color: #4318ff; background: #fff; box-shadow: 0 10px 20px rgba(67, 24, 255, 0.05); }
        
        .target-btn { flex: 1; padding: 15px; border-radius: 18px; border: 2px solid transparent; font-weight: 800; background: #F4F7FE; color: #707EAE; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: 0.3s; }
        .target-btn:hover { background: #e0e7ff; color: #4318ff; }
        .target-btn.active.all { border-color: #1b2559; background: #fff; color: #1b2559; box-shadow: 0 10px 20px rgba(27, 37, 89, 0.08); }
        .target-btn.active.vendor { border-color: #ffb547; background: #fff; color: #ffb547; box-shadow: 0 10px 20px rgba(255, 181, 71, 0.1); }
        .target-btn.active.user { border-color: #4318ff; background: #fff; color: #4318ff; box-shadow: 0 10px 20px rgba(67, 24, 255, 0.1); }
        
        .time-radio-group { display: flex; gap: 15px; margin-bottom: 15px; }
        .time-radio { flex: 1; display: flex; align-items: center; gap: 10px; padding: 14px; background: #F4F7FE; border-radius: 16px; cursor: pointer; border: 2px solid transparent; font-weight: 700; color: #707EAE; transition: 0.2s;}
        .time-radio:hover { background: #e0e7ff; color: #4318ff;}
        .time-radio.active { background: #e0e7ff; color: #4318ff; border-color: #4318ff; }
        .time-radio input { display: none; }

        .phone-frame { background: #000; border-radius: 50px; padding: 12px; width: 310px; height: 580px; margin: 0 auto; border: 4px solid #e0e5f2; position: relative; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.2); }
        .phone-screen { background: #fff; width: 100%; height: 100%; border-radius: 40px; overflow: hidden; position: relative; background: url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500') center/cover; }
        .phone-island { width: 100px; height: 25px; background: #000; position: absolute; top: 10px; left: 50%; transform: translateX(-50%); border-radius: 20px; z-index: 10; }
        .ios-noti { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); margin: 50px 15px; padding: 18px; border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        
        .h-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        .h-table tr:hover td { background: #f8fafc; }
        .h-table td { background: #fff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; transition: 0.2s ease;}
        .h-table td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        .h-table td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
        
        .btn-send { width: 100%; padding: 22px; border-radius: 22px; border: none; background: linear-gradient(135deg, #4318ff 0%, #1b2559 100%); color: #fff; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.3s; }
        .btn-send:hover:not(:disabled) { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(67, 24, 255, 0.3); }
        .btn-send:disabled { background: #a3aed0; cursor: not-allowed; }
        
        .action-btn { background: #f4f7fe; border: none; padding: 10px; border-radius: 12px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; margin-left: 8px;}
        .action-btn.stop { color: #d97706; }
        .action-btn.stop:hover { background: #fef3c7; transform: scale(1.1); }
        .action-btn.del { color: #e11d48; }
        .action-btn.del:hover { background: #fff1f2; transform: scale(1.1); }

        .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 20, 55, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.3s ease; }
        .custom-modal-box { background: #fff; width: 450px; border-radius: 30px; padding: 35px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); animation: slideUp 0.3s ease; position: relative; }
        .close-modal-btn { position: absolute; top: 20px; right: 20px; background: #f4f7fe; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #a3aed0; }
        
        .modal-textarea { width: 100%; background: #f4f7fe; border: 2px solid transparent; border-radius: 18px; padding: 18px; font-family: inherit; font-size: 14px; font-weight: 600; color: #1b2559; outline: none; resize: none; box-sizing: border-box; }
        .modal-textarea:focus { border-color: #e11d48; background: #fff; }
        .modal-actions { display: flex; gap: 15px; margin-top: 25px; }
        .modal-btn { flex: 1; padding: 16px; border-radius: 16px; font-weight: 800; cursor: pointer; border: none; transition: 0.3s; }
        .modal-btn.confirm { background: #e11d48; color: #fff; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="master-card">
        <div className="header-section">
          <div className="header-title">
            <h1>Broadcast Center</h1>
            <p style={{ color: '#a3aed0', fontWeight: 600, fontSize: '16px', marginTop: 8 }}>Quản lý và thiết lập lịch phát thông điệp</p>
          </div>
          <div className="admin-profile-badge">
            <div className="admin-avatar"><User size={18} /></div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#A3AED0' }}>LOGGED IN AS</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{currentAdmin.name}</div>
            </div>
          </div>
        </div>

        <div className="tab-nav">
          <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Tạo tin mới</button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Lịch sử & Quản lý</button>
        </div>

        {activeTab === 'create' && (
          <div className="noti-form-grid">
            <div>
              <div className="input-group">
                <label className="input-label">1. Đối tượng & Chủ đề</label>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <button onClick={() => setTargetGroup('ALL')} className={`target-btn all ${targetGroup === 'ALL' ? 'active' : ''}`}>
                    <Users size={20} /> Toàn bộ
                  </button>
                  <button onClick={() => setTargetGroup('VENDOR')} className={`target-btn vendor ${targetGroup === 'VENDOR' ? 'active' : ''}`}>
                    <Store size={20} /> Vendor
                  </button>
                  <button onClick={() => setTargetGroup('USER')} className={`target-btn user ${targetGroup === 'USER' ? 'active' : ''}`}>
                    <ShoppingBag size={20} /> Customer
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 15 }}>
                  <select className="form-input" value={notiType} onChange={(e) => setNotiType(e.target.value)}>
                    <option value="GENERAL">📢 Tin tức chung</option>
                    <option value="PROMOTION">🔥 Khuyến mãi</option>
                    <option value="HOLIDAYS">📅 Nghỉ lễ</option>
                    <option value="SYSTEM">🛠 Hệ thống</option>
                  </select>
                  <input 
                    className="form-input" 
                    placeholder="Nhập tiêu đề thông báo..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">2. Nội dung thông điệp</label>
                <textarea 
                  className="form-input" 
                  style={{ height: '120px', resize: 'none' }} 
                  placeholder="Viết lời nhắn gửi đến người dùng..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>

              <div className="input-group">
                <label className="input-label">3. Lịch phát sóng</label>
                <div className="time-radio-group">
                  <label className={`time-radio ${timeMode === 'AUTO' ? 'active' : ''}`}>
                    <input type="radio" checked={timeMode === 'AUTO'} onChange={() => setTimeMode('AUTO')} />
                    <Zap size={18}/> Phát ngay lập tức
                  </label>
                  <label className={`time-radio ${timeMode === 'MANUAL' ? 'active' : ''}`}>
                    <input type="radio" checked={timeMode === 'MANUAL'} onChange={() => setTimeMode('MANUAL')} />
                    <Calendar size={18}/> Hẹn giờ phát
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  {timeMode === 'MANUAL' ? (
                    <div>
                      <span style={{fontSize: 11, fontWeight: 700, color:'#707EAE', marginBottom: 5, display:'block'}}>BẮT ĐẦU TỪ</span>
                      <input type="datetime-local" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                  ) : (
                    <div style={{background: '#f8fafc', borderRadius: 18, padding: 15, border: '2px dashed #cbd5e1', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontWeight: 600, fontSize: 13}}>
                      Sẽ phát ngay khi bấm gửi
                    </div>
                  )}
                  <div>
                    <span style={{fontSize: 11, fontWeight: 700, color:'#707EAE', marginBottom: 5, display:'block'}}>KẾT THÚC VÀO (Tùy chọn)</span>
                    <input type="datetime-local" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
              </div>

              <button className="btn-send" onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "ĐANG XỬ LÝ..." : <><Send size={20} /> LƯU & THIẾT LẬP THÔNG BÁO</>}
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <label className="input-label" style={{ marginBottom: 20 }}>Xem trước thiết bị</label>
              <div className="phone-frame">
                <div className="phone-island"></div>
                <div className="phone-screen">
                  <div className="ios-noti">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ background: '#4318ff', padding: 6, borderRadius: 10 }}><Bell size={16} color="#fff" /></div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#1b2559' }}>V-SHOP AGRI</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1b2559', marginBottom: 6 }}>
                      {title || "[Tiêu đề thông báo]"}
                    </div>
                    <div style={{ fontSize: 13, color: '#707eae', lineHeight: 1.5, fontWeight: 500 }}>
                      {content || "Nội dung lời nhắn sẽ hiển thị tại đây..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="h-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: '#a3aed0', fontSize: 11, fontWeight: 800, paddingLeft: 20 }}>THÔNG TIN</th>
                  <th style={{ textAlign: 'left', color: '#a3aed0', fontSize: 11, fontWeight: 800 }}>THỜI GIAN</th>
                  <th style={{ textAlign: 'left', color: '#a3aed0', fontSize: 11, fontWeight: 800 }}>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right', color: '#a3aed0', fontSize: 11, fontWeight: 800, paddingRight: 20 }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => {
                  const statusInfo = getDisplayStatus(item);
                  const isFinished = statusInfo.text === 'Đã kết thúc' || statusInfo.text === 'Đã hủy';

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1b2559', fontSize: '15px', marginBottom: 6 }}>{item.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <span style={{ fontSize: 10, fontWeight: 800, color: '#4318ff', background: '#e0e7ff', padding: '4px 8px', borderRadius: '6px' }}>{item.type}</span>
                           <span style={{ fontSize: 11, fontWeight: 700, color: '#707EAE' }}>Đích: {item.target_group}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Bắt đầu: {item.start_time || item.created_at}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                          Kết thúc: {item.end_time || 'Không giới hạn'}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: statusInfo.bg, color: statusInfo.color, 
                          padding: '6px 12px', borderRadius: '10px', fontSize: 12, fontWeight: 800 
                        }}>
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                        {item.status === 'CANCELLED' && item.cancel_reason && (
                          <div style={{fontSize: 11, color: '#e11d48', marginTop: 4, maxWidth: 150}} title={item.cancel_reason}>
                            {item.cancel_reason.length > 20 ? item.cancel_reason.substring(0,20)+'...' : item.cancel_reason}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isFinished && (
                          <button onClick={() => openCancelModal(item.id)} className="action-btn stop" title="Ngừng / Hủy thông báo">
                            <StopCircle size={20}/>
                          </button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="action-btn del" title="Xóa vĩnh viễn">
                          <Trash2 size={20}/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <button className="close-modal-btn" onClick={() => setCancelModal({ isOpen: false, id: null })}>
              <X size={20} />
            </button>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1b2559', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle color="#e11d48" size={24} /> Xác nhận Hủy
            </div>
            <div style={{ fontSize: 14, color: '#707eae', fontWeight: 500, marginBottom: 25, lineHeight: 1.5 }}>
              Vui lòng nhập lý do hủy thông báo này. Hệ thống sẽ lưu lại người thực hiện và lý do để đối soát sau này.
            </div>
            
            <textarea 
              className="modal-textarea"
              rows={4}
              placeholder="Nhập lý do hủy (Bắt buộc)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              autoFocus
            />

            <div className="modal-actions">
              <button className="modal-btn" style={{ background: '#f4f7fe', color: '#707eae' }} onClick={() => setCancelModal({ isOpen: false, id: null })}>
                Quay lại
              </button>
              <button className="modal-btn confirm" onClick={submitCancel} disabled={isCanceling}>
                {isCanceling ? "ĐANG HỦY..." : "XÁC NHẬN HỦY"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;