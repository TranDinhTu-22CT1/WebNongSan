import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableHead, 
  CTableHeaderCell, CTableRow, CTableDataCell, CButton, CFormTextarea, CModal, 
  CModalHeader, CModalTitle, CModalBody, CModalFooter, CBadge, CFormSelect, 
  CFormLabel, CNav, CNavItem, CNavLink, CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilStar, cilCommentSquare, cilWarning, cilCheckCircle
} from '@coreui/icons'

const API_BASE_URL = 'http://localhost/nongsan-api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('All') 
  
  const [replyModal, setReplyModal] = useState(false)
  const [currentReview, setCurrentReview] = useState(null)
  const [replyText, setReplyText] = useState('')

  const [reportModal, setReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const token = localStorage.getItem('token');

  // --- 1. LẤY DỮ LIỆU ---
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/handle_reviews.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.status === 'success') {
        setReviews(result.data);
      }
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- 2. LOGIC ĐIỀU KHIỂN MODAL (PHẦN BẠN CÒN THIẾU) ---
  const openReplyModal = (item) => {
    setCurrentReview(item);
    setReplyText(item.reply || '');
    setReplyModal(true);
  };

  const openReportModal = (item) => {
    setCurrentReview(item);
    setReportReason('');
    setReportModal(true);
  };

  // --- 3. XỬ LÝ API ---
  const handleSaveReply = async () => {
    if (!replyText.trim()) return alert("Vui lòng nhập nội dung phản hồi!");
    try {
      const res = await fetch(`${API_BASE_URL}/handle_reviews.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          action: 'reply', 
          id: currentReview.id, 
          reply: replyText 
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Đã gửi phản hồi thành công!");
        setReplyModal(false);
        fetchReviews(); 
      }
    } catch (err) {
      alert("Lỗi kết nối server.");
    }
  };

  const handleConfirmReport = async () => {
    if (!reportReason) return alert("Vui lòng chọn lý do báo cáo!");
    try {
      const res = await fetch(`${API_BASE_URL}/handle_reviews.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          action: 'report', 
          id: currentReview.id, 
          reason: reportReason 
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Đã gửi báo cáo vi phạm thành công!");
        setReportModal(false);
        fetchReviews();
      }
    } catch (err) {
      alert("Lỗi kết nối server.");
    }
  };

  // ... (Giữ nguyên phần filter logic và renderStars của bạn)
  const filteredReviews = reviews.filter(item => {
    if (filterType === 'All') return true;
    const typeValue = (item.type || item.target_type || '').toLowerCase();
    if (filterType === 'Product') return typeValue === 'product' || typeValue === 'sản phẩm';
    if (filterType === 'Store') return typeValue === 'vendor' || typeValue === 'gian hàng';
    return true;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <CIcon 
        key={i} 
        icon={cilStar} 
        size="sm" 
        className={i < parseInt(rating) ? "text-warning" : "text-secondary opacity-25"} 
      />
    ));
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="success"/></div>;

  return (
    <div className="reviews-page-container">
      {/* CSS Styles của bạn giữ nguyên */}
      <style>{`
        .card-green-theme { background-color: #2F5233; color: #ffffff; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .modal-green-content { background-color: #2F5233; color: #ffffff; border: 1px solid #76c893; }
        .table-green-custom { --cui-table-color: #ffffff; --cui-table-bg: transparent; --cui-table-border-color: #558b6e; --cui-table-hover-bg: #3A6B35; }
        .table-green-custom thead th { background-color: #1E3923; color: #b7e4c7; font-weight: 700; border-bottom: 2px solid #558b6e; padding: 14px 16px; font-size: 0.85rem; }
        .table-green-custom td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #558b6e; }
        .form-control-green, .form-select-green { background-color: #1E3923; border: 1px solid #558b6e; color: #fff; }
        .nav-pills .nav-link { color: #b7e4c7; cursor: pointer; }
        .nav-pills .nav-link.active { background-color: #52b788 !important; color: white !important; }
        .reply-box { background-color: rgba(255,255,255,0.1); border-left: 3px solid #52b788; padding: 10px; margin-top: 8px; border-radius: 4px; font-size: 0.9rem; }
        .mobile-card { background-color: #1E3923; border: 1px solid #558b6e; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
      `}</style>

      <CCard className="card-green-theme mb-4">
        <CCardHeader className="border-bottom border-secondary pt-3 pb-3">
          <CRow className="align-items-center">
            <CCol md={6}>
              <h5 className="mb-0 fw-bold" style={{color: '#d8f3dc'}}>
                <CIcon icon={cilStar} className="me-2 text-warning"/> Quản Lý Đánh Giá & Phản Hồi
              </h5>
            </CCol>
            <CCol md={6} className="text-md-end mt-3 mt-md-0">
                <CNav variant="pills" className="justify-content-md-end">
                    <CNavItem><CNavLink active={filterType === 'All'} onClick={() => setFilterType('All')}>Tất cả</CNavLink></CNavItem>
                    <CNavItem><CNavLink active={filterType === 'Product'} onClick={() => setFilterType('Product')}>Sản phẩm</CNavLink></CNavItem>
                    <CNavItem><CNavLink active={filterType === 'Store'} onClick={() => setFilterType('Store')}>Gian hàng</CNavLink></CNavItem>
                </CNav>
            </CCol>
          </CRow>
        </CCardHeader>
        
        <CCardBody>
          <div className="d-none d-md-block">
            <CTable hover responsive className="table-green-custom mb-0">
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Khách Hàng</CTableHeaderCell>
                        <CTableHeaderCell>Đối Tượng</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Đánh Giá</CTableHeaderCell>
                        <CTableHeaderCell style={{width: '40%'}}>Nội Dung / Phản Hồi</CTableHeaderCell>
                        <CTableHeaderCell>Ngày</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Hành Động</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {filteredReviews.length > 0 ? filteredReviews.map(item => (
                        <CTableRow key={item.id}>
                            <CTableDataCell><strong>{item.customer}</strong></CTableDataCell>
                            <CTableDataCell>
                                <div className="fw-semibold">{item.targetName}</div>
                                <CBadge color={(item.type === 'Sản phẩm' || item.target_type === 'product') ? 'success' : 'info'} size="sm">
                                  {item.type || (item.target_type === 'product' ? 'Sản phẩm' : 'Gian hàng')}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">{renderStars(item.rating)}</CTableDataCell>
                            <CTableDataCell>
                                <div className="mb-2">"{item.comment}"</div>
                                {item.reply && (
                                    <div className="reply-box">
                                        <div className="fw-bold text-success mb-1"><CIcon icon={cilCheckCircle} size="sm" className="me-1"/>Phản hồi:</div>
                                        <em className="text-white-50">{item.reply}</em>
                                    </div>
                                )}
                                {(item.status === 'reported' || item.status === 'Đã báo cáo') && <CBadge color="danger" className="mt-1">Đã báo cáo vi phạm</CBadge>}
                            </CTableDataCell>
                            <CTableDataCell>{item.date || new Date(item.created_at).toLocaleDateString('vi-VN')}</CTableDataCell>
                            <CTableDataCell className="text-end">
                                <CButton color="link" className="text-white p-1" onClick={() => openReplyModal(item)}><CIcon icon={cilCommentSquare} /></CButton>
                                <CButton color="link" className="text-danger p-1 ms-1" onClick={() => openReportModal(item)}><CIcon icon={cilWarning} /></CButton>
                            </CTableDataCell>
                        </CTableRow>
                    )) : <CTableRow><CTableDataCell colSpan="6" className="text-center py-4">Không có đánh giá nào trong mục này.</CTableDataCell></CTableRow>}
                </CTableBody>
            </CTable>
          </div>

          {/* Giao diện Mobile */}
          <div className="d-block d-md-none">
            {filteredReviews.map(item => (
                <div key={item.id} className="mobile-card">
                    <div className="d-flex justify-content-between mb-2">
                        <div className="fw-bold">{item.customer}</div>
                        <div>{renderStars(item.rating)}</div>
                    </div>
                    <div className="small text-white-50 mb-2">{item.targetName}</div>
                    <div className="fst-italic border-start border-3 border-warning ps-2 mb-3">"{item.comment}"</div>
                    {item.reply && <div className="reply-box mb-3 small"><strong>Phản hồi:</strong> {item.reply}</div>}
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                        <small className="text-white-50">{item.date || new Date(item.created_at).toLocaleDateString('vi-VN')}</small>
                        <div>
                            <CButton size="sm" color="success" variant="outline" className="me-2" onClick={() => openReplyModal(item)}>Trả lời</CButton>
                            <CButton size="sm" color="danger" variant="outline" onClick={() => openReportModal(item)}>Báo cáo</CButton>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </CCardBody>
      </CCard>

      {/* --- MODAL PHẢN HỒI --- */}
      <CModal visible={replyModal} onClose={() => setReplyModal(false)} alignment="center">
        <div className="modal-green-content rounded">
            <CModalHeader><CModalTitle>Phản Hồi Đánh Giá</CModalTitle></CModalHeader>
            <CModalBody>
                {currentReview && (
                    <>
                        <div className="mb-3"><label className="small text-white-50">Khách viết:</label> <div className="p-2 bg-dark rounded">"{currentReview.comment}"</div></div>
                        <CFormLabel>Câu trả lời của bạn:</CFormLabel>
                        <CFormTextarea rows={4} className="form-control-green" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Nhập nội dung phản hồi..."/>
                    </>
                )}
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setReplyModal(false)}>Đóng</CButton>
                <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={handleSaveReply}>Gửi Phản Hồi</CButton>
            </CModalFooter>
        </div>
      </CModal>

      {/* --- MODAL BÁO CÁO --- */}
      <CModal visible={reportModal} onClose={() => setReportModal(false)} alignment="center">
        <div className="modal-green-content rounded">
            <CModalHeader><CModalTitle className="text-danger"><CIcon icon={cilWarning} className="me-2"/>Báo Cáo</CModalTitle></CModalHeader>
            <CModalBody>
                <p>Báo cáo đánh giá của <strong>{currentReview?.customer}</strong>?</p>
                <CFormLabel>Lý do:</CFormLabel>
                <CFormSelect className="form-select-green" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                    <option value="">-- Chọn lý do --</option>
                    <option value="spam">Spam / Quảng cáo</option>
                    <option value="rude">Ngôn từ thô tục</option>
                    <option value="fake">Đánh giá sai sự thật</option>
                </CFormSelect>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setReportModal(false)}>Hủy</CButton>
                <CButton color="danger" onClick={handleConfirmReport}>Gửi Báo Cáo</CButton>
            </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default Reviews;