import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell,
  CButton, CFormInput, CAvatar, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormSelect, CFormLabel, CFormTextarea, CRow, CCol, CBadge, CTooltip, CAlert, CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilPencil, cilTrash, cilPlus, cilSearch, cilCloudUpload, cilCheckCircle, cilXCircle, cilWarning, cilInfo, cilX, cilBan, cilSave, cilStorage, cilMap
} from '@coreui/icons'

// --- CẤU HÌNH API ---
const API_BASE_URL = 'http://localhost/nongsan-api'; 

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // --- LẤY THÔNG TIN XÁC THỰC TỪ LOCALSTORAGE ---
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
  const CURRENT_VENDOR_ID = user.id; 

  // State Modal
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  
  // State Data tạm thời
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [productToImport, setProductToImport] = useState(null)
  const [importQuantity, setImportQuantity] = useState('')
  const [activeDetailImage, setActiveDetailImage] = useState('') 

  // Form Data - CẬP NHẬT TRƯỜNG ORIGIN
  const [formData, setFormData] = useState({
    name: '', category: 'Rau Củ', price: '', stock: '', 
    unit: 'kg', origin: '', description: '', status: 'Còn hàng', 
    images: [] 
  })

  // --- 1. HÀM GỌI API LẤY DANH SÁCH SẢN PHẨM ---
  const fetchProducts = async () => {
      if (!CURRENT_VENDOR_ID) return;
      setLoading(true);
      try {
          const res = await fetch(`${API_BASE_URL}/get_products.php?vendor_id=${CURRENT_VENDOR_ID}`, {
              headers: { 
                  'Authorization': `Bearer ${token}` 
              }
          });
          const data = await res.json();
          
          if (Array.isArray(data)) {
              const processedData = data.map(item => {
                  let parsedImages = [];
                  try {
                      parsedImages = item.images ? JSON.parse(item.images) : [];
                  } catch (e) {
                      parsedImages = []; 
                  }
                  return { ...item, images: Array.isArray(parsedImages) ? parsedImages : [] };
              });
              setProducts(processedData);
          } else {
              setProducts([]);
          }
      } catch (error) {
          console.error("Lỗi kết nối API:", error);
      } finally {
          setLoading(false);
      }
  }

  useEffect(() => {
      fetchProducts();
  }, []);

  // --- 2. XỬ LÝ NHẬP HÀNG ---
  const handleImportStock = async () => {
      if (!importQuantity || parseInt(importQuantity) <= 0) {
          return alert("Vui lòng nhập số lượng cộng thêm hợp lệ!");
      }

      try {
          const res = await fetch(`${API_BASE_URL}/update_stock.php`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ 
                  product_id: productToImport.id, 
                  quantity_added: parseInt(importQuantity) 
              })
          });
          const result = await res.json();
          
          if (result.status === 'success') {
              alert(`Thành công! Đã cộng thêm ${importQuantity} vào kho.`);
              setImportModalVisible(false);
              setImportQuantity('');
              fetchProducts();
          } else {
              alert('Lỗi: ' + result.message);
          }
      } catch (error) {
          alert('Lỗi kết nối Server.');
      }
  }

  // --- 3. XỬ LÝ LƯU (THÊM / SỬA) ---
  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert('Vui lòng nhập tên và giá sản phẩm!');

    const submitData = new FormData();
    submitData.append('vendor_id', CURRENT_VENDOR_ID); 
    submitData.append('name', formData.name);
    submitData.append('category', formData.category);
    submitData.append('price', formData.price);
    submitData.append('stock', formData.stock);
    submitData.append('unit', formData.unit);
    submitData.append('origin', formData.origin); // GỬI TRƯỜNG ORIGIN
    submitData.append('description', formData.description);
    submitData.append('status', formData.status);
    
    if (editingProduct) {
        submitData.append('id', editingProduct.id);
    }

    formData.images.forEach((img) => {
        if (typeof img === 'string') {
            submitData.append('existing_images[]', img);
        } else {
            submitData.append('new_images[]', img); 
        }
    });

    try {
        const endpoint = editingProduct ? 'update_product.php' : 'add_product.php';
        const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
            body: submitData 
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            alert(editingProduct ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            fetchProducts(); 
            setModalVisible(false);
        } else {
            alert('Lỗi: ' + (result.message || 'Không thể lưu'));
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi kết nối đến Server.');
    }
  }

  // --- 4. XỬ LÝ XÓA ---
  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
        const res = await fetch(`${API_BASE_URL}/delete_product.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ id: productToDelete.id, vendor_id: CURRENT_VENDOR_ID })
        });
        const result = await res.json();
        if (result.status === 'success') {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setDeleteModalVisible(false);
        } else {
            alert('Không thể xóa: ' + result.message);
        }
    } catch (error) {
        alert('Lỗi kết nối khi xóa.');
    }
  }

  // --- CÁC HÀM UI SUPPORT ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) {
        return alert("Chỉ được tối đa 5 ảnh.");
    }
    setFormData({ ...formData, images: [...formData.images, ...files] });
    e.target.value = null;
  }

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
          ...product, 
          images: Array.isArray(product.images) ? product.images : [] 
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', category: 'Rau Củ', price: '', stock: '', 
        unit: 'kg', origin: '', description: '', status: 'Còn hàng', 
        images: [] 
      });
    }
    setModalVisible(true);
  }

  const openDetailModal = (product) => {
    setViewProduct(product);
    const firstImg = (product.images && product.images.length > 0) 
        ? product.images[0] 
        : 'https://via.placeholder.com/300?text=No+Image';
    setActiveDetailImage(firstImg);
    setDetailModalVisible(true);
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Còn hàng': return 'success'
      case 'Hết hàng': return 'danger'
      case 'Sắp có hàng': return 'warning'
      default: return 'secondary'
    }
  }

  const filteredProducts = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-page-container">
      <style>{`
        .card-green-theme { background-color: #2F5233; color: #ffffff; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .modal-green-content { background-color: #2F5233; color: #ffffff; border: 1px solid #76c893; }
        .modal-header, .modal-footer { border-color: #558b6e; }
        .table-green-custom { --cui-table-color: #ffffff; --cui-table-bg: transparent; --cui-table-border-color: #558b6e; --cui-table-hover-bg: #3A6B35; }
        .table-green-custom thead th { background-color: #1E3923; color: #b7e4c7; font-weight: 700; border-bottom: 2px solid #558b6e; padding: 14px 16px; font-size: 0.85rem; }
        .table-green-custom td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #558b6e; }
        .form-control-green, .form-select-green { background-color: #1E3923; border: 1px solid #558b6e; color: #fff; }
        .form-control-green:focus, .form-select-green:focus { background-color: #1E3923; border-color: #ffd166; color: #fff; box-shadow: none; }
        .badge-status { padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .badge-active { background: rgba(82, 183, 136, 0.2); color: #76c893; border: 1px solid #76c893; }
        .badge-out { background: rgba(239, 71, 111, 0.2); color: #ef476f; border: 1px solid #ef476f; }
        .badge-soon { background: rgba(255, 209, 102, 0.2); color: #ffd166; border: 1px solid #ffd166; }
        .text-price { color: #ffd166; font-weight: 700; }
        .btn-icon { color: #b7e4c7; transition: 0.2s; opacity: 0.8; }
        .btn-icon:hover { color: #fff; opacity: 1; transform: scale(1.1); }
        .btn-icon.delete:hover { color: #ef476f; }
        .image-upload-container { display: flex; gap: 10px; flex-wrap: wrap; }
        .image-preview-box { width: 80px; height: 80px; border-radius: 8px; position: relative; border: 1px solid #558b6e; overflow: hidden; }
        .image-preview-box img { width: 100%; height: 100%; object-fit: cover; }
        .btn-remove-img { position: absolute; top: 2px; right: 2px; background: rgba(239,71,111,0.8); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 10px; }
        .upload-btn-box { width: 80px; height: 80px; border: 2px dashed #76c893; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #95d5b2; }
        .upload-btn-box:hover { border-color: #ffd166; color: #ffd166; background: rgba(255,255,255,0.05); }
        .detail-main-img { width: 100%; max-width: 300px; height: 300px; object-fit: cover; border-radius: 12px; background: rgba(0,0,0,0.2); }
        .detail-gallery-thumbs { display: flex; gap: 10px; justify-content: center; margin-top: 15px; }
        .detail-thumb { width: 50px; height: 50px; border-radius: 6px; cursor: pointer; opacity: 0.6; border: 2px solid transparent; object-fit: cover; }
        .detail-thumb.active { opacity: 1; border-color: #ffd166; }
        .detail-label { color: #95d5b2; font-size: 0.85rem; margin-bottom: 2px; }
        .detail-value { font-weight: 600; font-size: 1rem; margin-bottom: 12px; }
        .mobile-product-card { background: #1E3923; border: 1px solid #558b6e; border-radius: 10px; padding: 15px; margin-bottom: 15px; }
        .mobile-card-header { display: flex; align-items: center; border-bottom: 1px dashed #558b6e; padding-bottom: 10px; margin-bottom: 10px; }
        .mobile-card-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; margin-right: 15px; }
      `}</style>

      <CCard className="card-green-theme mb-4">
        <CCardBody>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
            <h4 className="mb-0 fw-bold" style={{color: '#d8f3dc'}}>Quản Lý Nông Sản</h4>
            <div className="d-flex gap-2 w-100 w-md-auto">
              <div className="position-relative w-100" style={{minWidth: '250px'}}>
                <CFormInput className="form-control-green ps-5" placeholder="Tìm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <CIcon icon={cilSearch} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              </div>
              <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={() => openModal()} className="text-white text-nowrap">
                <CIcon icon={cilPlus} className="me-2"/> Thêm mới
              </CButton>
            </div>
          </div>

          {loading ? (
              <div className="text-center py-5"><CSpinner color="success"/></div>
          ) : (
            <>
              <div className="d-none d-md-block">
                <CTable hover responsive className="table-green-custom mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sản Phẩm</CTableHeaderCell>
                      <CTableHeaderCell>Danh Mục</CTableHeaderCell>
                      <CTableHeaderCell>Xuất Xứ</CTableHeaderCell> {/* THÊM CỘT XUẤT XỨ */}
                      <CTableHeaderCell>Giá / Đơn vị</CTableHeaderCell>
                      <CTableHeaderCell>Kho</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Kiểm Duyệt</CTableHeaderCell>
                      <CTableHeaderCell>Trạng Thái</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Hành Động</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredProducts.map((item) => {
                        const avatarImg = (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/60?text=No+Image';
                        const isBanned = item.is_banned == 1; 

                        return (
                          <CTableRow key={item.id} className={isBanned ? "bg-danger bg-opacity-10" : ""}>
                            <CTableDataCell>
                              <div className="d-flex align-items-center">
                                <CAvatar src={avatarImg} size="md" className="me-3" style={{border: '2px solid #fff'}} />
                                <div>
                                  <div className="fw-semibold d-flex align-items-center">
                                    {item.name}
                                    {isBanned && (
                                        <CTooltip content="Sản phẩm bị cấm bán">
                                            <CIcon icon={cilBan} className="text-danger ms-2" />
                                        </CTooltip>
                                    )}
                                  </div>
                                  <div className="small" style={{color: '#95d5b2'}}><CIcon icon={cilMap} size="sm" className="me-1"/>{item.origin || "Chưa xác định"}</div>
                                </div>
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>{item.category}</CTableDataCell>
                            <CTableDataCell>{item.origin}</CTableDataCell> {/* HIỂN THỊ XUẤT XỨ */}
                            <CTableDataCell><span className="text-price">{formatCurrency(item.price)}</span> / {item.unit}</CTableDataCell>
                            <CTableDataCell className="fw-bold">{item.stock}</CTableDataCell>
                            
                            <CTableDataCell className="text-center">
                                {item.approval_status === 'approved' && <CTooltip content="Đã duyệt"><CIcon icon={cilCheckCircle} className="text-success"/></CTooltip>}
                                {item.approval_status === 'pending' && <CTooltip content="Chờ admin duyệt"><CIcon icon={cilWarning} className="text-warning"/></CTooltip>}
                                {item.approval_status === 'rejected' && <CTooltip content="Bị từ chối"><CIcon icon={cilXCircle} className="text-danger"/></CTooltip>}
                            </CTableDataCell>

                            <CTableDataCell>
                              <span className={`badge-status ${item.status === 'Còn hàng' ? 'badge-active' : item.status === 'Hết hàng' ? 'badge-out' : 'badge-soon'}`}>
                                {item.status}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              <CTooltip content="Nhập thêm hàng">
                                <CButton color="link" className="btn-icon p-1 text-success" onClick={() => { setProductToImport(item); setImportModalVisible(true); }}>
                                    <CIcon icon={cilStorage} size="xl"/>
                                </CButton>
                              </CTooltip>
                              <CButton color="link" className="btn-icon p-1" onClick={() => openDetailModal(item)}><CIcon icon={cilInfo}/></CButton>
                              <CButton color="link" className="btn-icon p-1" onClick={() => openModal(item)}><CIcon icon={cilPencil}/></CButton>
                              <CButton color="link" className="btn-icon delete p-1" onClick={() => { setProductToDelete(item); setDeleteModalVisible(true); }}><CIcon icon={cilTrash}/></CButton>
                            </CTableDataCell>
                          </CTableRow>
                        );
                    })}
                  </CTableBody>
                </CTable>
              </div>

              {/* MOBILE VIEW */}
              <div className="d-block d-md-none">
                 {filteredProducts.map(item => (
                     <div key={item.id} className="mobile-product-card">
                         <div className="d-flex justify-content-between mb-2">
                             <span className="fw-bold text-white">{item.name}</span>
                             {item.is_banned == 1 && <CBadge color="danger">Bị Cấm</CBadge>}
                         </div>
                         <div className="small text-white-50 mb-1">Xuất xứ: {item.origin}</div>
                         <div className="small text-muted-custom mb-1">Tồn kho: {item.stock} {item.unit}</div>
                         <div className="text-end mt-2 pt-2 border-top border-secondary">
                             <CButton size="sm" color="success" variant="outline" className="me-2" onClick={() => { setProductToImport(item); setImportModalVisible(true); }}>Nhập kho</CButton>
                             <CButton size="sm" color="info" variant="outline" className="me-2" onClick={() => openDetailModal(item)}>Chi tiết</CButton>
                             <CButton size="sm" color="warning" variant="outline" onClick={() => openModal(item)}>Sửa</CButton>
                         </div>
                     </div>
                 ))}
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      {/* --- MODAL NHẬP HÀNG --- */}
      <CModal visible={importModalVisible} onClose={() => setImportModalVisible(false)} alignment="center">
          <div className="modal-green-content">
              <CModalHeader><CModalTitle>Nhập kho sản phẩm</CModalTitle></CModalHeader>
              <CModalBody>
                  <p>Sản phẩm: <strong>{productToImport?.name}</strong></p>
                  <p>Tồn hiện tại: <CBadge color="info">{productToImport?.stock} {productToImport?.unit}</CBadge></p>
                  <div className="mt-3">
                      <CFormLabel>Số lượng cộng thêm vào kho:</CFormLabel>
                      <CFormInput 
                        type="number" 
                        className="form-control-green" 
                        placeholder="Ví dụ: 10" 
                        value={importQuantity}
                        onChange={(e) => setImportQuantity(e.target.value)}
                      />
                  </div>
              </CModalBody>
              <CModalFooter>
                  <CButton color="secondary" onClick={() => setImportModalVisible(false)}>Hủy</CButton>
                  <CButton style={{backgroundColor: '#52b788', border:'none'}} onClick={handleImportStock} className="text-white">Xác nhận nhập kho</CButton>
              </CModalFooter>
          </div>
      </CModal>

      {/* --- MODAL THÊM / SỬA - CẬP NHẬT TRƯỜNG ORIGIN --- */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" alignment="center">
        <div className="modal-green-content">
          <CModalHeader><CModalTitle>{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Mới'}</CModalTitle></CModalHeader>
          <CModalBody>
            <CRow>
              <CCol xs={12} className="mb-3">
                  <CFormLabel>Hình ảnh (Tối đa 5)</CFormLabel>
                  <div className="image-upload-container">
                      {formData.images.map((img, idx) => {
                          const src = (typeof img === 'string') ? img : URL.createObjectURL(img);
                          return (
                              <div key={idx} className="image-preview-box">
                                  <img src={src} alt="preview" />
                                  <span className="btn-remove-img" onClick={() => removeImage(idx)}><CIcon icon={cilX}/></span>
                              </div>
                          )
                      })}
                      {formData.images.length < 5 && (
                          <>
                            <label htmlFor="p-upload" className="upload-btn-box"><CIcon icon={cilCloudUpload} size="xl"/><span style={{fontSize:'0.7rem'}}>Upload</span></label>
                            <CFormInput type="file" id="p-upload" multiple accept="image/*" style={{display:'none'}} onChange={handleImageChange} />
                          </>
                      )}
                  </div>
              </CCol>
              
              <CCol xs={12} className="mb-3"><CFormLabel>Tên Sản Phẩm</CFormLabel><CFormInput className="form-control-green" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></CCol>
              <CCol md={6} xs={12} className="mb-3"><CFormLabel>Danh Mục</CFormLabel><CFormSelect className="form-select-green" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option value="Rau Củ">Rau Củ</option><option value="Trái Cây">Trái Cây</option><option value="Gạo & Ngũ cốc">Gạo & Ngũ cốc</option></CFormSelect></CCol>
              
              {/* THÊM TRƯỜNG NHẬP XUẤT XỨ */}
              <CCol md={6} xs={12} className="mb-3"><CFormLabel>Xuất Xứ</CFormLabel><CFormInput className="form-control-green" placeholder="Ví dụ: Đà Lạt, Tiền Giang..." value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} /></CCol>
              
              <CCol xs={6} className="mb-3"><CFormLabel>Giá (VNĐ)</CFormLabel><CFormInput type="number" className="form-control-green" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></CCol>
              <CCol xs={3} className="mb-3"><CFormLabel>Kho</CFormLabel><CFormInput type="number" className="form-control-green" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></CCol>
              <CCol xs={3} className="mb-3"><CFormLabel>Đơn vị</CFormLabel><CFormInput className="form-control-green" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></CCol>
              <CCol xs={12} className="mb-3"><CFormLabel>Mô tả</CFormLabel><CFormTextarea rows={3} className="form-control-green" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>Hủy</CButton>
              <CButton style={{backgroundColor: '#52b788', border:'none'}} onClick={handleSave} className="text-white"><CIcon icon={cilSave} className="me-2"/>Lưu</CButton>
          </CModalFooter>
        </div>
      </CModal>

      {/* --- MODAL CHI TIẾT - HIỂN THỊ XUẤT XỨ --- */}
      <CModal visible={detailModalVisible} onClose={() => setDetailModalVisible(false)} size="lg" alignment="center">
        <div className="modal-green-content">
            <CModalHeader><CModalTitle>Chi Tiết Sản Phẩm</CModalTitle></CModalHeader>
            <CModalBody>
                {viewProduct && (
                    <>
                        {viewProduct.is_banned == 1 && (
                            <CAlert color="danger" className="d-flex align-items-center mb-4">
                                <CIcon icon={cilBan} className="flex-shrink-0 me-2" size="xl" />
                                <div><strong>Sản phẩm này đã bị Admin cấm bán!</strong></div>
                            </CAlert>
                        )}
                        <CRow>
                            <CCol md={5} className="text-center mb-3">
                                <img src={activeDetailImage} className="detail-main-img" alt="Product" />
                                <div className="detail-gallery-thumbs">
                                    {viewProduct.images && viewProduct.images.map((img, idx) => (
                                        <img key={idx} src={img} className={`detail-thumb ${activeDetailImage === img ? 'active' : ''}`} onClick={() => setActiveDetailImage(img)} />
                                    ))}
                                </div>
                            </CCol>
                            <CCol md={7} className="ps-md-4">
                                <h3 className="fw-bold mb-1">{viewProduct.name}</h3>
                                <div className="mb-3 text-muted-custom small">Mã SP: #{viewProduct.id}</div>
                                <div className="d-flex gap-2 mb-3">
                                    <CBadge color={getBadgeColor(viewProduct.status)} shape="rounded-pill">{viewProduct.status}</CBadge>
                                    <CBadge color={viewProduct.approval_status === 'approved' ? 'success' : 'warning'} shape="rounded-pill">
                                        {viewProduct.approval_status === 'approved' ? 'Đã Kiểm Duyệt' : 'Chờ Duyệt'}
                                    </CBadge>
                                </div>
                                <CRow>
                                    <CCol xs={6}><div className="detail-label">Danh mục</div><div className="detail-value text-white">{viewProduct.category}</div></CCol>
                                    <CCol xs={6}><div className="detail-label">Xuất xứ</div><div className="detail-value text-white">{viewProduct.origin || "Chưa xác định"}</div></CCol> {/* THÊM XUẤT XỨ */}
                                    <CCol xs={6}><div className="detail-label">Giá bán</div><div className="detail-value text-price">{formatCurrency(viewProduct.price)} / {viewProduct.unit}</div></CCol>
                                    <CCol xs={6}><div className="detail-label">Kho hiện tại</div><div className="detail-value">{viewProduct.stock} {viewProduct.unit}</div></CCol>
                                </CRow>
                                <div className="detail-label mt-2">Mô tả chi tiết:</div>
                                <p className="detail-value fw-normal small opacity-75 border-top border-secondary pt-2" style={{color: '#d8f3dc'}}>{viewProduct.description || "Chưa có mô tả."}</p>
                            </CCol>
                        </CRow>
                    </>
                )}
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setDetailModalVisible(false)}>Đóng</CButton>
                <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={() => { setDetailModalVisible(false); openModal(viewProduct); }} className="text-white"><CIcon icon={cilPencil} className="me-2"/> Sửa Thông Tin</CButton>
            </CModalFooter>
        </div>
      </CModal>

      {/* --- MODAL XÓA --- */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} alignment="center">
          <div className="modal-green-content">
              <CModalHeader><CModalTitle className="text-danger">Xóa Sản Phẩm?</CModalTitle></CModalHeader>
              <CModalBody>Bạn có chắc muốn xóa <strong>{productToDelete?.name}</strong> không?</CModalBody>
              <CModalFooter>
                  <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Hủy</CButton>
                  <CButton color="danger" className="text-white" onClick={confirmDelete}>Xóa Luôn</CButton>
              </CModalFooter>
          </div>
      </CModal>
    </div>
  )
}

export default Products