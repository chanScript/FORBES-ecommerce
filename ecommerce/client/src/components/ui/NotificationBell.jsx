import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TIME_AGO = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NOTIFICATION_LINKS = {
  NEW_LISTING: '/admin/listings',
  NEW_INQUIRY: '/admin/inquiries',
  NEW_SUBMISSION: '/admin/submissions',
  DOCUMENT_UPLOAD: '/admin/listings',
  STATUS_CHANGE: '/admin/dashboard',
};

export default function NotificationBell() {
  const { unreadCount, notifications, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-surface-card hover:text-primary-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-surface-light shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary-accent hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-secondary-muted">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={NOTIFICATION_LINKS[n.type] || '/admin/dashboard'}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-surface-card ${
                    !n.isRead ? 'bg-primary-accent/5' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-secondary-muted truncate">{n.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{TIME_AGO(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-accent" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
