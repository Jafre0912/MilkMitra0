// import EmptyState from './components/EmptyState';
// import useChatStore from '../../../store/chatStore';
// import useAuthStore from '../../../store/authStore';
// import { useState, useEffect, useRef } from 'react';
// import ChatLayout from './components/ChatLayout';
// import ConversationList from './components/ConversationList';
// import ChatArea from './components/ChatArea';
// import toast from 'react-hot-toast';

// const UserChat = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messageEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const { user, onlineUsers } = useAuthStore();

//   const {
//     users: conversations,
//     selectedUser: currentConversation,
//     messages,
//     isUsersLoading,
//     isMessagesLoading,
//     getUsers,
//     getMessages,
//     sendMessage,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//     setTypingStatus,
//   } = useChatStore();

//   // Load users when component mounts
//   useEffect(() => {
//     getUsers().catch(err => {
//       console.error("Failed to fetch users:", err);
//       toast.error("Failed to load support agents");
//     });
    
//     // Cleanup when component unmounts
//     return () => {
//       unsubscribeFromMessages();
//       setSelectedUser(null);
//     };
//   }, [getUsers, unsubscribeFromMessages, setSelectedUser]);

//   // Setup message subscription when conversation changes
//   useEffect(() => {
//     if (currentConversation?._id) {
//       getMessages(currentConversation._id).catch(err => {
//         console.error("Failed to fetch messages:", err);
//         toast.error("Failed to load messages");
//       });
      
//       // Subscribe to new messages
//       subscribeToMessages();
//     }
    
//     // Cleanup subscription when conversation changes
//     return () => {
//       unsubscribeFromMessages();
//     };
//   }, [currentConversation, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const isAdminUser = (user) => {
//     if (!user) return false;
    
//     return (
//       user.role === 'admin' ||
//       user.isAdmin === true ||
//       user.userType === 'admin' ||
//       (user.roles && user.roles.includes('admin'))
//     );
//   };

//   // Filter conversations based on user role and search query
//   const filteredConversations = Array.isArray(conversations) 
//     ? conversations
//         .filter(conv => {
//           // If user is not admin, only show admin users
//           if (!isAdminUser(user)) {
//             return isAdminUser(conv) || conv.isAdmin === true;
//           }
//           return true; // Admin sees everyone
//         })
//         .filter(conv => {
//           const name = conv?.name || conv?.userName || '';
//           return name.toLowerCase().includes(searchQuery.toLowerCase());
//         })
//     : [];

//   console.log("Filtered conversations:", filteredConversations);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (currentMessage.trim() && currentConversation?._id) {
//       try {
//         await sendMessage({
//           text: currentMessage,
//           receiverId: currentConversation._id,
//         });
//         setCurrentMessage('');
//         // Stop typing indicator
//         handleStopTyping();
//       } catch (error) {
//         console.error("Send Message Error:", error);
//         toast.error("Failed to send message");
//       }
//     }
//   };

//   const handleInputChange = (e) => {
//     setCurrentMessage(e.target.value);
    
//     // Handle typing indicator
//     if (e.target.value) {
//       handleStartTyping();
//     } else {
//       handleStopTyping();
//     }
//   };

//   const handleStartTyping = () => {
//     if (!isTyping) {
//       setIsTyping(true);
//       setTypingStatus(true); // Notify server
//     }
    
//     // Clear existing timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
    
//     // Set new timeout
//     typingTimeoutRef.current = setTimeout(handleStopTyping, 3000);
//   };

//   const handleStopTyping = () => {
//     setIsTyping(false);
//     setTypingStatus(false); // Notify server
    
//     // Clear timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = null;
//     }
//   };

//   const handleInputBlur = () => {
//     handleStopTyping();
//   };

//   return (
//     <ChatLayout>
//       <ConversationList
//         conversations={filteredConversations}
//         currentUser={user}
//         currentConversation={currentConversation}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         handleUserClick={setSelectedUser}
//         isLoading={isUsersLoading}
//         title="Support Chat"
//         searchPlaceholder="Search support agents..."
//         onlineUsers={onlineUsers}
//       />

//       {currentConversation ? (
//         <ChatArea
//           conversation={currentConversation}
//           messages={messages}
//           currentUser={user}
//           isLoading={isMessagesLoading}
//           isTyping={useChatStore.getState().isTyping} // Get the latest typing state
//           currentMessage={currentMessage}
//           setCurrentMessage={setCurrentMessage}
//           handleSendMessage={handleSendMessage}
//           handleInputChange={handleInputChange}
//           handleInputBlur={handleInputBlur}
//           messageEndRef={messageEndRef}
//           onlineUsers={onlineUsers}
//         />
//       ) : (
//         <EmptyState
//           title="Select a support agent"
//           description="Choose a support agent to start chatting"
//         />
//       )}
//     </ChatLayout>
//   );
// };

