import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notificationsAPI } from '../../api/apiClient';
import { getAuthToken, getStoredUser } from '../../utils/authStorage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const getCurrentAccountKey = useCallback(() => {
    const token = getAuthToken();
    const user = getStoredUser();
    const userId = String(user?.id || '').trim();

    if (!token || !userId) return 'guest';
    return `user:${userId}`;
  }, []);
  const [accountKey, setAccountKey] = useState(() => getCurrentAccountKey());

  const refreshNotifications = useCallback(async () => {
    const nextAccountKey = getCurrentAccountKey();
    if (nextAccountKey === 'guest') {
      setNotifications([]);
      return;
    }

    try {
      const data = await notificationsAPI.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    }
  }, [getCurrentAccountKey]);

  useEffect(() => {
    refreshNotifications();

    const timer = setInterval(() => {
      refreshNotifications();
    }, 20000);

    return () => clearInterval(timer);
  }, [refreshNotifications]);

  useEffect(() => {
    const handleAuthChanged = () => {
      const nextAccountKey = getCurrentAccountKey();
      if (nextAccountKey !== accountKey) {
        setNotifications([]);
        setAccountKey(nextAccountKey);
      }
      refreshNotifications();
    };

    window.addEventListener('login', handleAuthChanged);
    window.addEventListener('logout', handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);
    return () => {
      window.removeEventListener('login', handleAuthChanged);
      window.removeEventListener('logout', handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, [accountKey, getCurrentAccountKey, refreshNotifications]);

  useEffect(() => {
    if (accountKey === 'guest') {
      setNotifications([]);
    }
  }, [accountKey]);

  // Hàm thêm thông báo mới (Các trang khác sẽ gọi hàm này)
  const addNotification = (title, desc) => {
    if (getCurrentAccountKey() === 'guest') return;

    const newNotify = {
      id: Date.now(), // Tạo ID ngẫu nhiên theo thời gian
      title,
      desc,
      time: "Vừa xong",
      unread: true,
      image: "https://cdn-icons-png.flaticon.com/512/7518/7518748.png"
    };
    
    // Thêm vào đầu danh sách
    setNotifications((prev) => [newNotify, ...prev]);
  };

  // Hàm đánh dấu đã đọc (khi bấm vào chuông)
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, unread: false })));
    notificationsAPI.markAllAsRead()
      .then(() => refreshNotifications())
      .catch((err) => console.error('Failed to mark notifications as read:', err));
  };

  const markAsRead = (id) => {
    const targetId = String(id || '');
    if (!targetId) return;

    const selected = notifications.find((n) => String(n.id) === targetId);
    if (!selected) return;

    setNotifications((prev) => prev.map((n) => (
      String(n.id) === targetId ? { ...n, unread: false } : n
    )));

    notificationsAPI.markAsRead(selected)
      .then(() => refreshNotifications())
      .catch((err) => console.error('Failed to mark notification as read:', err));
  };

  // Đếm số tin chưa đọc
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, unreadCount, markAllAsRead, markAsRead, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
