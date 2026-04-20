import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableHead,
  CTableHeaderCell, CTableRow, CTableDataCell, CButton, CFormInput, CModal,
  CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormSelect, CFormLabel,
  CBadge, CProgress, CFormSwitch, CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilPlus, cilPencil, cilTrash, cilSearch, cilTag, cilCheckCircle, cilBasket 
} from '@coreui/icons'

// --- CẤU HÌNH API ---
import { API_BASE } from 'src/config';
const API_URL = `${API_BASE}/promotions.php`;
const PRODUCT_API_URL = `${API_BASE}/products.php`;
const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
const VENDOR_ID = storedUser.id || 1; 

const Promotions = () => {
  const [promotions, setPromotions] = useState([])
  const [vendorProducts, setVendorProducts] = useState([]) // Thêm state lưu SP
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    code: '', name: '', type: 'percent', value: '', 
    scope: 'order', productId: '', // Thêm productId vào form
    startDate: '', endDate: '', limit: 100
  })

  // --- LẤY DỮ LIỆU ---
  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_all&vendor_id=${VENDOR_ID}`);
      const data = await response.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Lỗi tải dữ liệu:", error); }
  }
  // Thay thế hàm toggleStatus cũ trong Promotions.js của bạn:
const toggleStatus = async (id, currentStatus) => {
    // 1. Tính toán trạng thái mới (đảo ngược trạng thái hiện tại)
    const newStatus = currentStatus ? 0 : 1;

    try {
        // 2. Gọi API cập nhật Database
        const response = await fetch(`${API_URL}?action=toggle_status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: newStatus })
        });
        const result = await response.json();

        if (result.status === 'success') {
            // 3. Cập nhật lại State để giao diện thay đổi
            setPromotions(promotions.map(p => 
                p.id === id ? { ...p, status: newStatus } : p
            ));
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi kết nối status:", error);
    }
}
  // Thay đổi hàm fetchProducts của bạn:
