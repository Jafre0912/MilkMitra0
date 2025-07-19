// import { useState, useEffect, useRef } from 'react';
// import ChatLayout from './components/ChatLayout';
// import ConversationList from './components/ConversationList';
// import ChatArea from './components/ChatArea';
// import EmptyState from './components/EmptyState';
// import useChatStore from '../../../store/chatStore';
// import useAuthStore from '../../../store/authStore';
// import toast from 'react-hot-toast';

// const AdminChat = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messageEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const { user, onlineUsers } = useAuthStore();

//   const {
//     users,
//     selectedUser,
//     messages,
//     isUsersLoading,
//     isMessagesLoading,
//     isTyping: userIsTyping,
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
//       toast.error("Failed to load users");
//     });
    
//     // Cleanup when component unmounts
//     return () => {
//       unsubscribeFromMessages();
//       setSelectedUser(null);
//     };
//   }, [getUsers, unsubscribeFromMessages, setSelectedUser]);

//   // Setup message subscription when selected user changes
//   useEffect(() => {
//     if (selectedUser?._id) {
//       getMessages(selectedUser._id).catch(err => {
//         console.error("Failed to fetch messages:", err);
//         toast.error("Failed to load messages");
//       });
      
//       // Subscribe to new messages
//       subscribeToMessages();
//     }
    
//     // Cleanup subscription when selected user changes
//     return () => {
//       unsubscribeFromMessages();
//     };
//   }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Filter users: Admin should see all non-admin users
//   const filteredUsers = Array.isArray(users)
//     ? users.filter(user => 
//         user?.role !== 'admin' && 
//         !user?.isAdmin &&
//         (user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : [];

//   console.log("Filtered users for admin:", filteredUsers);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (currentMessage.trim() && selectedUser?._id) {
//       try {
//         await sendMessage({
//           text: currentMessage,
//           receiverId: selectedUser._id,
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
//         conversations={filteredUsers}
//         currentUser={user}
//         currentConversation={selectedUser}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         handleUserClick={setSelectedUser}
//         isLoading={isUsersLoading}
//         title="Customer Chat"
//         searchPlaceholder="Search users..."
//         onlineUsers={onlineUsers}
//       />

//       {selectedUser ? (
//         <ChatArea
//           conversation={selectedUser}
//           messages={messages}
//           currentUser={user}
//           isLoading={isMessagesLoading}
//           isTyping={userIsTyping}
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
//           title="Select a user"
//           description="Choose a user to start chatting"
//         />
//       )}
//     </ChatLayout>
//   );
// };

// export default AdminChat;


import { useState, useEffect, useRef } from 'react';
import ChatLayout from './components/ChatLayout';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import EmptyState from './components/EmptyState';
import useChatStore from '../../../store/chatStore';
import useAuthStore from '../../../store/authStore';
import toast from 'react-hot-toast';

const AdminChat = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user, onlineUsers, refreshOnlineUsers } = useAuthStore();

  const {
    users,
    selectedUser,
    messages,
    isUsersLoading,
    isMessagesLoading,
    isTyping: userIsTyping,
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
      toast.error("Failed to load users");
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

  // Setup message subscription when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id).catch(err => {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load messages");
      });
      
      // Subscribe to new messages
      subscribeToMessages();
    }
    
    // Cleanup subscription when selected user changes
    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug online users
  useEffect(() => {
    console.log("Current online users in AdminChat:", onlineUsers);
  }, [onlineUsers]);

  // Filter users: Admin should see all non-admin users
  const filteredUsers = Array.isArray(users)
    ? users.filter(user => 
        user?.role !== 'admin' && 
        !user?.isAdmin &&
        (user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  console.log("Filtered users for admin:", filteredUsers);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() && selectedUser?._id) {
      try {
        await sendMessage({
          text: currentMessage,
          receiverId: selectedUser._id,
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
    toast.success("Refreshed user list and online status");
  };

  return (
    <ChatLayout>
      <ConversationList
        conversations={filteredUsers}
        currentUser={user}
        currentConversation={selectedUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleUserClick={setSelectedUser}
        isLoading={isUsersLoading}
        title="Customer Chat"
        searchPlaceholder="Search users..."
        onlineUsers={onlineUsers}
      />

      {selectedUser ? (
        <ChatArea
          conversation={selectedUser}
          messages={messages}
          currentUser={user}
          isLoading={isMessagesLoading}
          isTyping={userIsTyping}
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
          title="Select a user"
          description="Choose a user to start chatting"
        />
      )}
    </ChatLayout>
  );
};

export default AdminChat;