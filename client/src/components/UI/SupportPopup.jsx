import { useRef, useEffect } from 'react';
import { X, Phone, Mail, Globe } from 'lucide-react';

/**
 * Support popup component for contacting support
 */
const SupportPopup = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);
  
  // Generate random ticket number
  const ticketNumber = useRef(`TKT-${Math.floor(Math.random() * 90000) + 10000}`);
  
  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <h3 className="font-medium">Contact Support</h3>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-md mr-2">
              {ticketNumber.current}
            </span>
            <button 
              onClick={onClose}
              className="text-white hover:bg-amber-700 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Contact Details */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-amber-800 mb-4">Contact Us Directly</h4>
          <div className="space-y-4">
            <div className="flex items-center bg-amber-50 p-3 rounded-lg">
              <Phone className="h-5 w-5 text-amber-600 mr-3" />
              <div>
                <h5 className="font-medium text-amber-900">Phone Support</h5>
                <p className="text-sm text-amber-900">+1 (555) 123-4567</p>
                <p className="text-xs text-amber-700 mt-1">Available 24/7 for urgent issues</p>
              </div>
            </div>
            
            <div className="flex items-center bg-amber-50 p-3 rounded-lg">
              <Mail className="h-5 w-5 text-amber-600 mr-3" />
              <div>
                <h5 className="font-medium text-amber-900">Email Support</h5>
                <a href="mailto:support@farmflow.com" className="text-sm text-amber-900 hover:underline">
                  support@farmflow.com
                </a>
                <p className="text-xs text-amber-700 mt-1">Response within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center bg-amber-50 p-3 rounded-lg">
              <Globe className="h-5 w-5 text-amber-600 mr-3" />
              <div>
                <h5 className="font-medium text-amber-900">Online Help Center</h5>
                <a href="https://support.farmflow.com" className="text-sm text-amber-900 hover:underline" target="_blank" rel="noopener noreferrer">
                  support.farmflow.com
                </a>
                <p className="text-xs text-amber-700 mt-1">Access documentation and FAQs</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPopup; 