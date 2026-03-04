import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Eye, Edit, Trash2, 
  Clock, Zap, Gift,
  TrendingUp, BarChart3, ArrowRight, X, Save, Moon, Sun, AlertTriangle
} from 'lucide-react';

// Cập nhật đường dẫn tới file PHP của bạn
const API_URL = 'http://localhost/nongsan-api/sale.php';

const SaleManagement = () => {
  const [promos, setPromos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [currentPromo, setCurrentPromo] = useState({
    name: '', type: 'Flash Sale', discount: '', status: 'Active', start: '', end: '', usageLimit: ''
  });

  // Lấy danh sách từ API
  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${API_URL}?action=list`);
      const result = await res.json();
      if (result.status === 'success') {
        setPromos(result.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ưu đãi:", err);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const openModal = (mode, data = null) => {
    setModalMode(mode);
    if (data) {
      setCurrentPromo({ ...data }); 
    } else {
      setCurrentPromo({ name: '', type: 'Flash Sale', discount: '', status: 'Active', start: '', end: '', usageLimit: '' });
    }
    setShowModal(true);
  };

  const openDeleteModal = (data) => {
    setCurrentPromo(data);
    setShowDeleteModal(true);
  };

  // Hàm LƯU (Thêm mới hoặc Cập nhật)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentPromo.name || !currentPromo.discount) return;
    
    setIsSubmitting(true);
    
    // Gán action dựa trên modalMode (edit trên UI sẽ gọi api update)
    const actionType = modalMode === 'edit' ? 'update' : 'create';
    
    const submitData = {
      action: actionType,
      ...currentPromo
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const result = await res.json();
      
      if (result.status === 'success') {
        fetchPromotions(); // Tải lại danh sách
        setShowModal(false);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ API!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm XÓA
  const confirmDelete = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: currentPromo.id })
      });
      
      const result = await res.json();
      if (result.status === 'success') {
        fetchPromotions();
        setShowDeleteModal(false);
      } else {
        alert("Lỗi xóa: " + result.message);
      }
    } catch (err) {
      alert('Lỗi kết nối API!');
    }
  };

  const stats = {
    active: promos.filter(p => p.status === 'Active').length,
    total: promos.length,
    vouchers: promos.filter(p => p.type === 'Voucher').length
  };

  return (
    <div className={`sale-admin-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <style>{`
        /* BIẾN MÀU SẮC CHỦ ĐẠO */
        .sale-admin-wrapper {
          --bg-card: #ffffff;
          --bg-input: #ffffff;
          --bg-input-disabled: #f8f9fe;
          --text-main: #1b2559;
          --text-sub: #a3aed0;
          --border-color: #e0e5f2;
          --btn-action-bg: #f4f7fe;
          
          background: var(--bg-body);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }

        /* CHẾ ĐỘ DARK MODE */
        .sale-admin-wrapper.dark-mode {
          --bg-body: #0b1437;
          --bg-card: #111c44;
          --bg-input: #1b254b;
          --bg-input-disabled: #0b1437;
          --text-main: #ffffff;
          --text-sub: #a3aed0;
          --border-color: #2b3674;
          --btn-action-bg: #1b254b;
        }

        .main-card { background: var(--bg-card); width: 100%; max-width: 1200px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); padding: 30px; border: 1px solid var(--border-color); }
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); }
        
        .btn-create { background: #4318ff; color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        
        .stats-inner-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-item { background: var(--bg-card); padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; border: 1px solid var(--border-color); }

        table { width: 100%; border-collapse: collapse; }
        th { padding: 15px 20px; text-align: left; color: var(--text-sub); font-size: 12px; text-transform: uppercase; }
        td { padding: 18px 20px; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-main); }

        .btn-action { width: 34px; height: 34px; border-radius: 8px; border: none; background: var(--btn-action-bg); color: var(--text-sub); cursor: pointer; margin-left: 6px; }

        .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px; }
        .modal-card { background: var(--bg-card); border-radius: 28px; width: 100%; max-width: 550px; padding: 35px; position: relative; border: 1px solid var(--border-color); margin: auto; }
        
        /* NÚT X ĐÓNG FORM */
        .btn-close-x {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--text-sub);
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-close-x:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; font-size: 11px; font-weight: 800; color: var(--text-sub); margin-bottom: 8px; text-transform: uppercase; }
        
        .input-group input, .input-group select { 
          width: 100%; 
          padding: 14px; 
          border: 1px solid var(--border-color); 
          border-radius: 14px; 
          background-color: var(--bg-input); 
          color: var(--text-main); 
          font-weight: 500;
          outline: none;
        }
        
        .input-group input:disabled, .input-group select:disabled { 
          background: var(--bg-input-disabled); 
          cursor: not-allowed; 
          opacity: 0.7;
        }

        .dark-mode-toggle {
          position: fixed; top: 20px; right: 20px; background: var(--bg-card); border: 1px solid var(--border-color);
          width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-main); box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .badge-Active { background: #e6fffa; color: #047857; }
        .badge-Expired { background: #fee2e2; color: #ef4444; }

        .btn-danger-outline {
          background: transparent;
          border: 1.5px solid #ef4444;
          color: #ef4444;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-danger-outline:hover {
          background: #ef4444;
          color: white;
        }
      `}</style>

      {/* Nút chuyển đổi giao diện */}
      <button className="dark-mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
      </button>

      <div className="main-card">
        <div className="header-section">
          <div>
            <h1 style={{fontSize: '24px', fontWeight: 800, color: 'var(--text-main)'}}>Quản lý Ưu đãi</h1>
            <p style={{color: 'var(--text-sub)', fontSize: '14px'}}>Theo dõi và điều chỉnh chiến dịch khuyến mãi</p>
          </div>
          <button className="btn-create" onClick={() => openModal('create')}>
            <Plus size={18} /> Tạo chiến dịch
          </button>
        </div>

        <div className="stats-inner-grid">
          <div className="stat-item">
            <div className="icon-circle" style={{background: '#eef2ff', color: '#4318ff', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'}}><Zap size={18}/></div>
            <div><div style={{fontSize: '12px', color: 'var(--text-sub)'}}>Đang chạy</div><b style={{fontSize: '18px', color: 'var(--text-main)'}}>{stats.active}</b></div>
          </div>
          <div className="stat-item">
            <div className="icon-circle" style={{background: '#ecfdf5', color: '#10b981', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'}}><Gift size={18}/></div>
            <div><div style={{fontSize: '12px', color: 'var(--text-sub)'}}>Vouchers</div><b style={{fontSize: '18px', color: 'var(--text-main)'}}>{stats.vouchers}</b></div>
          </div>
        </div>

        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Chiến dịch</th>
                <th>Loại</th>
                <th>Mức giảm</th>
                <th>Lượt dùng</th>
                <th>Trạng thái</th>
                <th style={{textAlign: 'right'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>Chưa có chiến dịch nào.</td></tr>
              )}
              {promos.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{fontWeight: 700, color: 'var(--text-main)'}}>{p.name}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-sub)'}}>{p.start || '...'} - {p.end || '...'}</div>
                  </td>
                  <td><span style={{color: 'var(--text-sub)'}}>{p.type}</span></td>
                  <td><b style={{color: '#10b981'}}>{p.type === 'Voucher' ? Number(p.discount).toLocaleString() + 'đ' : p.discount + '%'}</b></td>
                  <td><span style={{color: 'var(--text-main)', fontSize: '13px', fontWeight: 600}}>{p.usage}</span></td>
                  <td><span style={{padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700}} className={`badge-${p.status}`}>{p.status === 'Active' ? 'Hoạt động' : 'Kết thúc'}</span></td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn-action" onClick={() => openModal('view', p)}><Eye size={16}/></button>
                    <button className="btn-action" onClick={() => openModal('edit', p)}><Edit size={16}/></button>
                    <button className="btn-action" style={{color:'#ef4444'}} onClick={() => openDeleteModal(p)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA / XEM */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <form 
            key={modalMode} 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            onSubmit={handleSave}
          >
            <button type="button" className="btn-close-x" onClick={() => setShowModal(false)}>
              <X size={22} strokeWidth={2.5} />
            </button>

            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
              <div style={{background: 'var(--btn-action-bg)', width: 45, height: 45, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4318ff'}}>
                <Tag size={20}/>
              </div>
              <div>
                <h2 style={{margin: 0, fontSize: '18px', color: 'var(--text-main)'}}>
                  {modalMode === 'create' ? 'Thêm mới chiến dịch' : modalMode === 'edit' ? 'Chỉnh sửa chiến dịch' : 'Chi tiết chiến dịch'}
                </h2>
                <p style={{margin: 0, fontSize: '13px', color: 'var(--text-sub)'}}>Mã ID: {currentPromo.id || 'Tự động'}</p>
              </div>
            </div>

            <div className="input-group">
              <label>Tên chương trình</label>
              <input 
                disabled={modalMode === 'view'}
                value={currentPromo.name}
                onChange={e => setCurrentPromo({...currentPromo, name: e.target.value})}
                placeholder="Ví dụ: Giảm giá ngày nhà giáo..." required
              />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div className="input-group">
                <label>Loại hình</label>
                <select 
                  disabled={modalMode === 'view'}
                  value={currentPromo.type}
                  onChange={e => setCurrentPromo({...currentPromo, type: e.target.value})}
                >
                  <option value="Flash Sale">Flash Sale (%)</option>
                  <option value="Voucher">Voucher (vnđ)</option>
                  <option value="Discount">Giảm trực tiếp (%)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Mức giảm {currentPromo.type === 'Voucher' ? '(vnđ)' : '(%)'}</label>
                <input 
                  disabled={modalMode === 'view'}
                  type="number"
                  value={currentPromo.discount}
                  onChange={e => setCurrentPromo({...currentPromo, discount: e.target.value})}
                  placeholder="20" required
                />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div className="input-group">
                <label>Ngày bắt đầu</label>
                <input 
                  disabled={modalMode === 'view'}
                  type="date"
                  value={currentPromo.start || ''}
                  onChange={e => setCurrentPromo({...currentPromo, start: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Ngày kết thúc</label>
                <input 
                  disabled={modalMode === 'view'}
                  type="date"
                  value={currentPromo.end || ''}
                  onChange={e => setCurrentPromo({...currentPromo, end: e.target.value})}
                />
              </div>
            </div>

            {/* Dành riêng cho Create: Cho phép nhập giới hạn số lượt sử dụng */}
            {modalMode === 'create' && (
              <div className="input-group">
                <label>Giới hạn lượt dùng (Để trống = Không giới hạn)</label>
                <input 
                  type="number"
                  value={currentPromo.usageLimit || ''}
                  onChange={e => setCurrentPromo({...currentPromo, usageLimit: e.target.value})}
                  placeholder="Ví dụ: 500"
                />
              </div>
            )}

            {modalMode !== 'view' ? (
              <button className="btn-create" disabled={isSubmitting} style={{width: '100%', padding: '16px', justifyContent: 'center', marginTop: '10px'}} type="submit">
                <Save size={18}/> {isSubmitting ? 'ĐANG XỬ LÝ...' : (modalMode === 'create' ? 'Kích hoạt ngay' : 'Lưu thay đổi')}
              </button>
            ) : (
               <button type="button" className="btn-create" 
               style={{width: '100%', background: 'var(--btn-action-bg)', color: '#4318ff', justifyContent: 'center'}}
               onClick={() => setModalMode('edit')}>
                 <Edit size={18}/> Chuyển sang Chỉnh sửa
               </button>
            )}
          </form>
        </div>
      )}

      {/* FORM XÁC NHẬN XÓA */}
      {showDeleteModal && (
        <div className="overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" style={{maxWidth: '400px', textAlign: 'center'}} onClick={e => e.stopPropagation()}>
            <button type="button" className="btn-close-x" onClick={() => setShowDeleteModal(false)}>
              <X size={22} strokeWidth={2.5} />
            </button>
            
            <div style={{background: '#fee2e2', color: '#ef4444', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
              <AlertTriangle size={30} />
            </div>

            <h2 style={{color: 'var(--text-main)', marginBottom: '10px'}}>Xác nhận xóa?</h2>
            <p style={{color: 'var(--text-sub)', fontSize: '14px', marginBottom: '30px'}}>
              Bạn có chắc chắn muốn xóa chiến dịch <strong>"{currentPromo.name}"</strong>? Hành động này không thể hoàn tác.
            </p>

            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                style={{flex: 1, background: 'var(--btn-action-bg)', color: 'var(--text-main)', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700}}
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn-danger-outline"
                style={{flex: 1}}
                onClick={confirmDelete}
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleManagement;