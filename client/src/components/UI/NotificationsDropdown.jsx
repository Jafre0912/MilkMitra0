import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import NotificationItem from './NotificationItem';
import useNotificationStore from '../../store/notificationStore';

/**
 * Notifications dropdown component for the admin panel
 */
const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotificationStore();
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 2 minutes
    const intervalId = setInterval(fetchNotifications, 120000);
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-1 rounded-full text-white hover:text-amber-100 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200 relative"
        aria-label="View notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notifications dropdown */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white border border-amber-200 focus:outline-none overflow-hidden z-[100]">
          {/* Header */}
          <div className="px-4 py-2 border-b border-amber-200 bg-amber-50 flex justify-between items-center">
            <p className="text-sm font-medium text-amber-800">Notifications</p>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs flex items-center text-amber-600 hover:text-amber-800"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
          
          {/* Notifications list */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown; 