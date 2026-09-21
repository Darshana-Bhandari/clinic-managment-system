import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from '../../services/notificationService';
import {
  FiBell,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // ==================== FETCH COUNT ====================
  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // ==================== HANDLE CLICK OUTSIDE ====================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== FETCH NOTIFICATIONS ====================
  const fetchRecent = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications({ limit: 5 });
      setNotifications(data.notifications || data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchRecent();
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    const icons = {
      APPOINTMENT: { icon: FiCalendar, color: 'text-blue-600 bg-blue-100' },
      PATIENT: { icon: FiUser, color: 'text-purple-600 bg-purple-100' },
      PAYMENT: { icon: FiDollarSign, color: 'text-green-600 bg-green-100' },
      ALERT: { icon: FiAlertCircle, color: 'text-red-600 bg-red-100' },
    };
    return icons[type] || { icon: FiInfo, color: 'text-gray-600 bg-gray-100' };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FiBell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => {
                  const { icon: Icon, color } = getIcon(n.type);
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
                        !n.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          {!n.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"
                              title="Mark as read"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;