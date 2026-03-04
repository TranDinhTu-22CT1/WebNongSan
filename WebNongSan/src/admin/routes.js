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
const Plugin = React.lazy(() => import('../admin/views/plugin/Plugins'))
const AdminProfile = React.lazy(() => import('../admin/views/ProfileCard/AdminProfile'))
const OrderManagement = React.lazy(() => import('../admin/views/OrderManagement/OrderManagement'))
const ShippingManagement = React.lazy(() => import('../admin/views/ShippingManagement/ShippingManagement'))
const ReportsManagement = React.lazy(() => import('../admin/views/ReportManagement/ReportManagement'))
const rolemanagement = React.lazy(() => import('../admin/views/RoleManagement/RoleManagement'))
const reviewmanagement = React.lazy(() => import('../admin/views/ReviewManagement/ReviewManagement'))
const notificationmanagement = React.lazy(() => import('../admin/views/NotificationManagement/NotificationManagement'))
const logsmanagement = React.lazy(() => import('../admin/views/Logs/LogManagement'))
const changeBanner = React.lazy(() => import('../admin/views/changeBanner/change'))
const routes = [
  { path: '/', name: 'Home' },
  { path: '/panel', name: 'Dashboard', element: Dashboard },
  { path: '/vendor', name: 'Vendor', element: Vendor },
  { path: '/customer', name: 'Customer', element: Customer},
  { path: '/product', name: 'Product', element: Product},
  { path: '/payment', name: ' Payment', element: Payment},
  { path: '/support', name: ' support', element: Support},
  { path: '/category', name: ' Category', element: Category},
    { path: '/sale', name: ' Sale', element: Sale},
    { path: '/plugin', name: ' Plugin', element: Plugin},
    { path: '/order-management', name: 'Order Management', element: OrderManagement},
    { path: '/shipping-management', name: 'Shipping Management', element: ShippingManagement},
    { path: '/admin-profile', name: 'Admin Profile', element: AdminProfile},
    { path: '/reports-management', name: 'Reports Management', element: ReportsManagement},
    { path: '/role-management', name: 'Role Management', element: rolemanagement},
    { path: '/review-management', name: 'Review Management', element: reviewmanagement},
    { path: '/notification-management', name: 'Notification Management', element: notificationmanagement},
    { path: '/logs-management', name: 'Logs Management', element: logsmanagement},
    { path: '/change-banner', name: 'Change Banner', element: changeBanner}
    

]

export default routes
