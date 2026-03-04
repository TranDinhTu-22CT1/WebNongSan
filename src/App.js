import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './vendor/scss/style.scss'
import './vendor/scss/examples.scss'
import SplashCursor from './admin/components/SplashCursor'
import GlobalMediaPlayer from './vendor/layout/GlobalMediaPlayer'
import NekoCat from './vendor/components/NekoCat'
// Containers (Layouts)
const DefaultLayout = React.lazy(() => import('./vendor/layout/DefaultLayout'))
const AdminLayout = React.lazy(() => import('./admin/layout/layout')) // Layout riêng cho Admin

// Pages
const Login = React.lazy(() => import('./vendor/views/pages/login/Login'))
const Register = React.lazy(() => import('./vendor/views/pages/register/Register'))
const Page404 = React.lazy(() => import('./vendor/views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./vendor/views/pages/page500/Page500'))

/**
 * Component Bảo vệ Route (Role-based Authorization)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  const user = userJson ? JSON.parse(userJson) : null

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />
  }

  return children
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes(
    'coreui-free-react-admin-template-theme',
  )
  const storedTheme = useSelector((state) => state.theme)

  // --- LOGIC AUTO LOGOUT KHI ĐÓNG TRÌNH DUYỆT & SERVER RESTART ---
  useEffect(() => {
  const checkServerOnce = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(
        'http://localhost/nongsan-api/check_status.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        },
      )

      // server sống nhưng token chết
      if (!res.ok) throw new Error('Server error')

      const data = await res.json()

      if (data.logout === true) {
        localStorage.clear()
        window.location.replace('/#/login')
      }
    } catch (err) {
      // ⚠️ QUAN TRỌNG:
      // KHÔNG logout khi server tạm delay / đang xử lý
      console.warn('⚠️ Không check được server, bỏ qua', err)
    }
  }

  checkServerOnce()
}, [])


  useEffect(() => {
    const currentUrl = window.location.href
    if (currentUrl.includes('?')) {
      const urlParams = new URLSearchParams(currentUrl.split('?')[1])
      const theme =
        urlParams.get('theme') &&
        urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
      if (theme) setColorMode(theme)
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme)
    }
  }, [isColorModeSet, setColorMode, storedTheme])

  return (
    <HashRouter>
      <SplashCursor />
      <NekoCat />
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* VENDOR ROUTES: Sử dụng DefaultLayout và path /dashboard */}
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES: Cập nhật đường dẫn phẳng (Flat Routes) theo yêu cầu */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/panel" element={<AdminLayout />} />
            <Route path="/vendor" element={<AdminLayout />} />
            <Route path="/customer" element={<AdminLayout />} />
            <Route path="/product" element={<AdminLayout />} />
            <Route path="/payment" element={<AdminLayout />} />
            <Route path="/support" element={<AdminLayout />} />
            <Route path="/sale" element={<AdminLayout />} />
            <Route path="/category" element={<AdminLayout />} />
            <Route path="/plugin" element={<AdminLayout />} />
            <Route path="/profile" element={<AdminLayout />} />
            <Route path="/admin-profile" element={<AdminLayout />} />
            <Route path="/order-management" element={<AdminLayout />} />
            <Route path="/shipping-management" element={<AdminLayout />} />
            <Route path="/reports-management" element={<AdminLayout />} />
            <Route path="/role-management" element={<AdminLayout />} />
            <Route path="/review-management" element={<AdminLayout />} />
            <Route path="/notification-management" element={<AdminLayout />} />
            <Route path="/logs-management" element={<AdminLayout />} />
            <Route path="/change-banner" element={<AdminLayout />} />
          </Route>

          {/* Redirect mặc định dựa trên Role sau khi đăng nhập */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={
                  localStorage.getItem('token') 
                    ? (JSON.parse(localStorage.getItem('user'))?.role === 'admin' ? "/panel" : "/dashboard")
                    : "/login"
                } 
                replace 
              />
            } 
          />

          {/* Catch-all: Về 404 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>

        <GlobalMediaPlayer />
      </Suspense>
    </HashRouter>
  )
}

export default App