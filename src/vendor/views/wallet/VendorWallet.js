import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell,
  CBadge, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormInput, CFormLabel, CSpinner, CWidgetStatsF
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWallet, cilHistory, cilMoney, cilCheckCircle, cilBank, cilUser, cilCreditCard } from '@coreui/icons'

const API_BASE_URL = 'http://localhost/nongsan-api';

const VendorWallet = () => {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({ balance: 0, total_withdrawn: 0 });
  const [history, setHistory] = useState([]);
  const [modalWithdraw, setModalWithdraw] = useState(false);
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '', bankName: '', accountNumber: '', accountHolder: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => { 
    if (user?.id) fetchWalletAndSync();
  }, []);

  const fetchWalletAndSync = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/get_wallet.php?vendor_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWallet(data.wallet);
        setHistory(data.history);
      }
    } catch (err) { 
      console.error("Lỗi đồng bộ ví:", err);
    } finally { 
      setLoading(false); 
    }
  }

  const handleWithdraw = async () => {
    const amountNum = parseFloat(withdrawForm.amount);
    if (!amountNum || amountNum <= 0 || amountNum > wallet.balance) {
      return alert("Số tiền rút không hợp lệ hoặc vượt quá số dư!");
    }
    if (!withdrawForm.bankName || !withdrawForm.accountNumber || !withdrawForm.accountHolder) {
      return alert("Vui lòng điền đầy đủ thông tin ngân hàng!");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/request_withdrawal.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          vendor_id: user.id, 
          amount: amountNum,
          bank_name: withdrawForm.bankName,
          account_number: withdrawForm.accountNumber,
          account_holder: withdrawForm.accountHolder
        })
      });

      if (!res.ok) throw new Error(`Mã lỗi Server: ${res.status}`);

      const data = await res.json();
      if (data.status === 'success') {
        alert("Gửi yêu cầu rút tiền thành công!");
        setModalWithdraw(false);
        setWithdrawForm({ amount: '', bankName: '', accountNumber: '', accountHolder: '' });
        fetchWalletAndSync();
      } else {
        alert("Server thông báo: " + data.message);
      }
    } catch (err) {
      alert(`Lỗi kết nối máy chủ: ${err.message}`);
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) return <div className="text-center py-5"><CSpinner color="success" /></div>;

  return (
    <div className="wallet-container">
      <style>{`
        .card-green-theme { background-color: #2F5233; color: #ffffff; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .text-price { color: #ffd166; font-weight: bold; }
        .form-control-green { background-color: #1E3923; border: 1px solid #558b6e; color: #fff; }
        .table-green { --cui-table-color: #fff; --cui-table-border-color: #558b6e; }
        .text-uppercase-custom { text-transform: uppercase; font-size: 0.85rem; font-weight: 600; color: #b7e4c7; }
      `}</style>

      {/* THỐNG KÊ */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CWidgetStatsF className="card-green-theme mb-3" icon={<CIcon icon={cilWallet} height={24} />} title="SỐ DƯ KHẢ DỤNG" value={formatCurrency(wallet.balance)} color="success" />
        </CCol>
        <CCol md={6}>
          <CWidgetStatsF className="card-green-theme mb-3" icon={<CIcon icon={cilCheckCircle} height={24} />} title="TỔNG TIỀN ĐÃ RÚT" value={formatCurrency(wallet.total_withdrawn)} color="info" />
        </CCol>
      </CRow>

      {/* BẢNG LỊCH SỬ - ĐÃ FIX LỖI DOUBLE CỘT SỐ TÀI KHOẢN */}
      <CCard className="card-green-theme">
        <CCardHeader className="d-flex justify-content-between align-items-center border-secondary">
          <h5 className="mb-0 fw-bold"><CIcon icon={cilHistory} className="me-2" />Lịch sử yêu cầu rút tiền</h5>
          <CButton color="warning" className="fw-bold" onClick={() => setModalWithdraw(true)}>
            <CIcon icon={cilMoney} className="me-1" /> Rút Tiền Ngay
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive className="table-green mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Ngày</CTableHeaderCell>
                <CTableHeaderCell>Số Tiền</CTableHeaderCell>
                <CTableHeaderCell>Ngân Hàng</CTableHeaderCell>
                <CTableHeaderCell>Số Tài Khoản</CTableHeaderCell>
                <CTableHeaderCell>Chủ Tài Khoản</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {history.length > 0 ? history.map((item, idx) => (
                <CTableRow key={idx}>
                  <CTableDataCell>{new Date(item.created_at).toLocaleDateString('vi-VN')}</CTableDataCell>
                  <CTableDataCell className="text-price">{formatCurrency(item.amount)}</CTableDataCell>
                  <CTableDataCell>{item.bank_name}</CTableDataCell>
                  <CTableDataCell className="fw-bold text-info">{item.account_number}</CTableDataCell>
                  <CTableDataCell className="text-uppercase-custom">{item.account_holder}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge color={item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : 'danger'} shape="rounded-pill">
                      {item.status === 'approved' ? 'Thành công' : item.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              )) : (
                <CTableRow><CTableDataCell colSpan="6" className="text-center py-3 text-white-50">Chưa có lịch sử giao dịch</CTableDataCell></CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* MODAL RÚT TIỀN */}
      <CModal visible={modalWithdraw} onClose={() => setModalWithdraw(false)} alignment="center">
        <div style={{ backgroundColor: '#2F5233', color: '#fff' }} className="rounded">
          <CModalHeader className="border-secondary"><CModalTitle>Tạo lệnh rút tiền</CModalTitle></CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Số tiền rút (Tối đa: {formatCurrency(wallet.balance)})</CFormLabel>
              <CFormInput className="form-control-green" type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} />
            </div>
            <div className="mb-3">
              <CFormLabel><CIcon icon={cilBank} size="sm" className="me-1"/> Tên ngân hàng</CFormLabel>
              <CFormInput className="form-control-green" placeholder="Ví dụ: Vietcombank, MB..." value={withdrawForm.bankName} onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} />
            </div>
            <div className="mb-3">
              <CFormLabel><CIcon icon={cilCreditCard} size="sm" className="me-1"/> Số tài khoản</CFormLabel>
              <CFormInput className="form-control-green" placeholder="Nhập số tài khoản" value={withdrawForm.accountNumber} onChange={e => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })} />
            </div>
            <div className="mb-3">
              <CFormLabel><CIcon icon={cilUser} size="sm" className="me-1"/> Chủ tài khoản (Viết hoa không dấu)</CFormLabel>
              <CFormInput className="form-control-green" placeholder="NGUYEN VAN A" value={withdrawForm.accountHolder} onChange={e => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value.toUpperCase() })} />
            </div>
          </CModalBody>
          <CModalFooter className="border-secondary">
            <CButton color="secondary" onClick={() => setModalWithdraw(false)}>Hủy</CButton>
            <CButton color="warning" className="fw-bold" onClick={handleWithdraw}>Gửi yêu cầu</CButton>
          </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default VendorWallet