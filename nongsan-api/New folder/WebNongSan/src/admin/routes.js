import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('../admin/views/panel/panel'))

const Vendor = React.lazy(() => import('../admin/views/VendorManager/VendorManager'))
const Customer = React.lazy(() => import('../admin/views/CustomerManagement/CustomerManagement'))
const Product = React.lazy(() => import('../admin/views/ProductManagement/ProductManagement'))
const Payment = React.lazy(() => import('../admin/views/PaymentManagement/PaymentManagement'))
const Sale = React.lazy(() => import('../admin/views/SaleManagement/SaleManagement'))
const Support = React.lazy(() => import('../admin/views/SupportChat/SupportChat'))
const Category = React.lazy(() => import('../admin/views/Category/CreateCategory'))
const AdminProfile = React.lazy(() => import('../admin/views/ProfileCard/AdminProfile'))
const OrderManagement = React.lazy(() => import('../admin/views/OrderManagement/OrderManagement'))
const ReportsManagement = React.lazy(() => import('../admin/views/ReportManagement/ReportManagement'))
const rolemanagement = React.lazy(() => import('../admin/views/RoleManagement/RoleManagement'))
const logsmanagement = React.lazy(() => import('../admin/views/Logs/LogManagement'))
const routes = [
  { path: '/admin', name: 'Home' },
  { path: '/admin/panel', name: 'Dashboard', element: Dashboard },
  { path: '/admin/vendor', name: 'Vendor', element: Vendor },
  { path: '/admin/customer', name: 'Customer', element: Customer},
  { path: '/admin/product', name: 'Product', element: Product},
  { path: '/admin/payment', name: ' Payment', element: Payment},
  { path: '/admin/support', name: ' support', element: Support},
  { path: '/admin/category', name: ' Category', element: Category},
    { path: '/admin/sale', name: ' Ưu đãi', element: Sale},
    { path: '/admin/order-management', name: 'Order Management', element: OrderManagement},
    { path: '/admin/admin-profile', name: 'Admin Profile', element: AdminProfile},
    { path: '/admin/reports-management', name: 'Reports Management', element: ReportsManagement},
    { path: '/admin/role-management', name: 'Role Management', element: rolemanagement},
    { path: '/admin/logs-management', name: 'Logs Management', element: logsmanagement},
    

]

export default routes
