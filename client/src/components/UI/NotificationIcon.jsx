import { 
  User, 
  Settings, 
  AlertTriangle, 
  Activity, 
  Info 
} from 'lucide-react';

/**
 * Component to display appropriate icon based on notification type
 * @param {Object} props
 * @param {string} props.type - Notification type
 * @param {string} props.size - Icon size (sm, md, lg)
 * @param {string} props.color - Icon color (CSS class)
 * @returns {JSX.Element}
 */
const NotificationIcon = ({ type, size = 'md', color }) => {
  // Determine size class
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size] || 'h-5 w-5';
  
  // Determine which icon to show based on notification type
  switch (type) {
    case 'user':
      return <User className={`${sizeClass} ${color || 'text-blue-500'}`} />;
    case 'system':
      return <Settings className={`${sizeClass} ${color || 'text-amber-500'}`} />;
    case 'alert':
      return <AlertTriangle className={`${sizeClass} ${color || 'text-red-500'}`} />;
    case 'health':
      return <Activity className={`${sizeClass} ${color || 'text-green-500'}`} />;
    default:
      return <Info className={`${sizeClass} ${color || 'text-gray-500'}`} />;
  }
};

export default NotificationIcon; 