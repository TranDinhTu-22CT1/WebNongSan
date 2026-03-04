import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableHead, CTableHeaderCell, CTableRow, CTableDataCell,
  CBadge, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CWidgetStatsA, CFormSelect, CFormInput, CFormLabel, CSpinner
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { 
  cilMoney, cilCart, cilGraph, cilList, cilStorage, cilPlus, cilSave, cilPrint, cilInfo
} from '@coreui/icons'

const API_BASE_URL = 'http://localhost/nongsan-api';

const Revenue = () => {
  // State Dữ liệu
  const [invoices, setInvoices] = useState([]); 
  const [stats, setStats] = useState({ net_revenue: 0, platform_fee: 0, pending_count: 0 }); // pending_count sẽ nhận từ PHP
  const [chartData, setChartData] = useState(new Array(12).fill(0)); 
  const [inventory, setInventory] = useState([]); 
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State UI
  const [detailModal, setDetailModal] = useState(false)
  const [inventoryModal, setInventoryModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [filterType, setFilterType] = useState('Tháng')
  
  // Form nhập hàng
  const [importData, setImportData] = useState({ productId: '', quantity: '' })

  // --- 1. LOAD DỮ LIỆU TỪ SERVER ---
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        setLoading(true);
        // Gọi API lấy dữ liệu thực tế
        const [revenueRes, inventoryRes, topProdRes] = await Promise.all([
            fetch(`${API_BASE_URL}/get_revenue.php?vendor_id=${user.id}&role=${user.role}`),
            fetch(`${API_BASE_URL}/get_inventory.php?vendor_id=${user.id}`),
            fetch(`${API_BASE_URL}/get_top_products.php?vendor_id=${user.id}`)
        ]);

        const revenueData = await revenueRes.json();
        const inventoryData = await inventoryRes.json();
        const topProdData = await topProdRes.json();

        if (revenueData.status === 'success') {
            setInvoices(revenueData.orders);
            // stats.pending_count bây giờ sẽ là con số thật từ DB
            setStats(revenueData.stats);
            if (revenueData.chart_data) setChartData(revenueData.chart_data);
        }
        if (inventoryData.status === 'success') setInventory(inventoryData.data);
        if (topProdData.status === 'success') setTopProducts(topProdData.data);

    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
    } finally {
        setLoading(false);
    }
  }

  // --- CÁC HÀM TIỆN ÍCH ---
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
  }

  const getStockStatus = (stock) => {
      const s = parseInt(stock);
      if (s === 0) return { label: 'Hết hàng', color: 'danger' };
      if (s <= 10) return { label: 'Sắp hết', color: 'warning' };
      return { label: 'Còn hàng', color: 'success' };
  }

  const handleExportReceipt = () => {
      if (!selectedInvoice) return;
      setTimeout(() => { window.print(); }, 500);
  }

  // --- 2. XỬ LÝ NHẬP HÀNG (GIỮ NGUYÊN CHỨC NĂNG) ---
  const handleImportStock = async () => {
      if (!importData.productId || !importData.quantity) {
          alert("Vui lòng chọn sản phẩm và nhập số lượng!");
          return;
      }
      const token = localStorage.getItem('token'); 
      try {
          const res = await fetch(`${API_BASE_URL}/update_stock.php`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                  product_id: importData.productId,
                  quantity_added: importData.quantity
              })
          });
          const result = await res.json();
          if (result.status === 'success') {
              alert('Nhập kho thành công!');
              setImportModal(false);
              setImportData({ productId: '', quantity: '' });
              fetchAllData(); 
          } else {
              alert('Lỗi: ' + result.message);
          }
      } catch (err) {
          alert('Lỗi kết nối server');
      }
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="success"/></div>;

  return (
    <div className="revenue-page-container">
      <style>{`
        .card-green-theme { background-color: #2F5233; color: #ffffff; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .modal-green-content { background-color: #2F5233; color: #ffffff; border: 1px solid #76c893; }
        .modal-header, .modal-footer { border-color: #558b6e; }
        .table-green-custom { --cui-table-color: #ffffff; --cui-table-bg: transparent; --cui-table-border-color: #558b6e; --cui-table-hover-bg: #3A6B35; }
        .table-green-custom thead th { background-color: #1E3923; color: #b7e4c7; font-weight: 700; border-bottom: 2px solid #558b6e; padding: 14px 16px; text-transform: uppercase; font-size: 0.85rem; }
        .table-green-custom td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #558b6e; }
        .text-price { color: #ffd166; font-weight: 700; font-size: 1rem; }
        .text-label { color: #95d5b2; font-size: 0.9rem; }
        .bg-gradient-success-dark { background: linear-gradient(45deg, #1E3923, #2F5233); color: white; border: 1px solid #558b6e; }
        .bg-gradient-warning-dark { background: linear-gradient(45deg, #5c4d00, #bfa004); color: white; border: 1px solid #ffd166; }
        .bg-gradient-info-dark { background: linear-gradient(45deg, #0d3b66, #118ab2); color: white; border: 1px solid #118ab2; }
        .form-select-green, .form-control-green { background-color: #1E3923; border: 1px solid #558b6e; color: #fff; }
        .form-select-green:focus, .form-control-green:focus { border-color: #ffd166; box-shadow: none; background-color: #1E3923; color: #fff; }
      `}</style>

      {/* --- PHẦN 1: WIDGET THỐNG KÊ (HIỂN THỊ CON SỐ THẬT) --- */}
      <CRow>
        <CCol xs={12} sm={6} lg={4}>
          <CWidgetStatsA className="mb-4 bg-gradient-success-dark" value={<>{formatCurrency(stats.net_revenue)}<span className="fs-6 fw-normal ms-2">(Thực nhận)</span></>} title="Doanh Thu Thực Nhận (Đã trừ 8%)" action={<CIcon icon={cilMoney} size="xl" className="text-white opacity-75"/>} />
        </CCol>
        <CCol xs={12} sm={6} lg={4}>
          <CWidgetStatsA className="mb-4 bg-gradient-info-dark" value={<>{formatCurrency(stats.platform_fee)}<span className="fs-6 fw-normal ms-2">(Tổng phí)</span></>} title="Phí Nền Tảng (8% tổng đơn)" action={<CIcon icon={cilGraph} size="xl" className="text-white opacity-75"/>} />
        </CCol>
        <CCol xs={12} sm={12} lg={4}>
          <CWidgetStatsA className="mb-4 bg-gradient-warning-dark" value={<>{stats.pending_count} Đơn<span className="fs-6 fw-normal ms-2 text-white">Cần xử lý</span></>} title="Đơn Hàng Chờ Thanh Toán" action={<CIcon icon={cilCart} size="xl" className="text-white opacity-75"/>} />
        </CCol>
      </CRow>

      {/* --- PHẦN 2: BIỂU ĐỒ & TOP SẢN PHẨM --- */}
      <CRow className="mb-4">
        <CCol xs={12} lg={8} className="mb-4 mb-lg-0">
          <CCard className="card-green-theme h-100">
            <CCardHeader className="border-bottom border-secondary pt-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0" style={{color: '#d8f3dc'}}>Biểu Đồ Tăng Trưởng Doanh Thu</h5>
              <div style={{width: '120px'}}><CFormSelect size="sm" className="form-select-green" value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="Ngày">Theo Ngày</option><option value="Tháng">Theo Tháng</option></CFormSelect></div>
            </CCardHeader>
            <CCardBody>
              <CChartLine 
                style={{ height: '300px' }} 
                data={{ 
                  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], 
                  datasets: [{ 
                    label: 'Thực nhận (VNĐ)', 
                    backgroundColor: 'rgba(255, 209, 102, 0.1)', 
                    borderColor: '#ffd166', 
                    pointBackgroundColor: '#fff', 
                    data: chartData, 
                    tension: 0.4 
                  }] 
                }} 
                options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#b7e4c7' }, grid: { color: '#558b6e' } }, y: { ticks: { color: '#b7e4c7' }, grid: { color: '#558b6e' } } } }} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={4}>
          <CCard className="card-green-theme h-100">
            <CCardHeader className="border-bottom border-secondary pt-3"><h5 className="fw-bold" style={{color: '#d8f3dc'}}>Top Sản Phẩm Bán Chạy</h5></CCardHeader>
            <CCardBody className="p-0 overflow-auto" style={{maxHeight: '340px'}}>
               <CTable hover className="table-green-custom mb-0">
                   <CTableHead><CTableRow><CTableHeaderCell>Sản Phẩm</CTableHeaderCell><CTableHeaderCell className="text-end">Doanh Thu</CTableHeaderCell></CTableRow></CTableHead>
                   <CTableBody>
                       {topProducts.length > 0 ? topProducts.map((prod, idx) => (
                           <CTableRow key={idx}>
                               <CTableDataCell><div className="fw-semibold">{prod.name}</div><div className="small" style={{color: '#b7e4c7'}}>Đã bán: {prod.sold}</div></CTableDataCell>
                               <CTableDataCell className="text-end text-price">{formatCurrency(prod.revenue)}</CTableDataCell>
                           </CTableRow>
                       )) : (<CTableRow><CTableDataCell colSpan={2} className="text-center" style={{color: '#b7e4c7'}}>Chưa có dữ liệu</CTableDataCell></CTableRow>)}
                   </CTableBody>
               </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* --- PHẦN 3: DANH SÁCH ĐƠN HOÀN TẤT --- */}
      <CCard className="card-green-theme mb-4">
        <CCardHeader className="border-bottom border-secondary pt-3"><h5 className="fw-bold mb-0" style={{color: '#ffd166'}}><CIcon icon={cilCart} className="me-2"/>Danh Sách Đơn Hàng Hoàn Tất</h5></CCardHeader>
        <CCardBody>
          {invoices.length > 0 ? (
            <CTable hover responsive className="table-green-custom mb-0">
                <CTableHead><CTableRow><CTableHeaderCell>Mã HĐ</CTableHeaderCell><CTableHeaderCell>Ngày</CTableHeaderCell><CTableHeaderCell>Tổng Đơn</CTableHeaderCell><CTableHeaderCell>Phí Sàn</CTableHeaderCell><CTableHeaderCell>Thực Nhận</CTableHeaderCell><CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell><CTableHeaderCell className="text-end">Hành Động</CTableHeaderCell></CTableRow></CTableHead>
                <CTableBody>{invoices.map((item) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell className="fw-bold text-info">{item.id}</CTableDataCell>
                    <CTableDataCell>{item.date}</CTableDataCell>
                    <CTableDataCell>{formatCurrency(item.amount)}</CTableDataCell>
                    <CTableDataCell className="text-danger">-{item.feeRate}%</CTableDataCell>
                    <CTableDataCell className="text-price fw-bold">{formatCurrency(item.amount * (100 - item.feeRate) / 100)}</CTableDataCell>
                    <CTableDataCell className="text-center"><CBadge color="success" shape="rounded-pill">Hoàn tất</CBadge></CTableDataCell>
                    <CTableDataCell className="text-end"><CButton color="link" className="text-white p-0" onClick={() => { setSelectedInvoice(item); setDetailModal(true); }}><CIcon icon={cilInfo} /></CButton></CTableDataCell>
                  </CTableRow>
                ))}</CTableBody>
            </CTable>
          ) : (<div className="text-center py-4" style={{color: '#b7e4c7'}}>Chưa có đơn hàng hoàn thành.</div>)}
        </CCardBody>
      </CCard>

      {/* --- PHẦN 4: KIỂM TRA TỒN KHO --- */}
      <CCard className="card-green-theme mb-4">
        <CCardHeader className="border-bottom border-secondary pt-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0" style={{color: '#ffd166'}}><CIcon icon={cilStorage} className="me-2"/>Kiểm Tra Tồn Kho</h5>
            <CButton color="link" className="text-white text-decoration-none" onClick={() => setInventoryModal(true)}>Xem tất cả <CIcon icon={cilList} className="ms-1"/></CButton>
        </CCardHeader>
        <CCardBody>
            <CTable hover responsive className="table-green-custom mb-0">
                <CTableHead><CTableRow><CTableHeaderCell>ID</CTableHeaderCell><CTableHeaderCell>Sản Phẩm</CTableHeaderCell><CTableHeaderCell className="text-center">Tồn Kho</CTableHeaderCell><CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell></CTableRow></CTableHead>
                <CTableBody>
                    {inventory.slice(0, 5).map((item) => {
                        const statusInfo = getStockStatus(item.stock);
                        return (
                            <CTableRow key={item.id}>
                                <CTableDataCell>#{item.id}</CTableDataCell>
                                <CTableDataCell className="fw-semibold">{item.name}</CTableDataCell>
                                <CTableDataCell className="text-center"><span className={item.stock == 0 ? 'text-danger fw-bold' : item.stock < 10 ? 'text-warning fw-bold' : ''}>{item.stock}</span></CTableDataCell>
                                <CTableDataCell className="text-center"><CBadge color={statusInfo.color}>{statusInfo.label}</CBadge></CTableDataCell>
                            </CTableRow>
                        )
                    })}
                </CTableBody>
            </CTable>
        </CCardBody>
      </CCard>

      {/* MODAL KHO */}
      <CModal visible={inventoryModal} onClose={() => setInventoryModal(false)} size="lg" alignment="center">
        <div className="modal-green-content">
            <CModalHeader><CModalTitle>Danh Sách Kho Hàng</CModalTitle></CModalHeader>
            <CModalBody>
                <CTable hover responsive className="table-green-custom mb-0">
                    <CTableHead><CTableRow><CTableHeaderCell>ID</CTableHeaderCell><CTableHeaderCell>Sản Phẩm</CTableHeaderCell><CTableHeaderCell className="text-center">Tồn Kho</CTableHeaderCell><CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell></CTableRow></CTableHead>
                    <CTableBody>{inventory.map((item) => (
                        <CTableRow key={item.id}>
                            <CTableDataCell>#{item.id}</CTableDataCell>
                            <CTableDataCell className="fw-semibold">{item.name}</CTableDataCell>
                            <CTableDataCell className="text-center fw-bold">{item.stock}</CTableDataCell>
                            <CTableDataCell className="text-center"><CBadge color={getStockStatus(item.stock).color}>{getStockStatus(item.stock).label}</CBadge></CTableDataCell>
                        </CTableRow>
                    ))}</CTableBody>
                </CTable>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setInventoryModal(false)}>Đóng</CButton>
                <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={() => { setInventoryModal(false); setImportModal(true); }}><CIcon icon={cilPlus} className="me-2"/>Nhập Hàng</CButton>
            </CModalFooter>
        </div>
      </CModal>

      {/* MODAL NHẬP HÀNG */}
      <CModal visible={importModal} onClose={() => setImportModal(false)} alignment="center">
        <div className="modal-green-content">
            <CModalHeader><CModalTitle>Nhập Thêm Hàng Vào Kho</CModalTitle></CModalHeader>
            <CModalBody>
                <div className="mb-3">
                    <CFormLabel>Chọn Sản Phẩm</CFormLabel>
                    <CFormSelect className="form-select-green" value={importData.productId} onChange={(e) => setImportData({...importData, productId: e.target.value})}>
                        <option value="">-- Chọn sản phẩm --</option>
                        {inventory.map(item => (<option key={item.id} value={item.id}>{item.name} (Hiện có: {item.stock})</option>))}
                    </CFormSelect>
                </div>
                <div className="mb-3">
                    <CFormLabel>Số Lượng Nhập Thêm</CFormLabel>
                    <CFormInput type="number" className="form-control-green" placeholder="VD: 50" value={importData.quantity} onChange={(e) => setImportData({...importData, quantity: e.target.value})} />
                </div>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setImportModal(false)}>Hủy</CButton>
                <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={handleImportStock}><CIcon icon={cilSave} className="me-2"/>Cập Nhật Kho</CButton>
            </CModalFooter>
        </div>
      </CModal>

      {/* MODAL CHI TIẾT DÒNG TIỀN */}
      <CModal visible={detailModal} onClose={() => setDetailModal(false)} size="lg" alignment="center">
        <div className="modal-green-content">
          <CModalHeader><CModalTitle>Chi Tiết Dòng Tiền Đơn {selectedInvoice?.id}</CModalTitle></CModalHeader>
          <CModalBody>
            {selectedInvoice && (
              <CRow>
                <CCol md={12} className="mb-4">
                  <div className="p-3 rounded" style={{backgroundColor: '#1E3923', border: '1px solid #558b6e'}}>
                    <div className="d-flex justify-content-between mb-2"><span className="text-label">Khách hàng:</span><span className="fw-bold">{selectedInvoice.customer}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-label">Ngày hoàn tất:</span><span>{selectedInvoice.date}</span></div>
                    <div className="d-flex justify-content-between"><span className="text-label">Trạng thái:</span><CBadge color="success">Đã hoàn thành</CBadge></div>
                  </div>
                </CCol>
                <CCol md={12}>
                    <h6 className="fw-bold text-warning mb-3">Phân Tích Dòng Tiền (Phí 8%)</h6>
                    <div className="p-3 rounded border border-secondary">
                        <div className="d-flex justify-content-between mb-2"><span>Giá trị đơn hàng:</span><span className="fw-bold">{formatCurrency(selectedInvoice.amount)}</span></div>
                        <div className="d-flex justify-content-between mb-2 text-danger"><span>Khấu trừ phí sàn (8%):</span><span>- {formatCurrency(selectedInvoice.amount * 0.08)}</span></div>
                        <hr className="border-secondary my-2"/>
                        <div className="d-flex justify-content-between align-items-center"><span className="fw-bold fs-5 text-success">VỀ VÍ VENDOR:</span><span className="fw-bold fs-4 text-price">{formatCurrency(selectedInvoice.amount * 0.92)}</span></div>
                    </div>
                </CCol>
              </CRow>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDetailModal(false)}>Đóng</CButton>
            <CButton style={{backgroundColor: '#52b788', border: 'none'}} onClick={handleExportReceipt}><CIcon icon={cilPrint} className="me-2"/>In Phiếu Thu</CButton>
          </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default Revenue