// export default UserChat;

import EmptyState from './components/EmptyState';
import useChatStore from '../../../store/chatStore';
import useAuthStore from '../../../store/authStore';
import { useState, useEffect, useRef } from 'react';
import ChatLayout from './components/ChatLayout';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import toast from 'react-hot-toast';

const UserChat = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user, onlineUsers, refreshOnlineUsers } = useAuthStore();

  const {
    users: conversations,
    selectedUser: currentConversation,
    messages,
    isUsersLoading,
    isMessagesLoading,
    isTyping: otherIsTyping,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setTypingStatus,
    refreshUsers
  } = useChatStore();

  // Load users when component mounts and setup refresh interval
  useEffect(() => {
    // Initial fetch
    getUsers().catch(err => {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load support agents");
    });
    
    // Set up periodic refresh for users and online status
    const intervalId = setInterval(() => {
      refreshUsers();
    }, 30000); // Every 30 seconds
    
    // Cleanup when component unmounts
    return () => {
      clearInterval(intervalId);
      unsubscribeFromMessages();
      setSelectedUser(null);
    };
  }, [getUsers, unsubscribeFromMessages, setSelectedUser, refreshUsers]);

  // Force refresh online users status periodically
  useEffect(() => {
    const onlineStatusInterval = setInterval(() => {
      refreshOnlineUsers();
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(onlineStatusInterval);
  }, [refreshOnlineUsers]);

  // Setup message subscription when conversation changes
  useEffect(() => {
    if (currentConversation?._id) {
      getMessages(currentConversation._id).catch(err => {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load messages");
      });
      
      // Subscribe to new messages
      subscribeToMessages();
    }
    
    // Cleanup subscription when conversation changes
    return () => {
      unsubscribeFromMessages();
    };
  }, [currentConversation, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug online users
  useEffect(() => {
    console.log("Current online users in UserChat:", onlineUsers);
  }, [onlineUsers]);

  const isAdminUser = (user) => {
    if (!user) return false;
    
    return (
      user.role === 'admin' ||
      user.isAdmin === true ||
      user.userType === 'admin' ||
      (user.roles && user.roles.includes('admin'))
    );
  };

  // Filter conversations based on user role and search query
  const filteredConversations = Array.isArray(conversations) 
    ? conversations
        .filter(conv => {
          // If user is not admin, only show admin users
          if (!isAdminUser(user)) {
            return isAdminUser(conv) || conv.isAdmin === true;
          }
          return true; // Admin sees everyone
        })
        .filter(conv => {
          const name = conv?.name || conv?.userName || '';
          return name.toLowerCase().includes(searchQuery.toLowerCase());
        })
    : [];

  console.log("Filtered conversations:", filteredConversations);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() && currentConversation?._id) {
      try {
        await sendMessage({
          text: currentMessage,
          receiverId: currentConversation._id,
        });
        setCurrentMessage('');
        // Stop typing indicator
        handleStopTyping();
      } catch (error) {
        console.error("Send Message Error:", error);
        toast.error("Failed to send message");
      }
    }
  };

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value) {
      handleStartTyping();
    } else {
      handleStopTyping();
    }
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTypingStatus(true); // Notify server
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(handleStopTyping, 3000);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    setTypingStatus(false); // Notify server
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleInputBlur = () => {
    handleStopTyping();
  };
  
  // Manual refresh handler
  const handleRefresh = () => {
    refreshUsers();
    refreshOnlineUsers();
    toast.success("Refreshed support agents and online status");
  };

  return (
    <ChatLayout>
      <ConversationList
        conversations={filteredConversations}
        currentUser={user}
        currentConversation={currentConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleUserClick={setSelectedUser}
        isLoading={isUsersLoading}
        title="Support Chat"
        searchPlaceholder="Search support agents..."
        onlineUsers={onlineUsers}
      />

      {currentConversation ? (
        <ChatArea
          conversation={currentConversation}
          messages={messages}
          currentUser={user}
          isLoading={isMessagesLoading}
          isTyping={otherIsTyping}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
          messageEndRef={messageEndRef}
          onlineUsers={onlineUsers}
        />
      ) : (
        <EmptyState
          title="Select a support agent"
          description="Choose a support agent to start chatting"
        />
      )}
    </ChatLayout>
  );
};

export default UserChat;