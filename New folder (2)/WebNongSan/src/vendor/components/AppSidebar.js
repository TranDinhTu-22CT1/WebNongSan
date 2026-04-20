import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { API_BASE } from 'src/config';
import getNavItems from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  
  // State quản lý số tin nhắn chưa đọc
  const [unreadCount, setUnreadCount] = useState(0)

  // Lấy ID người dùng hiện tại
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = storedUser.id || 1

  // Hàm fetch số tin nhắn chưa đọc từ API
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/message.php?action=get_conversations&user_id=${userId}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        // Tính tổng số unread từ tất cả các cuộc hội thoại
        const total = data.reduce((acc, curr) => acc + parseInt(curr.unread || 0), 0)
        setUnreadCount(total)
      }
    } catch (error) {
      console.error('Lỗi khi lấy số tin nhắn:', error)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    // Cập nhật sau mỗi 10 giây
    const interval = setInterval(fetchUnreadCount, 10000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <>
    <style>{`
      .sidebar .sidebar-header { background-color: #1a2233 !important; }
      .vshop-brand-v   { color: #60a5fa !important; }
      .vshop-brand-word { color: #e2e8f0 !important; }
    `}</style>
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom d-flex align-items-center justify-content-center">
        <CSidebarBrand
          to="/vendor/dashboard"
          className="fw-bold fs-4 text-decoration-none text-center w-100 vshop-brand"
          style={{ letterSpacing: '1.5px' }}
        >
          <span className="vshop-brand-v">V</span>
          <span className="vshop-brand-word">shop</span>
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none position-absolute end-0 me-2"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* Truyền kết quả của hàm getNavItems với tham số unreadCount */}
      <AppSidebarNav items={getNavItems(unreadCount)} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
    </>
  )
}

export default React.memo(AppSidebar)