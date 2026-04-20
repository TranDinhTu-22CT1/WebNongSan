import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilChartPie,
  cilPuzzle,
  cilContact,
  cilMoney,
  cilSpeech,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNavItems = (unreadCount) => [
  // ===== STYLE NHẸ: CHỈ TÔ MÀU GROUP ĐANG SỔ =====
  {
    component: () => (
      <style>
        {`
          /* CHỈ đổi màu dòng group khi mở */
          .sidebar-nav .nav-group.show > .nav-group-toggle {
            background-color: rgba(255, 255, 255, 0.08);
          }
        `}
      </style>
    ),
  },

  // ===== TỔNG QUAN =====
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/vendor/dashboard',
    icon: <CIcon icon={cilSpeedometer} className="nav-icon" />,
  },

  // ===== QUẢN LÝ =====
  {
    component: CNavTitle,
    name: 'Quản lý',
  },

  {
    component: CNavGroup,
    name: 'Sản phẩm & Đơn hàng',
    icon: <CIcon icon={cilPuzzle} className="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Sản phẩm', to: '/vendor/products' },
      { component: CNavItem, name: 'Hóa đơn', to: '/vendor/invoice' },
    ],
  },

  {
    component: CNavGroup,
    name: 'Tài chính',
    icon: <CIcon icon={cilMoney} className="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Doanh thu', to: '/vendor/revenue' },
      { component: CNavItem, name: 'Ví của tôi', to: '/vendor/wallet' },
    ],
  },

  // ===== TƯƠNG TÁC =====
  {
    component: CNavTitle,
    name: 'Tương tác',
  },

  {
    component: CNavGroup,
    name: 'Khách hàng',
    icon: <CIcon icon={cilSpeech} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Chat & Hỏi đáp',
        to: '/vendor/chat',
        badge:
          unreadCount > 0
            ? { color: 'danger', text: unreadCount.toString() }
            : undefined,
      },
      { component: CNavItem, name: 'Khuyến mãi', to: '/vendor/promotions' },
    ],
  },

  // ===== TÀI KHOẢN =====
  {
    component: CNavTitle,
    name: 'Tài khoản',
  },
  {
    component: CNavItem,
    name: 'Hồ sơ của tôi',
    to: '/vendor/vendorprofile',
    icon: <CIcon icon={cilContact} className="nav-icon" />,
  },
]

export default getNavItems
