// /* eslint-disable react/prop-types */
// // src/components/chat/components/ConversationList.jsx
// import { 
//   Users, 
//   User, 
//   Search, 
//   Clock,
//   Loader,
//   Shield
// } from 'lucide-react';

// const ConversationList = ({ 
//   conversations, 
//   currentUser,
//   currentConversation, 
//   searchQuery, 
//   setSearchQuery, 
//   handleUserClick, 
//   isLoading,
//   typingUsers,
//   title,
//   searchPlaceholder
// }) => {
//   return (
//     <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//       <div className="p-4 border-b border-gray-200 flex-shrink-0">
//         <h2 className="text-xl font-semibold flex items-center gap-2">
//           <Users size={20} />
//           <span>{title}</span>
//         </h2>
//         <div className="mt-4 relative">
//           <input 
//             type="text" 
//             placeholder={searchPlaceholder} 
//             className="w-full p-2 pl-8 border border-gray-300 rounded-md"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <Search size={16} className="absolute left-2 top-3 text-gray-400" />
//         </div>
//       </div>

//       <div className="overflow-y-auto flex-grow">
//         {isLoading && conversations.length === 0 ? (
//           <div className="flex justify-center items-center h-32">
//             <Loader size={24} className="animate-spin text-indigo-600" />
//           </div>
//         ) : conversations.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No conversations found
//           </div>
//         ) : (
//           conversations.map((conversation) => (
//             <ConversationItem 
//               key={conversation._id}
//               conversation={conversation}
//               currentUser={currentUser}
//               isSelected={currentConversation?._id === conversation._id}
//               onClick={() => handleUserClick(conversation)}
//               typingUsers={typingUsers}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// // ConversationItem component
// const ConversationItem = ({ conversation, currentUser, isSelected, onClick, typingUsers }) => {
//   // Find the other participant (not the current user)
//   const otherParticipant = conversation.participants?.find(p => 
//     (typeof p === 'string' ? p : p._id) !== currentUser?._id
//   ) || conversation;
  
//   const name = typeof otherParticipant === 'string' 
//     ? 'Loading...' 
//     : otherParticipant?.name || 'Support';
    
//   const role = typeof otherParticipant === 'string' 
//     ? '' 
//     : otherParticipant?.role;
    
//   const isAdmin = role === 'admin';
  
//   const lastMessageTime = conversation.lastMessage?.createdAt 
//     ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
//     : '';
    
//   const lastMessageContent = conversation.lastMessage?.content || conversation.lastMessage?.text || 'Start a conversation';
  
//   // Define default values for properties that may not exist
//   const isOnline = conversation.isOnline || conversation.adminAvailable || false;
//   const unreadCount = conversation.unreadCount || 0;
  
//   const isTyping = typingUsers && conversation._id && typingUsers[conversation._id] 
//     ? Object.values(typingUsers[conversation._id]).some(Boolean)
//     : conversation.isTyping || false;

//   return (
//     <div 
//       className={`flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`}
//       onClick={onClick}
//     >
//       <div className="relative">
//         <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
//           {isAdmin ? (
//             <Shield size={24} className="text-indigo-600" />
//           ) : (
//             <User size={24} className="text-gray-600" />
//           )}
//         </div>
//         <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
//       </div>
      
//       <div className="flex-1 min-w-0">
//         <div className="flex justify-between items-center">
//           <h3 className="font-medium truncate flex items-center gap-1">
//             {name}
//             {isAdmin && (
//               <span className="text-xs bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded">Admin</span>
//             )}
//           </h3>
//           <span className="text-xs text-gray-500 flex items-center">
//             <Clock size={12} className="mr-1" />
//             {lastMessageTime}
//           </span>
//         </div>
//         <div className="flex items-center justify-between">
//           <p className="text-sm text-gray-500 truncate">
//             {isTyping ? (
//               <span className="flex items-center text-indigo-600">
//                 <Loader size={12} className="animate-spin mr-1" />
//                 Typing...
//               </span>
//             ) : (
//               lastMessageContent
//             )}
//           </p>
//           {unreadCount > 0 && (
//             <span className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//               {unreadCount}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConversationList;


import { useState, useEffect } from 'react';

const ConversationList = ({
  conversations,
  currentUser,
  currentConversation,
  searchQuery,
  setSearchQuery,
  handleUserClick,
  isLoading,
  title,
  searchPlaceholder,
  onlineUsers
}) => {
  // Add refresh interval for online status
  useEffect(() => {
    // Log the current onlineUsers for debugging
    console.log('Current online users:', onlineUsers);
  }, [onlineUsers]);

  // Function to check if a user is online
  const isUserOnline = (userId) => {
    return Array.isArray(onlineUsers) && onlineUsers.includes(userId);
  };

  return (
    <div className="flex flex-col h-full w-80 overflow-hidden border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      
      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${
                currentConversation?._id === conv._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleUserClick(conv)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {conv.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {isUserOnline(conv._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{conv.name || 'Unknown User'}</p>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {isUserOnline(conv._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;