import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { notificationsAPI } from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Fetch unread count on mount / user change
  useEffect(() => {
    if (!user || !isAdmin) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    notificationsAPI.getUnreadCount()
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});

    notificationsAPI.list(1, 10)
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => {});
  }, [user, isAdmin]);

  // Socket.io connection
  useEffect(() => {
    if (!user || !isAdmin) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('new_notification', (notification) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isAdmin]);

  const markAsRead = useCallback(async (id) => {
    await notificationsAPI.markAsRead(id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsAPI.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user || !isAdmin) return;
    const [countRes, listRes] = await Promise.all([
      notificationsAPI.getUnreadCount(),
      notificationsAPI.list(1, 10),
    ]);
    setUnreadCount(countRes.data.count);
    setNotifications(listRes.data.data || []);
  }, [user, isAdmin]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, markAsRead, markAllRead, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
