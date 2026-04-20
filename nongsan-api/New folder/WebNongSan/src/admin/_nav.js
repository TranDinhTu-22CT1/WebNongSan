import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilChartPie,
  cilStar,
  cilPencil,
  cilPuzzle,
  cilContact,
  cilMoney,
  cilUser,
  cilBuilding,
  cilCircle,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const SubIcon = ({ icon }) => (
  <span className="nav-sub-icon">
    <CIcon icon={icon} className="nav-icon-sub" />
  </span>
)

const getNavItems = () => [
  /* ===== DASHBOARD ===== */
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/admin/panel',
    icon: <CIcon icon={cilSpeedometer} className="nav-icon" />,
  },

  /* ===== QUẢN LÝ TÀI KHOẢN ===== */
  {
    component: CNavGroup,
    name: 'Quản lý tài khoản',
    icon: <CIcon icon={cilUser } className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: ' | Quản lý Người Dùng',
        to: '/admin/customer',
        icon: <SubIcon icon={cilUser} />,
      },
      {
        component: CNavItem,
        name: '| Quản lý Vendor',
        to: '/admin/vendor',
        icon: <SubIcon icon={cilBuilding} />,
      },
      {
        component: CNavItem,
        name: '| Profile Admin',
        to: '/admin/admin-profile',
        icon: <SubIcon icon={cilContact} />,
      },
      {
        component: CNavItem,
        name: '| Quản lý Vai Trò',
        to: '/admin/role-management',
        icon: <SubIcon icon={cilCircle} />,
      },
    ],
  },

  /* ===== NGHIỆP VỤ ===== */
  {
    component: CNavGroup,
    name: 'Nghiệp vụ',
    icon: <CIcon icon={cilPuzzle} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: '| Quản lý Sản Phẩm',
        to: '/admin/product',
        icon: <SubIcon icon={cilPencil} />,
      },
      {
        component: CNavItem,
        name: '| Quản lý Danh Mục',
        to: '/admin/category',
        icon: <SubIcon icon={cilPuzzle} />,
      },
      {
        component: CNavItem,
        name: '| Quản lý Ưu Đãi',
        to: '/admin/sale',
        icon: <SubIcon icon={cilChartPie} />,
      },
      {
        component: CNavItem,
        name: '| Quản lý Thanh Toán',
        to: '/admin/payment',
        icon: <SubIcon icon={cilMoney} />,
      },
      {
        component: CNavItem,
        name: '| Quản lý Đơn Hàng',
        to: '/admin/order-management',
        icon: <SubIcon icon={cilCircle} />,
      },
      

      {
        component: CNavItem,
        name: '| Quản lý Báo Cáo',
        to: '/admin/reports-management',
        icon: <SubIcon icon={cilChartPie} />,
      },

    ],
  },

  /* ===== HỖ TRỢ ===== */
  {
    component: CNavGroup,
    name: 'Hỗ trợ & chăm sóc',
    icon: <CIcon icon={cilStar} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: '| Hỗ Trợ Khách Hàng',
        to: '/admin/support',
        icon: <SubIcon icon={cilStar} />,
      },

    ],
  },
  {
    component: CNavItem,
    name: 'Logs Management',
    to: '/admin/logs-management',
    icon: <CIcon icon={cilSpeedometer} className="nav-icon" />,
  },

]

export default getNavItems
