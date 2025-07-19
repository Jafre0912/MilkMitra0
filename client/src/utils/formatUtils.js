/**
 * Format a date or timestamp to a relative time (e.g., "5 minutes ago")
 * @param {string|Date} dateString - Date string or Date object to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (isNaN(diffInSeconds) || diffInSeconds < 0) {
    return 'Invalid date';
  }
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date if older than a week
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get notification icon and color based on type
 * @param {string} type - Notification type
 * @returns {object} Object with icon and color information
 */
export const getNotificationTypeInfo = (type) => {
  switch (type) {
    case 'user':
      return {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: 'user'
      };
    case 'system':
      return {
        color: 'amber',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        icon: 'cog'
      };
    case 'alert':
      return {
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: 'alert'
      };
    case 'health':
      return {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: 'health'
      };
    default:
      return {
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: 'info'
      };
  }
}; 


export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}