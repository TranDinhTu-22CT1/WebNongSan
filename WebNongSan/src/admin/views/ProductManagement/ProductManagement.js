import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Eye, CheckCircle, XCircle, Store, MapPin, Package, 
  ImageIcon, Trash2, Clock, AlertOctagon, ShieldAlert, ShoppingBasket
} from 'lucide-react';

const API_URL = 'http://localhost/nongsan-api/handle_products.php';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [banReason, setBanReason] = useState(''); // State lưu lý do cấm

  // 1. LẤY DANH SÁCH SẢN PHẨM TỪ API
  const fetchProductsData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      const result = await res.json();
      if (result.status === 'success') {
        setProducts(result.data);
      } else {
        console.error("Lỗi từ server:", result.message);
      }
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  // 2. PHÊ DUYỆT SẢN PHẨM
  const handleApprove = async (id) => {
    if(!window.confirm("Xác nhận phê duyệt sản phẩm này?")) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id: id })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Duyệt thành công!");
        fetchProductsData(); // Load lại dữ liệu
        setModalType(null);
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  // 3. ĐÌNH CHỈ / CẤM SẢN PHẨM
  const handleBanProduct = async (id) => {
    if(!banReason.trim()) {
      alert("Vui lòng nhập lý do đình chỉ!");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', id: id, ban_reason: banReason })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Đã đình chỉ sản phẩm!");
        fetchProductsData(); // Load lại dữ liệu
        setModalType(null);
        setBanReason(''); // Reset form
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  // 4. XÓA SẢN PHẨM
  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Cảnh báo: Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống. Xác nhận?")) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: id })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Đã xóa sản phẩm!");
        fetchProductsData(); // Load lại dữ liệu
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.store.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTab === 'banned') return p.is_banned === 1 && matchSearch;
      return p.approval_status === activeTab && p.is_banned === 0 && matchSearch;
    });
  }, [products, activeTab, searchTerm]);

  const formatPrice = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Inter', color: '#1b2559', fontWeight: 600 }}>Đang tải dữ liệu sản phẩm...</div>;
  }

  return (
    <div className="admin-container-bg">
      <style>{`
        .admin-container-bg { padding: 50px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* CONTAINER DUY NHẤT CHỨA TẤT CẢ */
        .master-form-container {
          background: #ffffff;
          border-radius: 40px; /* Bo góc cực đại cho hiện đại */
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #ffffff;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* PHẦN HEADER BÊN TRONG CONTAINER */
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .header-text h1 { font-size: 32px; font-weight: 800; margin: 0; color: #1b2559; letter-spacing: -1px; }
        .header-text p { color: #a3aed0; margin: 5px 0 0 0; font-weight: 500; font-size: 15px; }

        /* THANH ĐIỀU KHIỂN (SEARCH & TABS) */
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .tab-group {
          display: flex;
          background: #f4f7fe;
          padding: 8px;
          border-radius: 20px;
          gap: 5px;
        }

        .tab-btn {
          padding: 12px 25px;
          border-radius: 15px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          color: #a3aed0;
          background: transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn.active {
          background: #ffffff;
          color: #4318ff;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }

        .search-wrapper {
          background: #f4f7fe;
          border-radius: 20px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          width: 380px;
          border: 1px solid transparent;
          transition: 0.3s;
        }
        .search-wrapper:focus-within { border-color: #4318ff; background: #fff; }
        .search-wrapper input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }

        /* BẢNG DỮ LIỆU */
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: separate; border-spacing: 0 15px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; text-align: left; font-weight: 800; }
        td { background: #ffffff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
        
        tr:hover td { background: #fbfcfe; border-color: #e0e5f2; }

        .badge { padding: 8px 16px; border-radius: 12px; font-size: 11px; font-weight: 800; display: inline-block; }
        .bg-pending { background: #fff7ed; color: #c2410c; }
        .bg-approved { background: #f0fdf4; color: #15803d; }
        .bg-rejected { background: #fef2f2; color: #b91c1c; }

        .btn-action { width: 42px; height: 42px; border-radius: 14px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; background: #f4f7fe; color: #707eae; }
        .btn-action:hover { transform: translateY(-3px); background: #4318ff; color: #fff; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(11, 16, 45, 0.4); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-body { background: white; border-radius: 35px; padding: 40px; width: 90%; max-width: 800px; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
      `}</style>

      {/* --- ĐÂY CHÍNH LÀ KHỐI CONTAINER TRẮNG DUY NHẤT CHỨA TẤT CẢ --- */}
      <div className="master-form-container">
        
        {/* Tiêu đề nằm TRONG form */}
        <div className="form-header">
          <div className="header-text">
            <h1>Quản lý Kiểm duyệt</h1>
            <p>Phê duyệt sản phẩm nông sản từ các nhà vườn</p>
          </div>
          <div className="search-wrapper">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Tìm tên sản phẩm hoặc nhà vườn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Thanh Tab nằm TRONG form */}
        <div className="controls-row">
          <div className="tab-group">
            <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
              Chờ phê duyệt ({products.filter(p => p.approval_status === 'pending' && !p.is_banned).length})
            </button>
            <button className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
              Đang kinh doanh ({products.filter(p => p.approval_status === 'approved' && !p.is_banned).length})
            </button>
            <button className={`tab-btn ${activeTab === 'banned' ? 'active' : ''}`} onClick={() => setActiveTab('banned')}>
              Vi phạm / Bị cấm ({products.filter(p => p.is_banned === 1).length})
            </button>
          </div>
          
          <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: 600 }}>
             Hiển thị: <span style={{ color: '#4318ff' }}>{filteredProducts.length}</span> sản phẩm
          </div>
        </div>

        {/* Bảng nằm TRONG form */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Thông tin sản phẩm</th>
                <th>Giá niêm yết</th>
                <th>Khu vực trồng</th>
                <th>Phê duyệt</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map(p => {
                // Xử lý cẩn thận đoạn parse ảnh phòng trường hợp JSON lỗi trong DB
                let imgUrl = null;
                try {
                  const imagesArr = JSON.parse(p.images);
                  if (imagesArr && imagesArr.length > 0) imgUrl = imagesArr[0];
                } catch(e) {} 

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: 55, height: 55, borderRadius: '16px', background: '#f4f7fe', overflow: 'hidden', border: '1px solid #f1f4f9' }}>
                          {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="p" /> : <ImageIcon size={22} color="#a3aed0" style={{ margin: '16px' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1b2559', fontSize: '15px' }}>{p.name}</div>
                          <div style={{ fontSize: '13px', color: '#a3aed0', fontWeight: 600 }}><Store size={12} style={{ verticalAlign: 'middle' }} /> {p.store}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#4318ff', fontSize: '15px' }}>{formatPrice(p.price)}</div>
                      <div style={{ fontSize: '12px', color: '#707eae', fontWeight: 600 }}><Package size={12} style={{ verticalAlign: 'middle' }} /> {p.stock} {p.unit}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1b2559', fontSize: '14px' }}><MapPin size={13} style={{ verticalAlign: 'middle', color: '#4318ff' }} /> {p.origin}</div>
                      <div style={{ fontSize: '12px', color: '#a3aed0', fontWeight: 600 }}>{p.category}</div>
                    </td>
                    <td>
                      <span className={`badge bg-${p.approval_status}`}>
                        {p.is_banned ? 'BỊ ĐÌNH CHỈ' : p.approval_status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setSelectedProduct(p); setModalType('view'); }} className="btn-action" title="Xem chi tiết"><Eye size={18} /></button>
                        {activeTab === 'pending' && (
                          <button onClick={() => handleApprove(p.id)} className="btn-action" style={{ color: '#10b981', background: '#f0fdf4' }} title="Duyệt"><CheckCircle size={18} /></button>
                        )}
                        {!p.is_banned && (
                          <button onClick={() => { 
                            setSelectedProduct(p); 
                            setBanReason(''); // reset form trước khi mở modal
                            setModalType('ban'); 
                          }} className="btn-action" style={{ color: '#e11d48', background: '#fef2f2' }} title="Cấm"><ShieldAlert size={18} /></button>
                        )}
                        <button onClick={() => handleDeleteProduct(p.id)} className="btn-action" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px 0', color: '#a3aed0' }}>
                    <ShoppingBasket size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600 }}>Không có sản phẩm nào trong danh sách này</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL HỆ THỐNG --- */}
      {modalType && selectedProduct && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            {modalType === 'view' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '30px' }}>
                    {(() => {
                      let parsedImg = '';
                      try { parsedImg = JSON.parse(selectedProduct.images)[0]; } catch(e){}
                      return (
                        parsedImg ? 
                        <img src={parsedImg} style={{ width: 150, height: 150, borderRadius: '30px', objectFit: 'cover', border: '6px solid #f4f7fe' }} alt="p" /> :
                        <div style={{ width: 150, height: 150, borderRadius: '30px', background: '#f4f7fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={40} color="#a3aed0" /></div>
                      );
                    })()}
                    <div>
                      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#1b2559' }}>{selectedProduct.name}</h2>
                      <div style={{ marginTop: 10, display: 'flex', gap: '10px' }}>
                        <span className={`badge bg-${selectedProduct.approval_status}`}>{selectedProduct.approval_status}</span>
                        <span style={{ background: '#f4f7fe', padding: '6px 15px', borderRadius: '12px', fontSize: 13, fontWeight: 700, color: '#707eae' }}>{selectedProduct.status}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setModalType(null)} style={{ border: 'none', background: '#f4f7fe', width: 45, height: 45, borderRadius: '15px', cursor: 'pointer', color: '#a3aed0' }}><XCircle size={22} /></button>
                </div>

                {/* HIỂN THỊ LÝ DO CẤM NẾU CÓ */}
                {selectedProduct.is_banned === 1 && selectedProduct.ban_reason && (
                  <div style={{ marginTop: '20px', padding: '15px', background: '#fff1f2', borderRadius: '15px', color: '#be123c', fontSize: '14px', fontWeight: 600 }}>
                    <AlertOctagon size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> Lý do đình chỉ: {selectedProduct.ban_reason}
                  </div>
                )}

                <div style={{ marginTop: '30px', padding: '25px', background: '#f8fafc', borderRadius: '25px', color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>
                   <strong>Mô tả sản phẩm:</strong> <br/>
                   {selectedProduct.description || "Không có mô tả chi tiết."}
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
                   {selectedProduct.approval_status === 'pending' && !selectedProduct.is_banned && (
                     <button onClick={() => handleApprove(selectedProduct.id)} style={{ flex: 1, padding: '18px', borderRadius: '20px', border: 'none', background: '#4318ff', color: 'white', fontWeight: 800, cursor: 'pointer' }}>PHÊ DUYỆT SẢN PHẨM</button>
                   )}
                   <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '18px', borderRadius: '20px', border: 'none', background: '#f4f7fe', color: '#707eae', fontWeight: 800, cursor: 'pointer' }}>ĐÓNG LẠI</button>
                </div>
              </>
            )}

            {modalType === 'ban' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fff1f2', width: 90, height: 90, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <AlertOctagon size={40} color="#e11d48" />
                </div>
                <h2 style={{ color: '#1b2559', fontSize: '26px' }}>Đình chỉ sản phẩm này?</h2>
                <p style={{ color: '#a3aed0', marginBottom: '30px', fontWeight: 500 }}>Sản phẩm sẽ bị gỡ bỏ khỏi cửa hàng ngay lập tức.</p>
                <textarea 
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #e0e5f2', outline: 'none', height: '120px', background: '#f8fafc', fontSize: '15px' }} 
                  placeholder="Nhập lý do đình chỉ (bắt buộc)..."
                ></textarea>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '18px', borderRadius: '18px', border: 'none', background: '#f4f7fe', fontWeight: 700, cursor: 'pointer', color: '#1b2559' }}>QUAY LẠI</button>
                  <button onClick={() => handleBanProduct(selectedProduct.id)} style={{ flex: 1, padding: '18px', borderRadius: '18px', border: 'none', background: '#e11d48', color: 'white', fontWeight: 700, cursor: 'pointer' }}>XÁC NHẬN CẤM BÁN</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;