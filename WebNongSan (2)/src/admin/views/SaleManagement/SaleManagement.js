import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Eye, Edit, Trash2, Zap, Gift, X, Save, Moon, Sun, AlertTriangle
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_SALE = `${API_BASE}/sale.php`;
const API_PRODUCTS = `${API_BASE}/handle_products.php?action=list`;

const SaleManagement = () => {
  const [promos, setPromos] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentPromo, setCurrentPromo] = useState({
    id: '', name: '', type: 'Flash Sale', discount: '', status: 'Active', start: '', end: '', usageLimit: '', applyScope: 'all', targetItems: '', giftItems: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [promoRes, productRes] = await Promise.all([
        fetch(API_SALE + '?action=list'),
        fetch(API_PRODUCTS)
      ]);
      const promoData = await promoRes.json();
      const productData = await productRes.json();

      if (promoData.status === 'success') setPromos(promoData.data);
      if (productData.status === 'success') {
        setAllProducts(productData.data || []);
      } else if (Array.isArray(productData)) {
        setAllProducts(productData);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (mode, data = null) => {
    setModalMode(mode);
    if (data) {
      setCurrentPromo({ 
        id: data.id, 
        name: data.name, 
        type: data.type, 
        discount: data.discount_value || data.discount, 
        status: data.status, 
        start: data.start_date || data.start, 
        end: data.end_date || data.end, 
        usageLimit: data.usage_limit || data.usageLimit || '', 
        // Bắt chuẩn biến applyScope từ API
        applyScope: data.applyScope || data.apply_scope || 'all',
        // Ép kiểu về String để thẻ <select> nhận diện đúng ID đã chọn
        targetItems: String(data.targetItems || data.target_items || ''), 
        giftItems: String(data.giftItems || data.gift_items || '')
      });
    } else {
      setCurrentPromo({ name: '', type: 'Flash Sale', discount: '', status: 'Active', start: '', end: '', usageLimit: '', applyScope: 'all', targetItems: '', giftItems: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentPromo.name) return;
    
    if (currentPromo.applyScope === 'product' && !currentPromo.targetItems) {
      return alert("Vui lòng chọn 1 sản phẩm để áp dụng giảm giá!");
    }
    if (currentPromo.applyScope === 'gift') {
      if (!currentPromo.targetItems) return alert("Vui lòng chọn sản phẩm khách phải mua!");
      if (!currentPromo.giftItems) return alert("Vui lòng chọn quà tặng (Gia vị)!");
    }

    setIsSubmitting(true);
    const submitData = { 
      action: modalMode === 'edit' ? 'update' : 'create', 
      ...currentPromo
    };

    try {
      const res = await fetch(API_SALE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const result = await res.json();
      if (result.status === 'success') {
        fetchData();
        setShowModal(false);
      } else {
        alert('Lỗi từ Server: ' + result.message);
      }
    } catch (err) {
      alert('Không thể lưu! Lỗi kết nối API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(API_SALE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: currentPromo.id })
      });
      
      const result = await res.json();
      if (result.status === 'success') {
        fetchData();
        setShowDeleteModal(false);
      } else {
        alert("Lỗi xóa: " + result.message);
      }
    } catch (err) {
      alert('Lỗi kết nối API!');
    }
  };

  // Helper chuyển ID thành Tên sản phẩm để hiển thị ra bảng
  const getProductName = (idStr) => {
    if (!idStr) return '';
    const p = allProducts.find(prod => String(prod.id) === String(idStr));
    return p ? p.name : `SP Ẩn (#${idStr})`;
  };

  // Lọc chỉ lấy danh mục Gia vị cho ô chọn quà
  const giftOptions = allProducts.filter(p => p.category && p.category.toLowerCase().includes('gia vị'));

  const stats = {
    active: promos.filter(p => p.status === 'Active').length,
    vouchers: promos.filter(p => p.type === 'Voucher').length
  };

  return (
    <div className={`sale-admin-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <style>{`
        .sale-admin-wrapper { --bg-card: #ffffff; --bg-input: #ffffff; --bg-input-disabled: #f8f9fe; --text-main: #1b2559; --text-sub: #a3aed0; --border-color: #e0e5f2; --btn-action-bg: #f4f7fe; background: var(--bg-body); min-height: 100vh; padding: 20px; display: flex; justify-content: center; font-family: 'Inter', sans-serif; transition: all 0.3s ease; }
        .sale-admin-wrapper.dark-mode { --bg-body: #0b1437; --bg-card: #111c44; --bg-input: #1b254b; --bg-input-disabled: #0b1437; --text-main: #ffffff; --text-sub: #a3aed0; --border-color: #2b3674; --btn-action-bg: #1b254b; }
        .main-card { background: var(--bg-card); width: 100%; max-width: 1200px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); padding: 30px; border: 1px solid var(--border-color); }
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); }
        .btn-create { background: #4318ff; color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .stats-inner-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-item { background: var(--bg-card); padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; border: 1px solid var(--border-color); }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 15px 20px; text-align: left; color: var(--text-sub); font-size: 12px; text-transform: uppercase; }
        td { padding: 18px 20px; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-main); }
        .btn-action { width: 34px; height: 34px; border-radius: 8px; border: none; background: var(--btn-action-bg); color: var(--text-sub); cursor: pointer; margin-left: 6px; }
        
        /* CẬP NHẬT CSS MODAL: Đảm bảo không bị tràn lên header và nằm giữa màn hình */
        .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .modal-card { background: var(--bg-card); border-radius: 24px; width: 90%; max-width: 600px; padding: 35px; position: relative; border: 1px solid var(--border-color); max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.25); box-sizing: border-box; }
        
        /* Custom Scrollbar cho form modal */
        .modal-card::-webkit-scrollbar { width: 8px; }
        .modal-card::-webkit-scrollbar-track { background: var(--btn-action-bg); border-radius: 10px; margin: 10px 0; }
        .modal-card::-webkit-scrollbar-thumb { background: var(--text-sub); border-radius: 10px; }
        
        .btn-close-x { position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: var(--text-sub); cursor: pointer; padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .btn-close-x:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
        
        .input-group { margin-bottom: 20px; position: relative; }
        .input-group label { display: block; font-size: 11px; font-weight: 800; color: var(--text-sub); margin-bottom: 8px; text-transform: uppercase; }
        .input-group input, .input-group select { width: 100%; padding: 14px; border: 1px solid var(--border-color); border-radius: 14px; background-color: var(--bg-input); color: var(--text-main); font-weight: 500; outline: none; box-sizing: border-box; }
        .input-group input:disabled, .input-group select:disabled { background: var(--bg-input-disabled); cursor: not-allowed; opacity: 0.7; }
        
        .dark-mode-toggle { position: fixed; top: 20px; right: 20px; background: var(--bg-card); border: 1px solid var(--border-color); width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-main); box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; }
        .badge-Active { background: #e6fffa; color: #047857; }
        .badge-Expired { background: #fee2e2; color: #ef4444; }
      `}</style>

      <button className="dark-mode-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
      </button>

      <div className="main-card">
        <div className="header-section">
          <div>
            <h1 style={{fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0}}>Quản lý Ưu đãi</h1>
            <p style={{color: 'var(--text-sub)', fontSize: '14px', margin: '5px 0 0'}}>Theo dõi và điều chỉnh chiến dịch khuyến mãi</p>
          </div>
          <button className="btn-create" onClick={() => openModal('create')}>
            <Plus size={18} /> Tạo chiến dịch
          </button>
        </div>

        <div className="stats-inner-grid">
          <div className="stat-item">
            <div style={{background: '#eef2ff', color: '#4318ff', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Zap size={18}/></div>
            <div><div style={{fontSize: '12px', color: 'var(--text-sub)'}}>Đang chạy</div><b style={{fontSize: '18px', color: 'var(--text-main)'}}>{stats.active}</b></div>
          </div>
          <div className="stat-item">
            <div style={{background: '#ecfdf5', color: '#10b981', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Gift size={18}/></div>
            <div><div style={{fontSize: '12px', color: 'var(--text-sub)'}}>Vouchers</div><b style={{fontSize: '18px', color: 'var(--text-main)'}}>{stats.vouchers}</b></div>
          </div>
        </div>

        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Chiến dịch</th>
                <th>Phạm vi</th>
                <th>Mức giảm / Quà</th>
                <th>Trạng thái</th>
                <th style={{textAlign: 'right'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>Đang tải...</td></tr> : 
               promos.length === 0 ? <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>Chưa có chiến dịch nào.</td></tr> :
               promos.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{fontWeight: 700, color: 'var(--text-main)'}}>{p.name}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-sub)'}}>{p.start_date || '...'} - {p.end_date || '...'}</div>
                  </td>
                  <td>
                    <span style={{color: 'var(--text-sub)', fontSize: '13px', fontWeight: 600}}>
                      {p.applyScope === 'all' || p.apply_scope === 'all' ? 'Toàn Shop' : 
                       p.applyScope === 'product' || p.apply_scope === 'product' ? 'Mua SP cụ thể' : 'Tặng Quà'}
                    </span>
                  </td>
                  <td>
                    <b style={{color: '#10b981'}}>
                      {(p.applyScope === 'gift' || p.apply_scope === 'gift') 
                        ? 'Có Quà Tặng' 
                        : (p.type === 'Voucher' ? Number(p.discount_value || p.discount).toLocaleString() + 'đ' : (p.discount_value || p.discount) + '%')}
                    </b>
                  </td>
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

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <button type="button" className="btn-close-x" onClick={() => setShowModal(false)}><X size={22} strokeWidth={2.5} /></button>

            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
              <div style={{background: 'var(--btn-action-bg)', width: 45, height: 45, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4318ff'}}><Tag size={20}/></div>
              <div><h2 style={{margin: 0, fontSize: '18px', color: 'var(--text-main)'}}>{modalMode === 'create' ? 'Thêm mới chiến dịch' : modalMode === 'edit' ? 'Chỉnh sửa chiến dịch' : 'Chi tiết chiến dịch'}</h2></div>
            </div>

            <div className="input-group">
              <label>Tên chương trình</label>
              <input disabled={modalMode === 'view'} value={currentPromo.name} onChange={e => setCurrentPromo({...currentPromo, name: e.target.value})} placeholder="Ví dụ: Giảm giá ngày nhà giáo..." required />
            </div>

            <div className="input-group">
              <label>Phạm vi áp dụng khuyến mãi</label>
              <select disabled={modalMode === 'view'} value={currentPromo.applyScope} onChange={e => setCurrentPromo({...currentPromo, applyScope: e.target.value, targetItems: '', giftItems: ''})}>
                <option value="all">Áp dụng cho toàn bộ cửa hàng</option>
                <option value="product">Chỉ áp dụng cho sản phẩm cụ thể</option>
                <option value="gift">Mua sản phẩm tặng kèm quà (Gia vị)</option>
              </select>
            </div>

            {/* Ô DROPDOWN CHỌN SẢN PHẨM MUA (Dành cho product & gift) */}
            {(currentPromo.applyScope === 'product' || currentPromo.applyScope === 'gift') && (
              <div className="input-group">
                <label style={{color: '#4318ff'}}>{currentPromo.applyScope === 'gift' ? 'Sản phẩm khách phải mua (Điều kiện)' : 'Sản phẩm được áp dụng giảm giá'}</label>
                <select 
                  disabled={modalMode === 'view'} 
                  value={currentPromo.targetItems} 
                  onChange={e => setCurrentPromo({...currentPromo, targetItems: e.target.value})}
                  required
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Ô DROPDOWN CHỌN QUÀ TẶNG (Chỉ dành cho gift) */}
            {currentPromo.applyScope === 'gift' && (
              <div className="input-group">
                <label style={{color: '#10b981'}}>Quà tặng kèm (Lấy từ danh mục Gia vị)</label>
                <select 
                  disabled={modalMode === 'view'} 
                  value={currentPromo.giftItems} 
                  onChange={e => setCurrentPromo({...currentPromo, giftItems: e.target.value})}
                  required
                >
                  <option value="">-- Chọn quà tặng --</option>
                  {giftOptions.length === 0 ? <option disabled>Không có sản phẩm nào thuộc Gia Vị</option> : 
                   giftOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock})</option>
                  ))}
                </select>
              </div>
            )}

            {/* MỨC GIẢM GIÁ (Ẩn khi tặng quà) */}
            {currentPromo.applyScope !== 'gift' && (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div className="input-group">
                  <label>Loại hình</label>
                  <select disabled={modalMode === 'view'} value={currentPromo.type} onChange={e => setCurrentPromo({...currentPromo, type: e.target.value})}>
                    <option value="Flash Sale">Flash Sale (%)</option>
                    <option value="Voucher">Voucher (vnđ)</option>
                    <option value="Discount">Giảm trực tiếp (%)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Mức giảm {currentPromo.type === 'Voucher' ? '(vnđ)' : '(%)'}</label>
                  <input disabled={modalMode === 'view'} type="number" value={currentPromo.discount} onChange={e => setCurrentPromo({...currentPromo, discount: e.target.value})} placeholder="20" required />
                </div>
              </div>
            )}

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div className="input-group"><label>Ngày bắt đầu</label><input disabled={modalMode === 'view'} type="date" value={currentPromo.start || ''} onChange={e => setCurrentPromo({...currentPromo, start: e.target.value})} /></div>
              <div className="input-group"><label>Ngày kết thúc</label><input disabled={modalMode === 'view'} type="date" value={currentPromo.end || ''} onChange={e => setCurrentPromo({...currentPromo, end: e.target.value})} /></div>
            </div>

            {modalMode === 'create' && (
              <div className="input-group">
                <label>Giới hạn lượt dùng (Để trống = Không giới hạn)</label>
                <input type="number" value={currentPromo.usageLimit || ''} onChange={e => setCurrentPromo({...currentPromo, usageLimit: e.target.value})} placeholder="Ví dụ: 500" />
              </div>
            )}

            {modalMode !== 'view' && (
              <button className="btn-create" disabled={isSubmitting} style={{width: '100%', padding: '16px', justifyContent: 'center', marginTop: '10px'}} type="submit">
                <Save size={18}/> {isSubmitting ? 'ĐANG LƯU...' : 'Lưu chiến dịch'}
              </button>
            )}
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div className="overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" style={{maxWidth: '400px', textAlign: 'center'}} onClick={e => e.stopPropagation()}>
            <button type="button" className="btn-close-x" onClick={() => setShowDeleteModal(false)}><X size={22} strokeWidth={2.5} /></button>
            <div style={{background: '#fee2e2', color: '#ef4444', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}><AlertTriangle size={30} /></div>
            <h2 style={{color: 'var(--text-main)', marginBottom: '10px'}}>Xác nhận xóa?</h2>
            <p style={{color: 'var(--text-sub)', fontSize: '14px', marginBottom: '30px'}}>Xóa chiến dịch <strong>"{currentPromo.name}"</strong>? Không thể hoàn tác.</p>
            <div style={{display: 'flex', gap: '12px'}}>
              <button style={{flex: 1, background: 'var(--btn-action-bg)', color: 'var(--text-main)', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700}} onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button style={{background: 'transparent', border: '1.5px solid #ef4444', color: '#ef4444', flex: 1, padding: '12px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700}} onClick={confirmDelete}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleManagement;