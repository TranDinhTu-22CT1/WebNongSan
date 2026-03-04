import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton,
  CFormInput, CFormTextarea, CFormLabel, CSpinner, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil, cilSave, cilUser, cilEnvelopeClosed, cilPhone,
  cilLocationPin, cilBuilding, cilCheckCircle, cilCloudUpload, 
  cilX, cilWarning, cilWallet, cilLink
} from '@coreui/icons'

// Cấu hình API
const API_BASE_URL = 'http://localhost/nongsan-api';

const VendorProfile = () => {
  const [vendor, setVendor] = useState({
    id: '', shopName: '', ownerName: '', email: '', phone: '',
    address: '', description: '', avatar: '', joinDate: '',
    isApproved: false, momoPartnerCode: '', momoLinkedAt: null
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState('https://via.placeholder.com/150')
  const [selectedFile, setSelectedFile] = useState(null)
  const [backupData, setBackupData] = useState(null)

  const [zalopayModalVisible, setZalopayModalVisible] = useState(false)
  const [zalopayInputCode, setZalopayInputCode] = useState('')

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
        const userStorage = JSON.parse(localStorage.getItem('user'));
        if (!userStorage) return;

        const res = await fetch(`${API_BASE_URL}/get_profile.php?id=${userStorage.id}`);
        const data = await res.json();

        if (data.status === 'success') {
            const u = data.data;
            setVendor({
                id: u.id,
                shopName: u.shop_name || '',
                ownerName: u.name || '',
                email: u.email || '',
                phone: u.phone || '',
                address: u.address || '',
                description: u.description || '',
                avatar: u.avatar || '',
                joinDate: u.created_at || '',
                isApproved: u.is_approved == 1,
                momoPartnerCode: u.momo_partner_code || '',
                momoLinkedAt: u.momo_linked_at || null
            });
            if (u.avatar) setPreviewAvatar(u.avatar);
        }
    } catch (error) {
        console.error("Lỗi tải profile:", error);
    } finally {
        setLoading(false);
    }
  }

  const handleLinkZaloPay = async () => {
    if (!zalopayInputCode) return alert('Vui lòng nhập số điện thoại ZaloPay');
    try {
        const res = await fetch(`${API_BASE_URL}/link_momo.php`, { // Giữ nguyên endpoint cũ nếu bạn chưa đổi tên file PHP
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: vendor.id, momo_partner_code: zalopayInputCode })
        });
        const result = await res.json();
        if (result.status === 'success') {
            alert('Liên kết ví ZaloPay thành công!');
            setZalopayModalVisible(false);
            fetchProfile(); 
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) { alert('Lỗi kết nối server'); }
  }

  const handleEditMode = () => { setBackupData({ ...vendor }); setIsEditing(true); }
  const handleCancel = () => { 
    setVendor(backupData); 
    setPreviewAvatar(backupData.avatar || 'https://via.placeholder.com/150'); 
    setSelectedFile(null); 
    setIsEditing(false); 
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setVendor({ ...vendor, [name]: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreviewAvatar(URL.createObjectURL(file))
      setSelectedFile(file)
    }
  }

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('id', vendor.id);
    formData.append('name', vendor.ownerName);
    formData.append('shop_name', vendor.shopName);
    formData.append('phone', vendor.phone);
    formData.append('address', vendor.address);
    formData.append('description', vendor.description);
    if (selectedFile) formData.append('avatar', selectedFile);

    try {
        const res = await fetch(`${API_BASE_URL}/update_profile.php`, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.status === 'success') {
            alert('Cập nhật hồ sơ thành công!');
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { 
                ...currentUser, 
                name: vendor.ownerName, 
                avatar: result.new_avatar || vendor.avatar 
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsEditing(false);
            fetchProfile(); 
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) { alert('Lỗi kết nối server'); }
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="success"/></div>;

  return (
    <div className="profile-page-container">
      <style>{`
        .card-green-theme { background-color: #2F5233; color: #ffffff; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .form-control-green { background-color: #1E3923; border: 1px solid #558b6e; color: #fff; }
        .form-control-green:focus { border-color: #95d5b2; color: #fff; box-shadow: none; background-color: #1E3923; }
        .form-control-green:disabled { background-color: transparent; border: none; border-bottom: 1px solid #558b6e; opacity: 1; border-radius: 0; color: #fff; }
        .section-title { color: #ffd166; font-weight: 700; margin-bottom: 20px; border-bottom: 1px solid #558b6e; padding-bottom: 10px; }
        .label-custom { color: #b7e4c7; font-weight: 500; font-size: 0.9rem; }
        
        /* FIX AVATAR TRONG TRANG PROFILE KHÔNG LÀM ẢNH HƯỞNG HEADER */
        .avatar-main-img { 
            width: 160px !important; 
            height: 160px !important; 
            object-fit: cover !important; 
            border-radius: 50% !important; 
            border: 4px solid #52b788 !important; 
            display: block; 
            margin: 0 auto; 
        }

        .zalopay-integration-box { background: rgba(0, 104, 255, 0.1); border: 1px solid #0068ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
        .modal-zalopay-theme { background-color: #1E3923; color: #fff; border: 1px solid #0068ff; }
        .btn-zalopay { background-color: #0068ff; color: white; border: none; font-weight: bold; }
        .btn-zalopay:hover { background-color: #0056d2; color: white; }
      `}</style>

      <CRow>
        <CCol xs={12} md={5} lg={4} xl={3} className="mb-4">
          <CCard className="card-green-theme h-100">
            <CCardBody className="text-center d-flex flex-column align-items-center py-5">
              <div className="position-relative mb-4">
                <img src={previewAvatar} alt="Avatar" className="avatar-main-img" />
                {isEditing && (
                  <label htmlFor="avatar-upload" style={{position:'absolute', bottom:10, right:10, backgroundColor:'#ffd166', padding:8, borderRadius:'50%', cursor:'pointer', color:'#1E3923', zIndex: 10}}>
                    <CIcon icon={cilCloudUpload} />
                    <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleImageChange}/>
                  </label>
                )}
              </div>
              <h3 className="fw-bold mb-1">{vendor.ownerName}</h3>
              <p className="opacity-75 mb-3">{vendor.shopName || "Chưa đặt tên shop"}</p>
              <CBadge color={vendor.isApproved ? 'success' : 'warning'} className="mb-4 p-2">
                 {vendor.isApproved ? 'ĐÃ XÁC MINH' : 'CHỜ DUYỆT'}
              </CBadge>

              <div className="w-100 px-3 text-start small border-top border-secondary pt-3">
                <div className="label-custom mb-1">Thanh toán ZaloPay:</div>
                {vendor.momoPartnerCode ? (
                  <div className="text-info d-flex align-items-center fw-bold">
                    <CIcon icon={cilCheckCircle} className="me-2" /> Đã liên kết
                  </div>
                ) : (
                  <div className="text-warning d-flex align-items-center">
                    <CIcon icon={cilWarning} className="me-2" /> Chưa liên kết
                  </div>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={7} lg={8} xl={9} className="mb-4">
          <CCard className="card-green-theme h-100">
            <CCardHeader className="d-flex justify-content-between align-items-center border-bottom border-secondary pt-3 pb-3">
              <h5 className="mb-0 fw-bold"><CIcon icon={cilUser} className="me-2 text-warning"/> Hồ Sơ Vendor</h5>
              <div className="d-flex gap-2">
                {!isEditing ? (
                  <CButton color="warning" className="fw-bold" onClick={handleEditMode}><CIcon icon={cilPencil} className="me-2" /> Sửa Hồ Sơ</CButton>
                ) : (
                  <>
                    <CButton color="secondary" onClick={handleCancel}><CIcon icon={cilX} /> Hủy</CButton>
                    <CButton color="success" className="text-white" onClick={handleSave}><CIcon icon={cilSave} /> Lưu Lại</CButton>
                  </>
                )}
              </div>
            </CCardHeader>

            <CCardBody className="p-4">
              <div className="section-title"><CIcon icon={cilWallet} className="me-2"/>Thanh Toán</div>
              <div className="zalopay-integration-box">
                <CRow className="align-items-center">
                  <CCol xs={12} md={8}>
                    <div className="d-flex align-items-center mb-2">
                      <img src="./Logo FA-13.png" width="35" height="35" alt="ZaloPay" className="me-3" style={{borderRadius: '8px'}} />
                      <h6 className="mb-0 fw-bold">Ví Điện Tử ZaloPay</h6>
                    </div>
                    <p className="mb-0 small text-white-50">
                      {vendor.momoPartnerCode ? `Tài khoản: ${vendor.momoPartnerCode}` : 'Liên kết ZaloPay để nhận thanh toán doanh thu tự động.'}
                    </p>
                  </CCol>
                  <CCol xs={12} md={4} className="text-md-end mt-3 mt-md-0">
                    <CButton className="btn-zalopay text-white fw-bold" onClick={() => setZalopayModalVisible(true)}>
                      <CIcon icon={vendor.momoPartnerCode ? cilPencil : cilLink} className="me-2" />
                      {vendor.momoPartnerCode ? 'Đổi Ví' : 'Liên Kết'}
                    </CButton>
                  </CCol>
                </CRow>
              </div>

              <div className="section-title"><CIcon icon={cilBuilding} className="me-2"/>Thông Tin Chung</div>
              <CRow className="mb-4">
                <CCol md={6} className="mb-3">
                  <CFormLabel className="label-custom">Tên Cửa Hàng</CFormLabel>
                  <CFormInput name="shopName" value={vendor.shopName} onChange={handleChange} disabled={!isEditing} className="form-control-green" />
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel className="label-custom">Chủ Sở Hữu</CFormLabel>
                  <CFormInput name="ownerName" value={vendor.ownerName} onChange={handleChange} disabled={!isEditing} className="form-control-green" />
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel className="label-custom">Số Điện Thoại</CFormLabel>
                  <CFormInput name="phone" value={vendor.phone} onChange={handleChange} disabled={!isEditing} className="form-control-green" />
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel className="label-custom">Email</CFormLabel>
                  <CFormInput value={vendor.email} disabled className="form-control-green" />
                </CCol>
                <CCol xs={12} className="mb-3">
                  <CFormLabel className="label-custom">Địa Chỉ</CFormLabel>
                  <CFormInput name="address" value={vendor.address} onChange={handleChange} disabled={!isEditing} className="form-control-green" />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel className="label-custom">Giới Thiệu</CFormLabel>
                  <CFormTextarea name="description" rows={3} value={vendor.description} onChange={handleChange} disabled={!isEditing} className="form-control-green" />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={zalopayModalVisible} onClose={() => setZalopayModalVisible(false)} alignment="center">
        <div className="modal-zalopay-theme">
          <CModalHeader><CModalTitle>Liên Kết ZaloPay</CModalTitle></CModalHeader>
          <CModalBody>
            <div className="text-center mb-4"><img src="https://img.mservice.io/momo-payment/240404101918_62855100.png" width="60" alt="ZaloPay" style={{borderRadius: '12px'}} /></div>
            <div className="mb-3">
              <CFormLabel>Số điện thoại ZaloPay</CFormLabel>
              <CFormInput className="form-control-green" placeholder="0xxx" value={zalopayInputCode} onChange={(e) => setZalopayInputCode(e.target.value)} />
            </div>
            <CAlert color="info" className="small">Vui lòng nhập đúng số điện thoại đã đăng ký ZaloPay để nhận tiền doanh thu hàng tuần.</CAlert>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setZalopayModalVisible(false)}>Đóng</CButton>
            <CButton className="btn-zalopay" onClick={handleLinkZaloPay}>Xác Nhận</CButton>
          </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default VendorProfile