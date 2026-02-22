import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  read: boolean;
}

// Simple SVG icons to replace lucide-react
const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    removeNotification,
  } = useNotifications();
  
  const [isVisible, setIsVisible] = useState(false);

  // Toggle notification center visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Auto-close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const notificationCenter = document.getElementById('notification-center');
      const bellButton = document.getElementById('notification-bell');

      if (
        isVisible &&
        notificationCenter &&
        bellButton &&
        !notificationCenter.contains(event.target as Node) &&
        !bellButton.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  // Icons mapping
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    error: <AlertCircleIcon className="h-5 w-5 text-red-400" />,
    info: <InfoIcon className="h-5 w-5 text-blue-400" />,
    warning: <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />,
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        id="notification-bell"
        onClick={toggleVisibility}
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Panel */}
      {isVisible && (
        <div
          id="notification-center"
          className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-gray-300 hover:text-white"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              <ul>
                {notifications.map((notification: Notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-gray-700 last:border-b-0 ${
                      !notification.read ? 'bg-gray-750' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0 pt-0.5">
                            {icons[notification.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            {notification.title && (
                              <h4 className="font-medium text-white text-sm">
                                {notification.title}
                              </h4>
                            )}
                            <p className="text-gray-300 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-white p-1"
                              title="Mark as read"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-white p-1"
                            title="Dismiss"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}