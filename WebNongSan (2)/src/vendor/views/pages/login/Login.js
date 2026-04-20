import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { setAuthSession } from '../../../../user/utils/authStorage.js'
import { API_BASE } from 'src/config';

// Banner & auth API endpoints
const API_URL = `${API_BASE}/banner.php`;
const BASE_URL = `${API_BASE}/`;
const API_BASE_URL = API_BASE;

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // State lưu trữ hình nền lấy từ database
  const [bgImage, setBgImage] = useState('')

  // 1. LẤY BANNER TỪ DATABASE KHI TRANG LOAD
  useEffect(() => {
    const fetchLoginBanner = async () => {
      try {
        const response = await fetch(`${API_URL}?action=list`)
        const result = await response.json()
        if (result.status === "success") {
          // Tìm banner có key là 'login' trong bảng system_banners
          const loginBanner = result.data.system.find(b => b.banner_key === 'login')
          if (loginBanner) {
            const fullPath = loginBanner.image_path.startsWith('http') 
              ? loginBanner.image_path 
              : BASE_URL + loginBanner.image_path
            setBgImage(fullPath)
          }
        }
      } catch (err) {
        console.error("Không thể tải banner đăng nhập:", err)
      }
    }
    fetchLoginBanner()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập Email và Mật khẩu')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.status === 'success') {
        const normalizedRole = String(data?.user?.role || '').toLowerCase()
        setAuthSession({
          token: data.token,
          user: { ...data.user, role: normalizedRole || data?.user?.role },
          // Keep vendor/admin stable even if they login from this page without a remember-me checkbox.
          rememberMe: true,
        })

        if (normalizedRole === 'admin') {
          navigate('/admin/panel', { replace: true })
        } else if (normalizedRole === 'vendor') {
          navigate('/vendor/dashboard', { replace: true })
        } else {
          setError('Tài khoản không có quyền truy cập trang quản trị.')
        }
      } else {
        setError(data.message || 'Đăng nhập thất bại.')
      }
    } catch (err) {
      setError('Lỗi kết nối server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ===== CONTAINER HÌNH NỀN BANNER FULL TRANG ===== */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#ebedef',
          overflow: 'hidden'
        }}
      >
        {bgImage && (
          <>
           <img
  src={bgImage}
  alt="Login Banner"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    imageRendering: 'auto',
    filter: 'contrast(1.05) brightness(1.05)',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
  }}
/>
            {/* Lớp phủ mờ (overlay) để làm nổi bật Form đăng nhập */}
            <div
  style={{
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.35)' // chỉ làm tối, không làm mờ
  }}
/>
          </>
        )}
      </div>

      {/* ===== LOGIN CONTENT (GIỮ NGUYÊN UI COREUI) ===== */}
      <div
        className="min-vh-100 d-flex flex-row align-items-center"
        style={{
          position: 'relative',
          zIndex: 2
        }}
      >
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8}>
              <CCardGroup>
                <CCard className="p-4 shadow-lg border-0" style={{ borderRadius: '15px 0 0 15px' }}>
                  <CCardBody>
                    <CForm>
                      <h1 className="text-success fw-bold">Đăng Nhập</h1>
                      <p className="text-body-secondary">
                        Hệ thống quản lý Nhà Cung Cấp
                      </p>

                      {error && <CAlert color="danger">{error}</CAlert>}

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Mật khẩu"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleLogin()
                          }
                        />
                      </CInputGroup>

                      <CRow>
                        <CCol xs={6}>
                          <CButton
                            color="success"
                            className="px-4 text-white fw-bold"
                            onClick={handleLogin}
                            disabled={loading}
                          >
                            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-end">
                          <CButton
                            color="link"
                            className="px-0 text-success text-decoration-none"
                          >
                            Quên mật khẩu?
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>

                <CCard
                  className="text-white bg-success py-5 shadow-lg border-0 d-none d-md-block"
                  style={{ width: '44%', borderRadius: '0 15px 15px 0' }}
                >
                  <CCardBody className="text-center d-flex flex-column justify-content-center">
                    <div>
                      <h2>Đăng Ký</h2>
                      <p>
                        Trở thành đối tác cung cấp nông sản sạch
                        ngay hôm nay để tiếp cận hàng ngàn khách
                        hàng trên toàn quốc.
                      </p>
                      <Link to="/register">
                        <CButton
                          color="light"
                          className="mt-3 text-success fw-bold px-4"
                        >
                          Bắt đầu ngay!
                        </CButton>
                      </Link>
                    </div>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  )
}

export default Login