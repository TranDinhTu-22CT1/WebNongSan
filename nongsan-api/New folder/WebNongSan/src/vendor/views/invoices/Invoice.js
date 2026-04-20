import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableHead, 
  CTableHeaderCell, CTableRow, CTableDataCell, CButton, CFormInput, CModal, 
  CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge, CTooltip, 
  CFormTextarea, CFormLabel, CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilSearch, cilPrint, cilInfo, cilCloudDownload, cilDescription, cilBan, 
  cilCreditCard, cilWallet
} from '@coreui/icons'
import * as XLSX from 'xlsx'

// --- CẤU HÌNH API ---
import { API_BASE as API_BASE_URL } from 'src/config';

const Invoice = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State Modal
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [invoiceToCancel, setInvoiceToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  // --- 1. LẤY DỮ LIỆU TỪ API ---
  const fetchInvoices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/get_invoices.php`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await res.json();
      if (result.status === 'success') {
        setInvoices(result.data);
      } else {
        console.error(result.message);
        setInvoices([]);
      }
    } catch (err) {
      console.error("Lỗi kết nối API lấy hóa đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // --- 2. XỬ LÝ HỦY ĐƠN HÀNG QUA API ---
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng!');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/cancel_order.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_code: invoiceToCancel.id,
          cancel_reason: cancelReason
        })
      });
      const result = await res.json();

      if (result.status === 'success') {
        alert("Đã hủy đơn hàng thành công!");
        setCancelModalVisible(false);
        fetchInvoices(); // Tải lại danh sách sau khi hủy
        
        if (selectedInvoice && selectedInvoice.id === invoiceToCancel.id) {
          setModalVisible(false);
        }
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Lỗi kết nối Server.");
    }
  }

  // --- LOGIC TÌM KIẾM ---
  const filteredInvoices = invoices.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.customer && item.customer.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const openInvoiceDetail = (invoice) => {
    setSelectedInvoice(invoice)
    setModalVisible(true)
  }

  const openCancelModal = (invoice) => {
    setInvoiceToCancel(invoice)
    setCancelReason('')
    setCancelModalVisible(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã thanh toán': case 'Đã giao hàng': return 'success'
      case 'Chờ thanh toán': case 'Đang giao hàng': return 'warning'
      case 'Chờ lấy hàng': return 'info'
      case 'Hủy': case 'Đã hủy': return 'danger'
      default: return 'secondary'
    }
  }

  // --- HÀM HIỂN THỊ PHƯƠNG THỨC THANH TOÁN ---
  const renderPaymentMethod = (method) => {
    if (method === 'Chuyển khoản') {
      return (
        <span className="text-info d-flex align-items-center fw-semibold">
          <CIcon icon={cilCreditCard} className="me-1"/> Online
        </span>
      )
    }
    return (
      <span className="text-warning d-flex align-items-center fw-semibold">
        <CIcon icon={cilWallet} className="me-1"/> Tiền mặt
      </span>
    )
  }

  const handlePrint = () => { window.print(); }

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const dataToExport = invoices.map(inv => ({
        "Mã HĐ": inv.id,
        "Khách Hàng": inv.customer,
        "Ngày Tạo": inv.date,
        "Tổng Tiền (VNĐ)": inv.amount,
        "Phương Thức": inv.payment_method || 'Tiền mặt',
        "Thanh Toán": inv.paymentStatus,
        "Vận Chuyển": inv.deliveryStatus,
        "Lý Do Hủy": inv.cancelReason || '',
        "Địa Chỉ": inv.address,
        "Số Điện Thoại": inv.phone,
        "Chi Tiết Sản Phẩm": inv.items.map(i => `${i.name} (x${i.qty} ${i.unit})`).join(', ')
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHoaDon");
    XLSX.writeFile(workbook, "Danh_Sach_Hoa_Don_Nong_San.xlsx");
  }

  return (
    <div className="invoice-page-container">
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
    text-transform: uppercase; 
    font-size: 0.85rem; 
  }

  .table-green-custom td { 
    padding: 16px; 
    vertical-align: middle; 
    border-bottom: 1px solid #f1f1f1; 
  }

  .form-control-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #2c2c2c; 
  }

  .form-control-green:focus { 
    background-color: #ffffff; 
    border-color: #9ca3af; 
    color: #2c2c2c; 
    box-shadow: 0 0 0 0.2rem rgba(156, 163, 175, 0.2); 
  }

  .text-price { 
    color: #dc2626; 
    font-weight: 700; 
  }

  .invoice-box { 
    border: 1px solid #e5e7eb; 
    padding: 20px; 
    border-radius: 10px; 
    background-color: #ffffff; 
  }

  .cancel-reason-box { 
    background-color: #fef2f2; 
    border: 1px dashed #fca5a5; 
    color: #991b1b; 
    padding: 15px; 
    border-radius: 8px; 
    margin-bottom: 20px; 
  }

  .mobile-card { 
    background-color: #ffffff; 
    border: 1px solid #e5e7eb; 
    border-radius: 10px; 
    padding: 15px; 
    margin-bottom: 15px; 
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }
`}</style>

      <CCard className="card-green-theme mb-4">
        <CCardHeader className="border-bottom border-secondary pt-3 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h5 className="mb-0 fw-bold d-flex align-items-center" style={{color: '#000000'}}>
            <CIcon icon={cilDescription} className="me-2 text-warning"/> Quản Lý Hóa Đơn
          </h5>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <div className="position-relative w-100">
                <CFormInput className="form-control-green ps-5 w-100" placeholder="Tìm mã đơn, tên khách..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <CIcon icon={cilSearch} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            </div>
            <CButton style={{backgroundColor: '#52b788', border: 'none'}} className="fw-semibold text-white w-100 w-sm-auto" onClick={handleExportExcel}>
                <CIcon icon={cilCloudDownload} className="me-2"/> Xuất Excel
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="success"/></div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="d-none d-md-block">
                <CTable hover responsive className="table-green-custom mb-0">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Mã HĐ</CTableHeaderCell>
                            <CTableHeaderCell>Khách Hàng</CTableHeaderCell>
                            <CTableHeaderCell>Tổng Tiền</CTableHeaderCell>
                            <CTableHeaderCell>Phương Thức</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Thanh Toán</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Vận Chuyển</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Hành Động</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                    {filteredInvoices.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell className="fw-bold text-info">{item.id}</CTableDataCell>
                        <CTableDataCell>{item.customer || 'Chưa cập nhật'}</CTableDataCell>
                        <CTableDataCell className="text-price">{formatCurrency(item.amount)}</CTableDataCell>
                        <CTableDataCell>{renderPaymentMethod(item.payment_method)}</CTableDataCell>
                        <CTableDataCell className="text-center">
                            <CBadge color={getStatusColor(item.paymentStatus)} shape="rounded-pill">{item.paymentStatus}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                            <CBadge color={getStatusColor(item.deliveryStatus)}>{item.deliveryStatus}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                            <CTooltip content="Chi tiết"><CButton color="link" className="p-1" onClick={() => openInvoiceDetail(item)}><CIcon icon={cilInfo} /></CButton></CTooltip>
                            <CTooltip content="In"><CButton color="link" className="p-1 ms-2" onClick={handlePrint}><CIcon icon={cilPrint} /></CButton></CTooltip>
                            {(item.paymentStatus !== 'Hủy' && item.deliveryStatus !== 'Đã giao hàng') && (
                                <CTooltip content="Hủy đơn"><CButton color="link" className="p-1 ms-1 text-danger" onClick={() => openCancelModal(item)}><CIcon icon={cilBan} /></CButton></CTooltip>
                            )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    </CTableBody>
                </CTable>
              </div>

              {/* MOBILE CARDS */}
              <div className="d-block d-md-none">
                {filteredInvoices.map((item) => (
                    <div key={item.id} className="mobile-card">
                        <div className="d-flex justify-content-between mb-3">
                            <div className="fw-bold text-info">{item.id}</div>
                            <div className="text-price">{formatCurrency(item.amount)}</div>
                        </div>
                        <div className="small mb-1">Khách: {item.customer}</div>
                        <div className="small mb-2">PT: {renderPaymentMethod(item.payment_method)}</div>
                        <div className="d-flex gap-2 mb-3">
                            <CBadge color={getStatusColor(item.paymentStatus)} shape="rounded-pill">{item.paymentStatus}</CBadge>
                            <CBadge color={getStatusColor(item.deliveryStatus)}>{item.deliveryStatus}</CBadge>
                        </div>
                        <div className="border-top border-secondary pt-2 d-flex justify-content-end gap-2">
                            <CButton size="sm" color="info" variant="outline" onClick={() => openInvoiceDetail(item)}>Chi tiết</CButton>
                            {(item.paymentStatus !== 'Hủy' && item.deliveryStatus !== 'Đã giao hàng') && (
                                <CButton size="sm" color="danger" variant="outline" onClick={() => openCancelModal(item)}>Hủy đơn</CButton>
                            )}
                        </div>
                    </div>
                ))}
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      {/* --- MODAL CHI TIẾT --- */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" alignment="center">
        <div className="modal-green-content">
          <CModalHeader><CModalTitle>Chi Tiết Hóa Đơn</CModalTitle></CModalHeader>
          <CModalBody>
            {selectedInvoice && (
              <div className="invoice-box">
                <CRow className="mb-4">
                    <CCol xs={6}><h4 className="fw-bold text-success">NÔNG SẢN SẠCH</h4></CCol>
                    <CCol xs={6} className="text-end"><h5 className="fw-bold">{selectedInvoice.id}</h5><div className="small opacity-50">{selectedInvoice.date}</div></CCol>
                </CRow>
                
                <div className="mb-3 p-2 rounded" style={{border: '1px dashed #558b6e', backgroundColor: '#1E3923'}}>
                   <span className="me-2">Phương thức thanh toán:</span>
                   <span className="fw-bold text-warning">{selectedInvoice.payment_method || 'Tiền mặt'}</span>
                </div>

                {selectedInvoice.paymentStatus === 'Hủy' && (
                    <div className="cancel-reason-box"><strong>Lý do hủy:</strong> {selectedInvoice.cancelReason}</div>
                )}
                <div className="mb-4">
                    <h6 className="text-warning fw-bold">Giao hàng đến:</h6>
                    <div>{selectedInvoice.customer} - {selectedInvoice.phone}</div>
                    <div className="small opacity-75">{selectedInvoice.address}</div>
                </div>
                <CTable hover responsive className="table-green-custom">
                    <CTableHead><CTableRow><CTableHeaderCell>Sản phẩm</CTableHeaderCell><CTableHeaderCell className="text-center">SL</CTableHeaderCell><CTableHeaderCell className="text-end">Đơn giá</CTableHeaderCell><CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell></CTableRow></CTableHead>
                    <CTableBody>
                        {selectedInvoice.items.map((item, idx) => (
                            <CTableRow key={idx}>
                                <CTableDataCell>{item.name}</CTableDataCell>
                                <CTableDataCell className="text-center">{item.qty}</CTableDataCell>
                                <CTableDataCell className="text-end">{formatCurrency(item.price)}</CTableDataCell>
                                <CTableDataCell className="text-end fw-bold">{formatCurrency(item.price * item.qty)}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
                <div className="text-end mt-3 border-top border-secondary pt-2">
                    <span className="fs-5 text-warning fw-bold">Tổng: {formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>Đóng</CButton>
            <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={handlePrint} className="text-white"><CIcon icon={cilPrint} className="me-2"/> In hóa đơn</CButton>
          </CModalFooter>
        </div>
      </CModal>

      {/* --- MODAL HỦY ĐƠN --- */}
      <CModal visible={cancelModalVisible} onClose={() => setCancelModalVisible(false)} alignment="center">
        <div className="modal-green-content">
          <CModalHeader><CModalTitle className="text-danger">Xác Nhận Hủy Đơn</CModalTitle></CModalHeader>
          <CModalBody>
            <p>Hủy hóa đơn <strong>{invoiceToCancel?.id}</strong>?</p>
            <CFormLabel className="text-warning small">Lý do hủy (bắt buộc):</CFormLabel>
            <CFormTextarea className="form-control-green" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}/>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setCancelModalVisible(false)}>Đóng</CButton>
            <CButton color="danger" className="text-white" onClick={handleConfirmCancel}>Xác Nhận Hủy</CButton>
          </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default Invoice