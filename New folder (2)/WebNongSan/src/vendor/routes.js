import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('../vendor/views/dashboard/Dashboard'))

// Features
const Products = React.lazy(() => import('../vendor/views/products/Products'))
const VendorProfile = React.lazy(() => import('../vendor/views/profile/VendorProfile'))
const Revenue = React.lazy(() => import('../vendor/views/revenue/Revenue'))
const Invoice = React.lazy(() => import('./views/invoices/Invoice')) // 👈 ĐỔI TÊN CHUẨN
const Chat = React.lazy(() => import('./views/chat/Chat'))
const Wallet = React.lazy(() => import('./views/wallet/VendorWallet'))
const Promotions = React.lazy(() => import('./views/promotions/Promotions'))
const routes = [
  { path: '/vendor', name: 'Home' },
  { path: '/vendor/dashboard', name: 'Dashboard', element: Dashboard },
 
  { path: '/vendor/chat', name: 'Hỗ Trợ Khách Hàng', element: Chat },
  { path: '/vendor/promotions', name: 'Khuyến Mãi', element: Promotions },
  { path: '/vendor/products', name: 'Products', element: Products },
  { path: '/vendor/vendorprofile', name: 'Vendor Profile', element: VendorProfile },
  { path: '/vendor/revenue', name: 'Revenue', element: Revenue },
  { path: '/vendor/invoice', name: 'Invoice', element: Invoice },
  { path: '/vendor/wallet', name: 'Ví Của Tôi', element: Wallet },
]

export default routes
