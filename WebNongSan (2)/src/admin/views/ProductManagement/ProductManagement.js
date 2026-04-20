import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Eye, Edit, Trash2, Plus, PackagePlus, 
  MapPin, Package, ImageIcon, XCircle, ShoppingBasket, Save, AlertTriangle, Filter, AlertOctagon
} from 'lucide-react';
import { API_BASE } from 'src/config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const API_CATEGORIES = `${API_BASE}/handle_categories.php?action=list_parents`;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const itemsPerPage = 20;

  const [modalType, setModalType] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAdd, setStockAdd] = useState('');
  
  const [formData, setFormData] = useState({
    id: '', name: '', category: '', price: '', stock: '', unit: '', origin: '', description: '', status: 'Còn hàng'
  });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/handle_products.php?action=list`),
        fetch(API_CATEGORIES)
      ]);
      
      const prodResult = await prodRes.json();
      const catResult = await catRes.json();

      if (prodResult.status === 'success') {
        setProducts(prodResult.data || []);
      }
      
      if (catResult.status === 'success') {
        setCategories(catResult.data || []);
      }
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueCategories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)];
  }, [products]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const isEdit = formData.id !== '';
    const endpoint = isEdit ? `${API_BASE}/update_product.php` : `${API_BASE}/add_product.php`;

    const payload = new FormData();
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));
    
    for (let i = 0; i < imageFiles.length; i++) {
      payload.append('new_images[]', imageFiles[i]);
    }
    
    if (isEdit && selectedProduct?.images) {
      try {
        const oldImgs = JSON.parse(selectedProduct.images);
        if (Array.isArray(oldImgs)) {
          oldImgs.forEach(img => payload.append('existing_images[]', img));
        }
      } catch (error) {
        console.error("Lỗi parse ảnh cũ:", error);
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: payload
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert(result.message);
        fetchData(); 
        setModalType(null);
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Hành động này sẽ xóa vĩnh viễn sản phẩm. Xác nhận?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete_product.php`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Đã xóa sản phẩm!");
        fetchData(); 
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if(!stockAdd || isNaN(stockAdd) || Number(stockAdd) <= 0) return alert("Số lượng không hợp lệ!");

    try {
      const res = await fetch(`${API_BASE}/update_stock.php`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: selectedProduct.id, quantity_added: Number(stockAdd) })
      });
      const result = await res.json();
      if(result.status === 'success') {
        alert("Đã cập nhật kho!");
        fetchData(); 
        setModalType(null);
        setStockAdd('');
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối API");
    }
  };

  const openForm = (product = null) => {
    if (product) {
      setFormData({
        id: product.id, name: product.name, category: product.category, 
        price: product.price, stock: product.stock, unit: product.unit, 
        origin: product.origin, description: product.description, status: product.status
      });
    } else {
      setFormData({
        id: '', name: '', category: '', price: '', stock: '', unit: '', origin: '', description: '', status: 'Còn hàng'
      });
    }
    setImageFiles([]); 
    setSelectedProduct(product);
    setModalType('form');
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setSearchParams({ page: 1 });
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      
      let matchPrice = true;
      const price = Number(p.price);
      if (filterPrice === 'under_100k') matchPrice = price < 100000;
      else if (filterPrice === '100k_500k') matchPrice = price >= 100000 && price <= 500000;
      else if (filterPrice === 'over_500k') matchPrice = price > 500000;

      return matchSearch && matchCategory && matchPrice;
    });
    
    return filtered.sort((a, b) => {
      const stockA = Number(a.stock);
      const stockB = Number(b.stock);
      if (stockA !== stockB) return stockA - stockB; 
      return b.id - a.id; 
    });
  }, [products, searchTerm, filterCategory, filterPrice]);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);
  const currentProducts = sortedAndFilteredProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  };

  const formatPrice = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Phân tích trạng thái kho hàng cho khung cảnh báo
  const outOfStockProducts = sortedAndFilteredProducts.filter(p => Number(p.stock) === 0);
  const lowStockProducts = sortedAndFilteredProducts.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontWeight: 600 }}>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="admin-container-bg">
      <style>{`
        .admin-container-bg { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .master-form-container { background: #ffffff; border-radius: 40px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); max-width: 1400px; margin: 0 auto; }
        .form-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .header-text h1 { font-size: 32px; font-weight: 800; margin: 0; color: #1b2559; }
        .header-text p { color: #a3aed0; margin: 5px 0 0 0; font-weight: 500; }
        
        .controls-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; flex-wrap: wrap; }
        
        .search-wrapper { background: #f4f7fe; border-radius: 16px; padding: 12px 20px; display: flex; align-items: center; flex: 1; min-width: 250px; }
        .search-wrapper input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }
        
        .filter-group { display: flex; gap: 15px; flex-wrap: wrap; }
        .filter-select { background: #f4f7fe; border: 1px solid #e0e5f2; border-radius: 16px; padding: 12px 18px; font-weight: 600; color: #1b2559; outline: none; cursor: pointer; min-width: 180px; }
        
        .btn-add { background: #4318ff; color: white; padding: 14px 25px; border-radius: 16px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        
        .table-info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: 600; color: #707eae; font-size: 14px; }
        
        /* BẢNG SẢN PHẨM */
        table { width: 100%; border-collapse: separate; border-spacing: 0 15px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 13px; text-transform: uppercase; text-align: left; font-weight: 800; }
        td { background: #ffffff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
        tr:hover td { background: #fbfcfe; border-color: #e0e5f2; }
        
        /* NHÃN TRẠNG THÁI RÕ RÀNG */
        .status-badge { padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; display: inline-block; white-space: nowrap; }
        .status-ok { background: #d1fae5; color: #059669; } /* Xanh lá */
        .status-low { background: #fef3c7; color: #d97706; } /* Vàng cam */
        .status-out { background: #fee2e2; color: #e11d48; } /* Đỏ */

        .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; background: #f4f7fe; color: #707eae; margin-left: 8px; }
        .btn-action:hover { background: #4318ff; color: #fff; }
        .btn-action.delete:hover { background: #e11d48; color: #fff; }

        .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; }
        .page-btn { min-width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid #e0e5f2; background: #fff; color: #707eae; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { background: #f4f7fe; color: #4318ff; }
        .page-btn.active { background: #4318ff; color: #fff; border-color: #4318ff; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 16, 45, 0.6); backdrop-filter: blur(5px); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; padding: 5vh 20px; box-sizing: border-box; }
        .modal-body { background: white; border-radius: 30px; padding: 35px 40px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; margin: auto; box-sizing: border-box; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-body::-webkit-scrollbar { width: 8px; }
        .modal-body::-webkit-scrollbar-track { background: #f1f4f9; border-radius: 10px; margin: 10px 0; }
        .modal-body::-webkit-scrollbar-thumb { background: #c3cadd; border-radius: 10px; }
        .modal-body::-webkit-scrollbar-thumb:hover { background: #a3aed0; }
        
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; font-weight: 700; color: #1b2559; margin-bottom: 8px; font-size: 14px; }
        .input-group input, .input-group select, .input-group textarea { width: 100%; padding: 15px; border-radius: 15px; border: 1px solid #e0e5f2; background: #f8fafc; font-family: inherit; font-size: 15px; outline: none; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      `}</style>

      <div className="master-form-container">
        <div className="form-header">
          <div className="header-text">
            <h1>Quản lý Sản phẩm</h1>
            <p>Kiểm soát kho hàng, giá bán và thông tin sản phẩm</p>
          </div>
        </div>

        {/* --- KHUNG CẢNH BÁO NẾU CÓ SẢN PHẨM HẾT HÀNG --- */}
        {outOfStockProducts.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '15px 20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '50%', display: 'flex' }}>
              <AlertOctagon size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#b91c1c', fontSize: '16px', fontWeight: 800 }}>Cảnh báo: Có {outOfStockProducts.length} sản phẩm đã HẾT HÀNG!</h3>
              <p style={{ margin: '5px 0 0', color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>Vui lòng kiểm tra lại danh sách và nhập thêm kho để tiếp tục bán hàng.</p>
            </div>
          </div>
        )}

        {/* --- KHU VỰC TÌM KIẾM & BỘ LỌC --- */}
        <div className="controls-row">
          <div className="search-wrapper">
            <Search size={20} color="#a3aed0" />
            <input 
              placeholder="Tìm theo tên sản phẩm..." 
              value={searchTerm} 
              onChange={handleFilterChange(setSearchTerm)}
            />
          </div>
          
          <div className="filter-group">
            <select className="filter-select" value={filterCategory} onChange={handleFilterChange(setFilterCategory)}>
              <option value="all">Tất cả danh mục</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select className="filter-select" value={filterPrice} onChange={handleFilterChange(setFilterPrice)}>
              <option value="all">Tất cả mức giá</option>
              <option value="under_100k">Dưới 100.000đ</option>
              <option value="100k_500k">100.000đ - 500.000đ</option>
              <option value="over_500k">Trên 500.000đ</option>
            </select>
          </div>

          <button className="btn-add" onClick={() => openForm(null)}>
            <Plus size={20} /> Thêm sản phẩm mới
          </button>
        </div>

        <div className="table-info-row">
          <span>Tổng số: <strong style={{ color: '#1b2559' }}>{sortedAndFilteredProducts.length}</strong> kết quả phù hợp</span>
          {lowStockProducts.length > 0 && outOfStockProducts.length === 0 && (
            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={16} /> Có {lowStockProducts.length} sản phẩm sắp hết hàng!
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Phân loại</th>
                <th>Giá & Kho</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? currentProducts.map(p => {
                let imgUrl = null;
                try { imgUrl = JSON.parse(p.images)[0]; } catch(e) {}

                const stockNumber = Number(p.stock);
                const isOutOfStock = stockNumber === 0;
                const isLowStock = stockNumber > 0 && stockNumber < 10;

                // XÁC ĐỊNH TRẠNG THÁI ĐỂ HIỂN THỊ LABEL
                // XÁC ĐỊNH TRẠNG THÁI ĐỂ HIỂN THỊ LABEL
let statusText = p.status;
let badgeClass = 'status-ok';

if (isOutOfStock || p.status === 'Hết hàng') {
  statusText = 'HẾT HÀNG';
  badgeClass = 'status-out';
} else if (isLowStock) {
  statusText = 'SẮP HẾT';
  badgeClass = 'status-low';
} else if (!statusText || statusText.trim() === '') {
  // Nếu DB bị rỗng và kho vẫn còn nhiều thì tự động gán là CÒN HÀNG
  statusText = 'CÒN HÀNG'; 
} else {
  // Viết hoa chữ Còn hàng có sẵn trong DB cho đồng bộ
  statusText = statusText.toUpperCase(); 
}
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: 55, height: 55, borderRadius: '16px', background: '#f4f7fe', overflow: 'hidden' }}>
                          {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="p" /> : <ImageIcon size={22} color="#a3aed0" style={{ margin: '16px' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1b2559' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: '#a3aed0', fontWeight: 600 }}><MapPin size={12} style={{verticalAlign:'middle'}}/> {p.origin}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#4318ff', background: '#f4f7fe', padding: '6px 12px', borderRadius: '10px', fontSize: '13px' }}>{p.category}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#10b981' }}>{formatPrice(p.price)}</div>
                      <div style={{ 
                        fontSize: '12px', fontWeight: 700, marginTop: '4px',
                        color: isOutOfStock ? '#e11d48' : (isLowStock ? '#d97706' : '#707eae')
                      }}>
                        <Package size={12} style={{verticalAlign:'middle'}}/> Tồn kho: {p.stock} {p.unit} 
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        {statusText}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setSelectedProduct(p); setModalType('view'); }} className="btn-action" title="Xem chi tiết"><Eye size={18} /></button>
                        <button onClick={() => { setSelectedProduct(p); setStockAdd(''); setModalType('stock'); }} className="btn-action" style={{ background: '#ecfdf5', color: '#059669' }} title="Nhập thêm kho"><PackagePlus size={18} /></button>
                        <button onClick={() => openForm(p)} className="btn-action" style={{ background: '#eff6ff', color: '#2563eb' }} title="Chỉnh sửa"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="btn-action delete" title="Xóa"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#a3aed0' }}>
                    <Filter size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p style={{ fontWeight: 600 }}>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* COMPONENT PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              &laquo;
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button 
                  key={page} 
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}

            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              &raquo;
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, color: '#1b2559', fontSize: '24px', fontWeight: 800 }}>
                {modalType === 'form' ? (formData.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới') : modalType === 'stock' ? 'Nhập Kho' : 'Chi Tiết Sản Phẩm'}
              </h2>
              <button onClick={() => setModalType(null)} style={{ border:'none', background:'none', cursor:'pointer', color:'#a3aed0' }}><XCircle size={28} /></button>
            </div>

            {/* FORM THÊM / SỬA */}
            {modalType === 'form' && (
              <form onSubmit={handleSubmitForm}>
                <div className="input-group">
                  <label>Tên sản phẩm</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid-2">
                  <div className="input-group">
                    <label>Danh mục</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label>Xuất xứ</label>
                    <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid-2">
                  <div className="input-group">
                    <label>Giá bán (VNĐ)</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="grid-2">
                    <div className="input-group">
                      <label>Số lượng</label>
                      <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>Đơn vị (Kg, Quả,...)</label>
                      <input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label>Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Còn hàng">Còn hàng</option>
                    <option value="Hết hàng">Hết hàng</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Mô tả chi tiết</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                
                <div className="input-group">
                  <label>Hình ảnh {formData.id && <span style={{ color: '#e11d48', fontSize: '13px', fontWeight: 500 }}>(Tùy chọn - Bỏ trống để giữ ảnh cũ)</span>}</label>
                  <input type="file" multiple accept="image/*" onChange={e => setImageFiles(e.target.files)} style={{ padding: '10px', background: '#fff', border: '2px dashed #e0e5f2' }} />
                </div>
                
                <button type="submit" style={{ width: '100%', padding: '18px', background: '#4318ff', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                  <Save size={18} style={{verticalAlign:'middle', marginRight:'8px'}}/> LƯU SẢN PHẨM
                </button>
              </form>
            )}

            {/* FORM NHẬP KHO */}
            {modalType === 'stock' && (
              <form onSubmit={handleUpdateStock}>
                <div style={{ background: '#f4f7fe', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                  <strong>Đang nhập kho cho:</strong> {selectedProduct.name} <br/>
                  <span style={{ color: '#707eae', fontSize: '14px' }}>Tồn kho hiện tại: {selectedProduct.stock} {selectedProduct.unit}</span>
                </div>
                <div className="input-group">
                  <label>Số lượng nhập thêm</label>
                  <input type="number" required value={stockAdd} onChange={e => setStockAdd(e.target.value)} placeholder="Nhập số lượng..." />
                </div>
                <button type="submit" style={{ width: '100%', padding: '18px', background: '#059669', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 800, cursor: 'pointer' }}>
                  XÁC NHẬN NHẬP KHO
                </button>
              </form>
            )}

            {/* XEM CHI TIẾT */}
            {modalType === 'view' && selectedProduct && (
              <div>
                <h3 style={{ fontSize: '20px', color: '#1b2559' }}>{selectedProduct.name}</h3>
                <p style={{ color: '#4318ff', fontWeight: 700, fontSize: '18px' }}>{formatPrice(selectedProduct.price)} / {selectedProduct.unit}</p>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginTop: '20px', lineHeight: '1.6', color: '#475569' }}>
                  <strong>Xuất xứ:</strong> {selectedProduct.origin} <br/>
                  <strong>Tồn kho:</strong> {selectedProduct.stock} {selectedProduct.unit} <br/>
                  <strong>Trạng thái:</strong> <span style={{ fontWeight: 800, color: selectedProduct.stock == 0 ? '#ef4444' : '#059669' }}>{selectedProduct.stock == 0 ? 'Hết hàng' : selectedProduct.status}</span> <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '15px 0' }}/>
                  <strong>Mô tả:</strong> <br/> {selectedProduct.description || "Không có mô tả."}
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