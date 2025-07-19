/* eslint-disable react/prop-types */
// src/components/chat/components/ChatArea.jsx
import { 
  User,
  Send, 
  MoreVertical,
  Loader,
  Circle,
  Bot,
  Shield
} from 'lucide-react';

const ChatArea = ({ 
  conversation,
  messages,
  currentUser,
  isLoading,
  isTyping,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  handleInputChange,
  handleInputBlur,
  messageEndRef,
  isAdmin = false,
  onlineUsers = []
}) => {

  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants?.find(p => 
    (typeof p === 'string' ? p : p._id) !== currentUser?._id
  ) || conversation;
  
  const name = typeof otherParticipant === 'string' 
    ? 'Support' 
    : otherParticipant?.name || 'Support';
  
  const role = typeof otherParticipant === 'string' 
    ? '' 
    : otherParticipant?.role;
    
  const isOtherParticipantAdmin = role === 'admin';
  
  // Check if user is online using multiple possible indicators
  const otherParticipantId = typeof otherParticipant === 'string' 
    ? otherParticipant 
    : otherParticipant?._id;
    
  const isOnline = 
    conversation.isOnline || 
    conversation.adminAvailable || 
    (onlineUsers && onlineUsers.includes(otherParticipantId)) ||
    false;
    
  const isAiActive = !conversation.adminAvailable && conversation.isAdminChat;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {isOtherParticipantAdmin ? (
                <Shield size={24} className="text-indigo-600" />
              ) : (
                <User size={24} className="text-gray-600" />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-xs text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
              {isTyping && ' • Typing...'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {isAiActive && (
            <div className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
              <Bot size={14} className="mr-1" />
              AI bot active
            </div>
          )}
          <button className="p-2 rounded-full hover:bg-gray-100">
            <MoreVertical size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader size={30} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(messages) ? messages.map((message) => (
              <ChatMessage 
                key={message._id}
                message={message}
                currentUser={currentUser}
                isAdmin={isAdmin}
              />
            )) : (
              <div className="text-center py-8 text-gray-500">
                No messages yet
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg flex items-center gap-1">
                  <Circle size={8} className="animate-pulse" />
                  <Circle size={8} className="animate-pulse" />
                  <Circle size={8} className="animate-pulse" />
                </div>
              </div>
            )}
            
            <div ref={messageEndRef}></div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentMessage}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <button 
            type="submit" 
            className={`p-2 rounded-md ${currentMessage.trim() ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}
            disabled={!currentMessage.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// ChatMessage component remains unchanged
const ChatMessage = ({ message, currentUser, isAdmin }) => {
  const isUserMessage = isAdmin 
    ? message.senderId !== (message.receiver?._id || message.receiverId)
    : message.sender?._id === currentUser?._id || message.sender === currentUser?._id || message.senderId === currentUser?._id;
  
  const isAI = message.aiAssisted || false;
  const messageText = message.text || message.content || '';
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const senderIsAdmin = message.sender?.role === 'admin';

  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] p-3 rounded-lg ${
          isUserMessage 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
        }`}
      >
        {isAI && (
          <div className="flex items-center mb-1 text-green-600 text-xs">
            <Bot size={12} className="mr-1" />
            AI Assistant
          </div>
        )}
        {!isUserMessage && !isAI && senderIsAdmin && (
          <div className="flex items-center mb-1 text-indigo-600 text-xs">
            <Shield size={12} className="mr-1" />
            Admin
          </div>
        )}
        <p>{messageText}</p>
        <p className={`text-xs mt-1 ${isUserMessage ? 'text-indigo-200' : 'text-gray-500'}`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
};

export default ChatArea;