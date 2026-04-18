import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('../vendor/views/dashboard/Dashboard'))

// Pages
const Login = React.lazy(() => import('../vendor/views/pages/login/Login'))
const Register = React.lazy(() => import('../vendor/views/pages/register/Register'))
const Page404 = React.lazy(() => import('../vendor/views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('../vendor/views/pages/page500/Page500'))
const Reviews = React.lazy(() => import('./views/reviews/Reviews'))
// Features
const Charts = React.lazy(() => import('../vendor/views/charts/Charts'))
const Products = React.lazy(() => import('../vendor/views/products/Products'))
const VendorProfile = React.lazy(() => import('../vendor/views/profile/VendorProfile'))
const Revenue = React.lazy(() => import('../vendor/views/revenue/Revenue'))
const Invoice = React.lazy(() => import('./views/invoices/Invoice')) // 👈 ĐỔI TÊN CHUẨN
const Shipping = React.lazy(() => import('./views/shipping/Shipping'))
const Chat = React.lazy(() => import('./views/chat/Chat'))
const Wallet = React.lazy(() => import('./views/wallet/VendorWallet'))
const Promotions = React.lazy(() => import('./views/promotions/Promotions'))
const Plugins = React.lazy(() => import('./views/plugin/Plugins'))
const routes = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/reviews', name: 'Đánh Giá', element: Reviews },
  { path: '/login', name: 'Login', element: Login },
  { path: '/register', name: 'Register', element: Register },
  { path: '/404', name: 'Page 404', element: Page404 },
  { path: '/500', name: 'Page 500', element: Page500 },
  { path: '/chat', name: 'Hỗ Trợ Khách Hàng', element: Chat },
  { path: '/shipping', name: 'Vận Chuyển', element: Shipping },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/promotions', name: 'Khuyến Mãi', element: Promotions },
  { path: '/products', name: 'Products', element: Products },
  { path: '/vendorprofile', name: 'Vendor Profile', element: VendorProfile },
  { path: '/revenue', name: 'Revenue', element: Revenue },
  { path: '/invoice', name: 'Invoice', element: Invoice },
  { path: '/wallet', name: 'Ví Của Tôi', element: Wallet },
  { path: '/plugins', name: 'Plugins', element: Plugins },
]

export default routes
