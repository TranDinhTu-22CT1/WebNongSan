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
import { API_BASE as API_BASE_URL } from 'src/config';

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
        if (topProdData.status === 'success') {
          setTopProducts(Array.isArray(topProdData.data) ? topProdData.data : []);
        } else {
          console.error('Lỗi tải top sản phẩm:', topProdData.message);
          setTopProducts([]);
        }

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

  if (loading) return <div className="text-center py-5"><CSpinner color="primary"/></div>;

  return (
    <div className="revenue-page-container">
      <style>{`
        .card-theme { background-color: #ffffff; color: #5a5c69; border: 1px solid #e3e6f0; box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15); border-radius: 0.35rem; }
        .modal-theme-content { background-color: #ffffff; color: #5a5c69; border: none; border-radius: 0.3rem; }
        .modal-header, .modal-footer { border-color: #e3e6f0; }
        .table-theme-custom { --cui-table-color: #5a5c69; --cui-table-bg: transparent; --cui-table-border-color: #e3e6f0; --cui-table-hover-bg: #f8f9fc; }
        .table-theme-custom thead th { background-color: #f8f9fc; color: #3a3b45; font-weight: 700; border-bottom: 2px solid #e3e6f0; padding: 14px 16px; text-transform: uppercase; font-size: 0.85rem; }
        .table-theme-custom td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #e3e6f0; }
        .text-price { color: #1cc88a; font-weight: 700; font-size: 1rem; }
        .text-label { color: #858796; font-size: 0.9rem; }
        .bg-widget-primary { background-color: #fff; color: #5a5c69; border-left: 4px solid #4e73df; box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15); }
        .bg-widget-info { background-color: #fff; color: #5a5c69; border-left: 4px solid #36b9cc; box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15); }
        .bg-widget-warning { background-color: #fff; color: #5a5c69; border-left: 4px solid #f6c23e; box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15); }
        .form-select-theme, .form-control-theme { background-color: #fff; border: 1px solid #d1d3e2; color: #6e707e; border-radius: 0.35rem; }
        .form-select-theme:focus, .form-control-theme:focus { border-color: #bac8f3; box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25); outline: none; }
      `}</style>

      {/* --- PHẦN 1: WIDGET THỐNG KÊ (HIỂN THỊ CON SỐ THẬT) --- */}
      <CRow>
        <CCol xs={12} sm={6} lg={4}>
          <CWidgetStatsA 
            className="mb-4 bg-widget-primary" 
            value={<div className="fw-bold text-dark">{formatCurrency(stats.net_revenue)}<span className="fs-6 fw-normal ms-2 text-muted">(Thực nhận)</span></div>} 
            title={<div className="fw-bold text-primary text-uppercase mb-2" style={{fontSize: '0.8rem'}}>Doanh Thu Thực Nhận (Đã trừ 8%)</div>} 
            action={<CIcon icon={cilMoney} size="xl" className="text-muted opacity-50"/>} 
          />
        </CCol>
        <CCol xs={12} sm={6} lg={4}>
          <CWidgetStatsA 
            className="mb-4 bg-widget-info" 
            value={<div className="fw-bold text-dark">{formatCurrency(stats.platform_fee)}<span className="fs-6 fw-normal ms-2 text-muted">(Tổng phí)</span></div>} 
            title={<div className="fw-bold text-info text-uppercase mb-2" style={{fontSize: '0.8rem'}}>Phí Nền Tảng (8% tổng đơn)</div>} 
            action={<CIcon icon={cilGraph} size="xl" className="text-muted opacity-50"/>} 
          />
        </CCol>
        <CCol xs={12} sm={12} lg={4}>
          <CWidgetStatsA 
            className="mb-4 bg-widget-warning" 
            value={<div className="fw-bold text-dark">{stats.pending_count} Đơn<span className="fs-6 fw-normal ms-2 text-muted">Cần xử lý</span></div>} 
            title={<div className="fw-bold text-warning text-uppercase mb-2" style={{fontSize: '0.8rem'}}>Đơn Hàng Chờ Thanh Toán</div>} 
            action={<CIcon icon={cilCart} size="xl" className="text-muted opacity-50"/>} 
          />
        </CCol>
      </CRow>

      {/* --- PHẦN 2: BIỂU ĐỒ & TOP SẢN PHẨM --- */}
      <CRow className="mb-4">
        <CCol xs={12} lg={8} className="mb-4 mb-lg-0">
          <CCard className="card-theme h-100">
            <CCardHeader className="border-bottom pt-3 d-flex justify-content-between align-items-center bg-white">
              <h5 className="fw-bold mb-0 text-primary">Biểu Đồ Tăng Trưởng Doanh Thu</h5>
              <div style={{width: '120px'}}>
                <CFormSelect size="sm" className="form-select-theme" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="Ngày">Theo Ngày</option>
                  <option value="Tháng">Theo Tháng</option>
                </CFormSelect>
              </div>
            </CCardHeader>
            <CCardBody>
              <CChartLine 
                style={{ height: '300px' }} 
                data={{ 
                  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], 
                  datasets: [{ 
                    label: 'Thực nhận (VNĐ)', 
                    backgroundColor: 'rgba(78, 115, 223, 0.1)', 
                    borderColor: '#4e73df', 
                    pointBackgroundColor: '#4e73df', 
                    data: chartData, 
                    tension: 0.4,
                    fill: true
                  }] 
                }} 
                options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#5a5c69' } } }, scales: { x: { ticks: { color: '#858796' }, grid: { color: '#eaecf0' } }, y: { ticks: { color: '#858796' }, grid: { color: '#eaecf0' } } } }} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={4}>
          <CCard className="card-theme h-100">
            <CCardHeader className="border-bottom pt-3 bg-white">
              <h5 className="fw-bold mb-0 text-primary">Top Sản Phẩm Bán Chạy</h5>
            </CCardHeader>
            <CCardBody className="p-0 overflow-auto" style={{maxHeight: '340px'}}>
               <CTable hover className="table-theme-custom mb-0">
                   <CTableHead><CTableRow><CTableHeaderCell>Sản Phẩm</CTableHeaderCell><CTableHeaderCell className="text-end">Doanh Thu</CTableHeaderCell></CTableRow></CTableHead>
                   <CTableBody>
                       {topProducts.length > 0 ? topProducts.map((prod, idx) => (
                           <CTableRow key={idx}>
                               <CTableDataCell>
                                  <div className="fw-semibold text-dark">{prod.name}</div>
                                  <div className="small text-muted">Đã bán: {prod.sold}</div>
                               </CTableDataCell>
                               <CTableDataCell className="text-end text-price">{formatCurrency(prod.revenue)}</CTableDataCell>
                           </CTableRow>
                       )) : (<CTableRow><CTableDataCell colSpan={2} className="text-center text-muted py-4">Chưa có dữ liệu</CTableDataCell></CTableRow>)}
                   </CTableBody>
               </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* --- PHẦN 3: DANH SÁCH ĐƠN HOÀN TẤT --- */}
      <CCard className="card-theme mb-4">
        <CCardHeader className="border-bottom pt-3 bg-white">
          <h5 className="fw-bold mb-0 text-primary"><CIcon icon={cilCart} className="me-2"/>Danh Sách Đơn Hàng Hoàn Tất</h5>
        </CCardHeader>
        <CCardBody>
          {invoices.length > 0 ? (
            <CTable hover responsive className="table-theme-custom mb-0">
                <CTableHead><CTableRow><CTableHeaderCell>Mã HĐ</CTableHeaderCell><CTableHeaderCell>Ngày</CTableHeaderCell><CTableHeaderCell>Tổng Đơn</CTableHeaderCell><CTableHeaderCell>Phí Sàn</CTableHeaderCell><CTableHeaderCell>Thực Nhận</CTableHeaderCell><CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell><CTableHeaderCell className="text-end">Hành Động</CTableHeaderCell></CTableRow></CTableHead>
                <CTableBody>{invoices.map((item) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell className="fw-bold text-primary">{item.id}</CTableDataCell>
                    <CTableDataCell className="text-dark">{item.date}</CTableDataCell>
                    <CTableDataCell className="text-dark fw-semibold">{formatCurrency(item.amount)}</CTableDataCell>
                    <CTableDataCell className="text-danger">-{item.feeRate}%</CTableDataCell>
                    <CTableDataCell className="text-price fw-bold">{formatCurrency(item.amount * (100 - item.feeRate) / 100)}</CTableDataCell>
                    <CTableDataCell className="text-center"><CBadge color="success" shape="rounded-pill">Hoàn tất</CBadge></CTableDataCell>
                    <CTableDataCell className="text-end"><CButton color="link" className="text-secondary p-0" onClick={() => { setSelectedInvoice(item); setDetailModal(true); }}><CIcon icon={cilInfo} /></CButton></CTableDataCell>
                  </CTableRow>
                ))}</CTableBody>
            </CTable>
          ) : (<div className="text-center py-4 text-muted">Chưa có đơn hàng hoàn thành.</div>)}
        </CCardBody>
      </CCard>

      {/* --- PHẦN 4: KIỂM TRA TỒN KHO --- */}
      <CCard className="card-theme mb-4">
        <CCardHeader className="border-bottom pt-3 d-flex justify-content-between align-items-center bg-white">
            <h5 className="fw-bold mb-0 text-primary"><CIcon icon={cilStorage} className="me-2"/>Kiểm Tra Tồn Kho</h5>
            <CButton color="link" className="text-primary text-decoration-none fw-bold" onClick={() => setInventoryModal(true)}>Xem tất cả <CIcon icon={cilList} className="ms-1"/></CButton>
        </CCardHeader>
        <CCardBody>
            <CTable hover responsive className="table-theme-custom mb-0">
                <CTableHead><CTableRow><CTableHeaderCell>ID</CTableHeaderCell><CTableHeaderCell>Sản Phẩm</CTableHeaderCell><CTableHeaderCell className="text-center">Tồn Kho</CTableHeaderCell><CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell></CTableRow></CTableHead>
                <CTableBody>
                    {inventory.slice(0, 5).map((item) => {
                        const statusInfo = getStockStatus(item.stock);
                        return (
                            <CTableRow key={item.id}>
                                <CTableDataCell className="text-muted">#{item.id}</CTableDataCell>
                                <CTableDataCell className="fw-semibold text-dark">{item.name}</CTableDataCell>
                                <CTableDataCell className="text-center"><span className={item.stock == 0 ? 'text-danger fw-bold' : item.stock < 10 ? 'text-warning fw-bold' : 'text-dark fw-bold'}>{item.stock}</span></CTableDataCell>
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
        <div className="modal-theme-content">
            <CModalHeader><CModalTitle className="fw-bold text-dark">Danh Sách Kho Hàng</CModalTitle></CModalHeader>
            <CModalBody>
                <CTable hover responsive className="table-theme-custom mb-0">
                    <CTableHead><CTableRow><CTableHeaderCell>ID</CTableHeaderCell><CTableHeaderCell>Sản Phẩm</CTableHeaderCell><CTableHeaderCell className="text-center">Tồn Kho</CTableHeaderCell><CTableHeaderCell className="text-center">Trạng Thái</CTableHeaderCell></CTableRow></CTableHead>
                    <CTableBody>{inventory.map((item) => (
                        <CTableRow key={item.id}>
                            <CTableDataCell className="text-muted">#{item.id}</CTableDataCell>
                            <CTableDataCell className="fw-semibold text-dark">{item.name}</CTableDataCell>
                            <CTableDataCell className="text-center fw-bold text-dark">{item.stock}</CTableDataCell>
                            <CTableDataCell className="text-center"><CBadge color={getStockStatus(item.stock).color}>{getStockStatus(item.stock).label}</CBadge></CTableDataCell>
                        </CTableRow>
                    ))}</CTableBody>
                </CTable>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setInventoryModal(false)}>Đóng</CButton>
                <CButton color="primary" onClick={() => { setInventoryModal(false); setImportModal(true); }}><CIcon icon={cilPlus} className="me-2"/>Nhập Hàng</CButton>
            </CModalFooter>
        </div>
      </CModal>

      {/* MODAL NHẬP HÀNG */}
      <CModal visible={importModal} onClose={() => setImportModal(false)} alignment="center">
        <div className="modal-theme-content">
            <CModalHeader><CModalTitle className="fw-bold text-dark">Nhập Thêm Hàng Vào Kho</CModalTitle></CModalHeader>
            <CModalBody>
                <div className="mb-3">
                    <CFormLabel className="text-dark fw-semibold">Chọn Sản Phẩm</CFormLabel>
                    <CFormSelect className="form-select-theme" value={importData.productId} onChange={(e) => setImportData({...importData, productId: e.target.value})}>
                        <option value="">-- Chọn sản phẩm --</option>
                        {inventory.map(item => (<option key={item.id} value={item.id}>{item.name} (Hiện có: {item.stock})</option>))}
                    </CFormSelect>
                </div>
                <div className="mb-3">
                    <CFormLabel className="text-dark fw-semibold">Số Lượng Nhập Thêm</CFormLabel>
                    <CFormInput type="number" className="form-control-theme" placeholder="VD: 50" value={importData.quantity} onChange={(e) => setImportData({...importData, quantity: e.target.value})} />
                </div>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setImportModal(false)}>Hủy</CButton>
                <CButton color="primary" onClick={handleImportStock}><CIcon icon={cilSave} className="me-2"/>Cập Nhật Kho</CButton>
            </CModalFooter>
        </div>
      </CModal>

      {/* MODAL CHI TIẾT DÒNG TIỀN */}
      <CModal visible={detailModal} onClose={() => setDetailModal(false)} size="lg" alignment="center">
        <div className="modal-theme-content">
          <CModalHeader><CModalTitle className="fw-bold text-dark">Chi Tiết Dòng Tiền Đơn {selectedInvoice?.id}</CModalTitle></CModalHeader>
          <CModalBody>
            {selectedInvoice && (
              <CRow>
                <CCol md={12} className="mb-4">
                  <div className="p-3 rounded bg-light border">
                    <div className="d-flex justify-content-between mb-2"><span className="text-label">Khách hàng:</span><span className="fw-bold text-dark">{selectedInvoice.customer}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-label">Ngày hoàn tất:</span><span className="text-dark">{selectedInvoice.date}</span></div>
                    <div className="d-flex justify-content-between"><span className="text-label">Trạng thái:</span><CBadge color="success">Đã hoàn thành</CBadge></div>
                  </div>
                </CCol>
                <CCol md={12}>
                    <h6 className="fw-bold text-primary mb-3">Phân Tích Dòng Tiền (Phí 8%)</h6>
                    <div className="p-3 rounded border">
                        <div className="d-flex justify-content-between mb-2"><span className="text-dark">Giá trị đơn hàng:</span><span className="fw-bold text-dark">{formatCurrency(selectedInvoice.amount)}</span></div>
                        <div className="d-flex justify-content-between mb-2 text-danger"><span>Khấu trừ phí sàn (8%):</span><span>- {formatCurrency(selectedInvoice.amount * 0.08)}</span></div>
                        <hr className="my-2"/>
                        <div className="d-flex justify-content-between align-items-center"><span className="fw-bold fs-5 text-success">VỀ VÍ VENDOR:</span><span className="fw-bold fs-4 text-price">{formatCurrency(selectedInvoice.amount * 0.92)}</span></div>
                    </div>
                </CCol>
              </CRow>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDetailModal(false)}>Đóng</CButton>
            <CButton color="primary" onClick={handleExportReceipt}><CIcon icon={cilPrint} className="me-2"/>In Phiếu Thu</CButton>
          </CModalFooter>
        </div>
      </CModal>
    </div>
  )
}

export default Revenue