const fetchProducts = async () => {
  try {
    // Gọi trực tiếp action mới trong file promotions.php
    const response = await fetch(`${API_URL}?action=get_vendor_products&vendor_id=${VENDOR_ID}`);
    const data = await response.json();
    setVendorProducts(Array.isArray(data) ? data : []);
  } catch (error) { console.error("Lỗi tải sản phẩm:", error); }
}

  useEffect(() => { 
    fetchPromotions(); 
    fetchProducts(); // Load SP để chọn trong Modal
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const openModal = (item = null) => {
    if (item) {
        setEditingItem(item)
        setFormData({
            ...item,
            startDate: item.start_date, 
            endDate: item.end_date,
            limit: item.usage_limit,
            productId: item.product_id || ''
        })
    } else {
        setEditingItem(null)
        setFormData({
            code: '', name: '', type: 'percent', value: '', 
            scope: 'order', productId: '', 
            startDate: '', endDate: '', limit: 100
        })
    }
    setModalVisible(true)
  }

  const handleSave = async () => {
    if(!formData.code || !formData.value) return alert("Vui lòng nhập đủ thông tin mã và giá trị!")
    if(formData.scope === 'product' && !formData.productId) return alert("Vui lòng chọn sản phẩm áp dụng!")

    const payload = {
        id: editingItem ? editingItem.id : null,
        ...formData,
        vendor_id: VENDOR_ID
    }

    try {
        const action = editingItem ? 'update' : 'create';
        const response = await fetch(`${API_URL}?action=${action}`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if(result.status === 'success') {
            alert("Thành công!");
            fetchPromotions();
            setModalVisible(false);
        } else { alert("Lỗi: " + result.message); }
    } catch (error) { alert("Lỗi kết nối!"); }
  }

  const handleDelete = async (id) => {
      if(window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
          try {
              const response = await fetch(`${API_URL}?action=delete&id=${id}`);
              const result = await response.json();
              if(result.status === 'success') fetchPromotions();
          } catch (error) { alert("Lỗi khi xóa"); }
      }
  }

  const filteredPromotions = promotions.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="promotions-page-container">
      <style>{`
  .card-green-theme { 
    background-color: #ffffff; 
    color: #2c2c2c; 
    border: 1px solid #e5e7eb; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
  }

  .modal-green-content { 
    background-color: #ffffff; 
    color: #2c2c2c; 
    border: 1px solid #e5e7eb; 
  }

  .modal-header, .modal-footer { 
    border-color: #e5e7eb; 
  }

  .table-green-custom { 
    --cui-table-color: #2c2c2c; 
    --cui-table-bg: #ffffff; 
    --cui-table-border-color: #e5e7eb; 
    --cui-table-hover-bg: #f9fafb; 
  }

  .table-green-custom thead th { 
    background-color: #f3f4f6; 
    color: #374151; 
    font-weight: 600; 
    border-bottom: 2px solid #e5e7eb; 
    padding: 14px 16px; 
  }

  .table-green-custom td { 
    padding: 16px; 
    vertical-align: middle; 
    border-bottom: 1px solid #f1f1f1; 
  }

  .form-control-green, 
  .form-select-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #2c2c2c; 
  }

  .form-control-green:focus, 
  .form-select-green:focus { 
    background-color: #ffffff; 
    border-color: #9ca3af; 
    color: #2c2c2c; 
    box-shadow: 0 0 0 0.2rem rgba(156, 163, 175, 0.2); 
  }

  .coupon-code { 
    background-color: #f3f4f6; 
    color: #111827; 
    padding: 4px 10px; 
    border-radius: 6px; 
    font-weight: 600; 
    font-family: monospace; 
    letter-spacing: 1px; 
    display: inline-block; 
    border: 1px dashed #9ca3af; 
  }

  .text-value { 
    color: #111827; 
    font-weight: 700; 
  }

  .btn-action:hover { 
    color: #111827 !important; 
    transform: scale(1.1); 
    transition: 0.2s; 
  }
`}</style>

      <CCard className="card-green-theme mb-4">
        <CCardHeader className="border-bottom border-secondary pt-3 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <h5 className="mb-0 fw-bold d-flex align-items-center" style={{color: '#000000'}}>
            <CIcon icon={cilTag} className="me-2 text-warning"/> Quản Lý Mã Giảm Giá
          </h5>
          <div className="d-flex w-100 w-md-auto gap-2">
             <div className="position-relative w-100" style={{minWidth: '200px'}}>
                <CFormInput 
                    className="form-control-green ps-5" 
                    placeholder="Tìm mã, tên..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CIcon icon={cilSearch} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" />
             </div>
             <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={() => openModal()} className="fw-semibold text-white text-nowrap">
                <CIcon icon={cilPlus} className="me-1"/> Tạo Mã
             </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
            <div className="d-none d-md-block">
                <CTable hover responsive className="table-green-custom mb-0">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Mã Voucher</CTableHeaderCell>
                            <CTableHeaderCell>Tên Chương Trình</CTableHeaderCell>
                            <CTableHeaderCell>Mức Giảm</CTableHeaderCell>
                            <CTableHeaderCell>Phạm Vi</CTableHeaderCell>
                            <CTableHeaderCell>Thời Gian</CTableHeaderCell>
                            <CTableHeaderCell style={{width: '15%'}}>Lượt Dùng</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Hành Động</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {filteredPromotions.map(item => (
                            <CTableRow key={item.id}>
                                <CTableDataCell><div className="coupon-code">{item.code}</div></CTableDataCell>
                                <CTableDataCell><div className="fw-semibold">{item.name}</div></CTableDataCell>
                                <CTableDataCell className="text-value">
                                    {item.type === 'percent' ? `${item.value}%` : formatCurrency(item.value)}
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CBadge color={item.scope === 'order' ? 'info' : 'warning'}>
                                        {item.scope === 'order' ? 'Cửa hàng' : 'Sản phẩm lẻ'}
                                    </CBadge>
                                    {item.product_name && <div className="small text-truncate" style={{maxWidth:'120px'}}>{item.product_name}</div>}
                                </CTableDataCell>
                                <CTableDataCell className="small">
                                    <div>{item.start_date}</div>
                                    <div className="text-white-50">đến {item.end_date}</div>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span>{item.used_count}</span>
                                        <span className="text-white-50">/ {item.usage_limit}</span>
                                    </div>
                                    <CProgress color={item.used_count >= item.usage_limit ? 'danger' : 'success'} value={(item.used_count/item.usage_limit)*100} height={6} />
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
    <CFormSwitch 
        // Ép kiểu về số vì Database trả về chuỗi "1"/"0" hoặc số 1/0
        checked={Number(item.status) === 1} 
        onChange={() => toggleStatus(item.id, Number(item.status) === 1)} 
    />
</CTableDataCell>
                                <CTableDataCell className="text-end">
                                    <CButton color="link" className="btn-action text-white p-1" onClick={() => openModal(item)}>
                                        <CIcon icon={cilPencil} />
                                    </CButton>
                                    <CButton color="link" className="btn-action text-danger p-1" onClick={() => handleDelete(item.id)}>
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </div>
        </CCardBody>
      </CCard>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" alignment="center">
        <div className="modal-green-content">
            <CModalHeader><CModalTitle>{editingItem ? 'Cập Nhật' : 'Tạo Mới'}</CModalTitle></CModalHeader>
            <CModalBody>
                <CRow>
                    <CCol md={6} className="mb-3">
                        <CFormLabel>Mã Voucher</CFormLabel>
                        <CFormInput className="form-control-green text-uppercase fw-bold" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                    </CCol>
                    <CCol md={6} className="mb-3">
                        <CFormLabel>Tên Chương Trình</CFormLabel>
                        <CFormInput className="form-control-green" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </CCol>

                    {/* --- PHẦN MỚI: PHẠM VI ÁP DỤNG --- */}
                    <CCol md={12} className="mb-3">
                        <CFormLabel>Phạm Vi Áp Dụng</CFormLabel>
                        <CFormSelect 
                          className="form-select-green" 
                          value={formData.scope} 
                          onChange={(e) => setFormData({...formData, scope: e.target.value, productId: ''})}
                        >
                            <option value="order">Giảm toàn bộ sản phẩm của cửa hàng</option>
                            <option value="product">Giảm cho sản phẩm cụ thể</option>
                        </CFormSelect>
                    </CCol>

                    {formData.scope === 'product' && (
                      <CCol md={12} className="mb-3">
                          <CFormLabel><CIcon icon={cilBasket} className="me-1"/> Chọn Sản Phẩm</CFormLabel>
                          <CFormSelect 
                            className="form-select-green" 
                            value={formData.productId} 
                            onChange={(e) => setFormData({...formData, productId: e.target.value})}
                          >
                              <option value="">-- Chọn sản phẩm --</option>
                              {vendorProducts.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} - ({formatCurrency(p.price)})</option>
                              ))}
                          </CFormSelect>
                      </CCol>
                    )}

                    <CCol md={4} className="mb-3">
                        <CFormLabel>Loại Giảm</CFormLabel>
                        <CFormSelect className="form-select-green" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="percent">Phần trăm (%)</option>
                            <option value="fixed">Tiền mặt (VNĐ)</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={8} className="mb-3">
                        <CFormLabel>Giá Trị Giảm</CFormLabel>
                        <CFormInput type="number" className="form-control-green" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
                    </CCol>
                    <CCol md={4} className="mb-3">
                        <CFormLabel>Số Lượng Mã</CFormLabel>
                        <CFormInput type="number" className="form-control-green" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} />
                    </CCol>
                    <CCol md={4} className="mb-3">
                        <CFormLabel>Ngày Bắt Đầu</CFormLabel>
                        <CFormInput type="date" className="form-control-green" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                    </CCol>
                    <CCol md={4} className="mb-3">
                        <CFormLabel>Ngày Kết Thúc</CFormLabel>
                        <CFormInput type="date" className="form-control-green" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                    </CCol>
                </CRow>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setModalVisible(false)}>Hủy</CButton>
                <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={handleSave}>Lưu Mã</CButton>
            </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default Promotions