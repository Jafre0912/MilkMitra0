import { X } from 'lucide-react';
import NotificationIcon from './NotificationIcon';
import { formatRelativeTime } from '../../utils/formatUtils';

/**
 * Component to display a single notification
 * @param {Object} props
 * @param {Object} props.notification - Notification data
 * @param {Function} props.onMarkAsRead - Function to mark notification as read
 * @param {Function} props.onRemove - Function to remove notification
 * @returns {JSX.Element}
 */
const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  const { id, title, message, createdAt, read, type } = notification;
  
  return (
    <div 
      className={`
        px-4 py-3 hover:bg-amber-50 border-b border-amber-100 relative group
        ${read ? 'opacity-75' : 'font-medium'}
      `}
      onClick={() => !read && onMarkAsRead(id)}
    >
      <div className="flex">
        <div className="mr-3 mt-0.5">
          <NotificationIcon type={type} />
        </div>
        <div className="flex-1">
          <p className={`text-sm ${read ? 'font-normal' : 'font-medium'} text-gray-900`}>
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {message}
          </p>
          <p className="text-xs text-amber-500 mt-2">
            {formatRelativeTime(createdAt)}
          </p>
        </div>
        
        {/* Close/Remove button */}
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          aria-label="Remove notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Unread indicator */}
      {!read && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-amber-500"></span>
      )}
    </div>
  );
};

export default NotificationItem; 