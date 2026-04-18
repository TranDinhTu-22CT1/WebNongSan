import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard, CCardBody, CCol, CRow, CWidgetStatsA, CDropdown, CDropdownMenu, 
  CDropdownItem, CDropdownToggle, CSpinner, CButtonGroup, CButton
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions, cilBasket, cilDescription, cilMoney } from '@coreui/icons'
import { getAuthToken, getStoredUserRole } from '../../../user/utils/authStorage.js'
import { API_BASE as API_BASE_URL } from 'src/config';

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dataStats, setDataStats] = useState({ products: 0, orders: 0, revenue: 0 })
  const [chartData, setChartData] = useState(Array(12).fill(0))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const authToken = getAuthToken()
    const role = getStoredUserRole()

    if (!authToken || role !== 'vendor') {
      navigate('/login')
    } else {
      setIsAuthenticated(true)
      fetchDashboardData(authToken)
    }
  }, [navigate])

  const fetchDashboardData = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_dashboard_stats.php`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const result = await res.json()

      if (result.status === 'success') {
        setDataStats(result.stats)
        setChartData(result.chart)
        setError('')
        return
      }

      throw new Error(result.message || 'Không thể tải thống kê dashboard')
    } catch (err) {
      setError('Không thể tải thống kê dashboard. Vui lòng thử lại.')
      console.error('Lỗi tải dữ liệu dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  if (!isAuthenticated || loading) {
    return <div className="text-center py-5"><CSpinner color="primary" /></div>
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>
  }

  return (
    <>
      <CRow>
        {/* Sản phẩm */}
        <CCol sm={6} lg={4}>
          <CWidgetStatsA
            className="mb-4" color="primary"
            value={<>{dataStats.products.toLocaleString()} <span className="fs-6 fw-normal">Sản phẩm</span></>}
            title="Sản phẩm đang bán"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0 text-white">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu><CDropdownItem onClick={() => navigate('/vendor/products')}>Xem tất cả</CDropdownItem></CDropdownMenu>
              </CDropdown>
            }
            chart={<div className="mt-3 mx-3 text-white opacity-50"><CIcon icon={cilBasket} size="4xl" /></div>}
          />
        </CCol>

        {/* Hóa đơn */}
        <CCol sm={6} lg={4}>
          <CWidgetStatsA
            className="mb-4" color="info"
            value={<>{dataStats.orders.toLocaleString()} <span className="fs-6 fw-normal">Đơn hàng</span></>}
            title="Tổng số hóa đơn"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0 text-white">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu><CDropdownItem onClick={() => navigate('/vendor/invoice')}>Xem chi tiết</CDropdownItem></CDropdownMenu>
              </CDropdown>
            }
            chart={<div className="mt-3 mx-3 text-white opacity-50"><CIcon icon={cilDescription} size="4xl" /></div>}
          />
        </CCol>

        {/* Doanh thu */}
        <CCol sm={12} lg={4}>
          <CWidgetStatsA
            className="mb-4" color="warning"
            value={<>{formatCurrency(dataStats.revenue)}</>}
            title="Doanh thu thành công"
            chart={<div className="mt-3 mx-3 text-white opacity-50"><CIcon icon={cilMoney} size="4xl" /></div>}
          />
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardBody>
          <h4 className="card-title mb-4">Biểu đồ doanh thu thực tế (năm 2026)</h4>
          <div style={{ height: '300px' }}>
            <CChartLine
              style={{ height: '300px' }}
              data={{
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [{
                  label: 'Doanh thu (VNĐ)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                  data: chartData,
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard