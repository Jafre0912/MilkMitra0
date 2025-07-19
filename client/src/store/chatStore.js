// // import { create } from "zustand";
// // import toast from "react-hot-toast";
// // import useAuthStore from "./authStore";

// // import axios from "axios";

// // export const axiosInstance = axios.create({
// //   baseURL: "http://localhost:5000/api",
// //   withCredentials: true,
// // });


// // const useChatStore = create((set, get) => ({
// //   messages: [],
// //   users: [],
// //   selectedUser: null,
// //   isUsersLoading: false,
// //   isMessagesLoading: false,

// //   getUsers: async () => {
// //     set({ isUsersLoading: true });
// //     try {
// //       const res = await axiosInstance.get("/messages/users");
// //       set({ users: res.data });
// //     } catch (error) {
// //       toast.error(error.response.data.message);
// //     } finally {
// //       set({ isUsersLoading: false });
// //     }
// //   },

// //   getMessages: async (userId) => {
// //     set({ isMessagesLoading: true });
// //     try {
// //       const res = await axiosInstance.get(`/messages/${userId}`);
// //       set({ messages: res.data });
// //     } catch (error) {
// //       toast.error(error.response.data.message);
// //     } finally {
// //       set({ isMessagesLoading: false });
// //     }
// //   },
// //   sendMessage: async (messageData) => {
// //     const { selectedUser, messages } = get();
// //     try {
// //       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
// //       set({ messages: [...messages, res.data] });
// //     } catch (error) {
// //       toast.error(error.response.data.message);
// //     }
// //   },

// //   subscribeToMessages: () => {
// //     const { selectedUser } = get();
// //     if (!selectedUser) return;

// //     const socket = useAuthStore.getState().socket;

// //     socket.on("newMessage", (newMessage) => {
// //       const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
// //       if (!isMessageSentFromSelectedUser) return;

// //       set({
// //         messages: [...get().messages, newMessage],
// //       });
// //     });
// //   },

// //   unsubscribeFromMessages: () => {
// //     const socket = useAuthStore.getState().socket;
// //     socket.off("newMessage");
// //   },

// //   setSelectedUser: (selectedUser) => set({ selectedUser }),
// // }));

// // export default useChatStore;


// import { create } from "zustand";
// import toast from "react-hot-toast";
// import useAuthStore from "./authStore";
// import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });

// // Add interceptor to handle auth token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const useChatStore = create((set, get) => ({
//   messages: [],
//   users: [],
//   selectedUser: null,
//   isUsersLoading: false,
//   isMessagesLoading: false,
//   isTyping: false,

//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const res = await axiosInstance.get("/messages/users");
//       console.log("API response for users:", res.data);
//       set({ users: res.data });
//       return res.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to fetch users";
//       toast.error(errorMsg);
//       console.error("Error fetching users:", error);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   getMessages: async (userId) => {
//     if (!userId) return;
    
//     set({ isMessagesLoading: true });
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       set({ messages: res.data });
//       return res.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to fetch messages";
//       toast.error(errorMsg);
//       console.error("Error fetching messages:", error);
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },

//   sendMessage: async (messageData) => {
//     const { selectedUser, messages } = get();
//     if (!selectedUser?._id) {
//       toast.error("No user selected for sending message");
//       return;
//     }

//     try {
//       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
//       set({ messages: [...messages, res.data] });
//       return res.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to send message";
//       toast.error(errorMsg);
//       console.error("Error sending message:", error);
//     }
//   },

//   subscribeToMessages: () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return;

//     const socket = useAuthStore.getState().socket;
//     if (!socket) {
//       console.warn("Socket connection not available");
//       return;
//     }

//     // Clean up any existing listeners first
//     socket.off("newMessage");
    
//     socket.on("newMessage", (newMessage) => {
//       // Check if message is from or to the selected user
//       const currentUserId = useAuthStore.getState().user?._id;
      
//       if (!currentUserId) return;
      
//       const isRelevantMessage = 
//         (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUserId) || 
//         (newMessage.senderId === currentUserId && newMessage.receiverId === selectedUser._id);
      
//       if (isRelevantMessage) {
//         set((state) => ({
//           messages: [...state.messages, newMessage]
//         }));
//       }
//     });

//     socket.on("userTyping", ({ userId, isTyping }) => {
//       if (userId === selectedUser._id) {
//         set({ isTyping });
//       }
//     });
//   },

//   unsubscribeFromMessages: () => {
//     const socket = useAuthStore.getState().socket;
//     if (socket) {
//       socket.off("newMessage");
//       socket.off("userTyping");
//     }
//   },

//   setSelectedUser: async (selectedUser) => {
//     // First unsubscribe from current messages
//     get().unsubscribeFromMessages();
    
//     // Update the selected user
//     set({ selectedUser, messages: [] });
    
//     // If we have a valid user, fetch their messages
//     if (selectedUser?._id) {
//       await get().getMessages(selectedUser._id);
//       // Now subscribe to new messages
//       get().subscribeToMessages();
//     }
//   },
  
//   // Add a method to handle user typing indicators
//   setTypingStatus: (isTyping) => {
//     const { selectedUser } = get();
//     const socket = useAuthStore.getState().socket;
    
//     if (socket && selectedUser?._id) {
//       socket.emit("userTyping", {
//         receiverId: selectedUser._id,
//         isTyping
//       });
//     }
//   },
  
//   // Clear messages when logging out
//   clearChatData: () => {
//     get().unsubscribeFromMessages();
//     set({
//       messages: [],
//       users: [],
//       selectedUser: null
//     });
//   }
// }));

// export default useChatStore;

// import { create } from "zustand";
// import toast from "react-hot-toast";
// import useAuthStore from "./authStore";
// import axios from "axios";

// export const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });

// // Add interceptor to handle auth token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const useChatStore = create((set, get) => ({
//   messages: [],
//   users: [],
//   selectedUser: null,
//   isUsersLoading: false,
//   isMessagesLoading: false,
//   isTyping: false,

//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const res = await axiosInstance.get("/messages/users");
//       console.log("API response for users:", res.data);
      
//       // Transform the object structure into an array
//       const usersArray = [];
      
//       // Add admin users
//       if (res.data.adminUser) {
//         Object.values(res.data.adminUser).forEach(admin => {
//           usersArray.push({
//             ...admin,
//             isAdmin: true // Add a flag to easily identify admins
//           });
//         });
//       }
      
//       // Add regular users
//       if (res.data.users) {
//         Object.values(res.data.users).forEach(user => {
//           usersArray.push(user);
//         });
//       }
      
//       console.log("Transformed users array:", usersArray);
//       set({ users: usersArray });
//       return usersArray;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to fetch users";
//       toast.error(errorMsg);
//       console.error("Error fetching users:", error);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   getMessages: async (userId) => {
//     if (!userId) return;
    
//     set({ isMessagesLoading: true });
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`);
//       set({ messages: res.data });
//       return res.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to fetch messages";
//       toast.error(errorMsg);
//       console.error("Error fetching messages:", error);
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },

//   sendMessage: async (messageData) => {
//     const { selectedUser, messages } = get();
//     if (!selectedUser?._id) {
//       toast.error("No user selected for sending message");
//       return;
//     }

//     try {
//       const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
//       set({ messages: [...messages, res.data] });
//       return res.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || "Failed to send message";
//       toast.error(errorMsg);
//       console.error("Error sending message:", error);
//     }
//   },

//   subscribeToMessages: () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return;

//     const socket = useAuthStore.getState().socket;
//     if (!socket) {
//       console.warn("Socket connection not available");
//       return;
//     }

//     // Clean up any existing listeners first
//     socket.off("newMessage");
    
//     socket.on("newMessage", (newMessage) => {
//       // Check if message is from or to the selected user
//       const currentUserId = useAuthStore.getState().user?._id;
      
//       if (!currentUserId) return;
      
//       const isRelevantMessage = 
//         (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUserId) || 
//         (newMessage.senderId === currentUserId && newMessage.receiverId === selectedUser._id);
      
//       if (isRelevantMessage) {
//         set((state) => ({
//           messages: [...state.messages, newMessage]
//         }));
//       }
//     });

//     socket.on("userTyping", ({ userId, isTyping }) => {
//       if (userId === selectedUser._id) {
//         set({ isTyping });
//       }
//     });
//   },

//   unsubscribeFromMessages: () => {
//     const socket = useAuthStore.getState().socket;
//     if (socket) {
//       socket.off("newMessage");
//       socket.off("userTyping");
//     }
//   },

//   setSelectedUser: async (selectedUser) => {
//     // First unsubscribe from current messages
//     get().unsubscribeFromMessages();
    
//     // Update the selected user
//     set({ selectedUser, messages: [] });
    
//     // If we have a valid user, fetch their messages
//     if (selectedUser?._id) {
//       await get().getMessages(selectedUser._id);
//       // Now subscribe to new messages
//       get().subscribeToMessages();
//     }
//   },
  
//   // Add a method to handle user typing indicators
//   setTypingStatus: (isTyping) => {
//     const { selectedUser } = get();
//     const socket = useAuthStore.getState().socket;
    
//     if (socket && selectedUser?._id) {
//       socket.emit("userTyping", {
//         receiverId: selectedUser._id,
//         isTyping
//       });
//     }
//   },
  
//   // Clear messages when logging out
//   clearChatData: () => {
//     get().unsubscribeFromMessages();
//     set({
//       messages: [],
//       users: [],
//       selectedUser: null
//     });
//   }
// }));

// export default useChatStore;


import { create } from "zustand";
import toast from "react-hot-toast";
import useAuthStore from "./authStore";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Add interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  lastUsersFetch: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log("API response for users:", res.data);
      
      // Transform the object structure into an array
      const usersArray = [];
      
      // Add admin users
      if (res.data.adminUser) {
        Object.values(res.data.adminUser).forEach(admin => {
          usersArray.push({
            ...admin,
            isAdmin: true // Add a flag to easily identify admins
          });
        });
      }
      
      // Add regular users
      if (res.data.users) {
        Object.values(res.data.users).forEach(user => {
          usersArray.push(user);
        });
      }
      
      console.log("Transformed users array:", usersArray);
      set({ 
        users: usersArray,
        lastUsersFetch: Date.now()  // Track when we last fetched users
      });
      
      // Refresh online users status after getting users
      useAuthStore.getState().refreshOnlineUsers();
      
      return usersArray;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch users";
      toast.error(errorMsg);
      console.error("Error fetching users:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch messages";
      toast.error(errorMsg);
      console.error("Error fetching messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) {
      toast.error("No user selected for sending message");
      return;
    }

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send message";
      toast.error(errorMsg);
      console.error("Error sending message:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket connection not available");
      return;
    }

    // Clean up any existing listeners first
    socket.off("newMessage");
    socket.off("userTyping");
    
    socket.on("newMessage", (newMessage) => {
      // Check if message is from or to the selected user
      const currentUserId = useAuthStore.getState().user?._id;
      
      if (!currentUserId) return;
      
      const isRelevantMessage = 
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUserId) || 
        (newMessage.senderId === currentUserId && newMessage.receiverId === selectedUser._id);
      
      if (isRelevantMessage) {
        set((state) => ({
          messages: [...state.messages, newMessage]
        }));
      }
    });

    socket.on("userTyping", ({ userId, isTyping }) => {
      if (userId === selectedUser._id) {
        set({ isTyping });
      }
    });
    
    // Request updated online users list when subscribing to messages
    socket.emit("getOnlineUsers");
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("userTyping");
    }
  },

  setSelectedUser: async (selectedUser) => {
    // First unsubscribe from current messages
    get().unsubscribeFromMessages();
    
    // Update the selected user
    set({ selectedUser, messages: [] });
    
    // If we have a valid user, fetch their messages
    if (selectedUser?._id) {
      await get().getMessages(selectedUser._id);
      // Now subscribe to new messages
      get().subscribeToMessages();
      
      // Request updated online users
      const socket = useAuthStore.getState().socket;
      if (socket?.connected) {
        socket.emit("getOnlineUsers");
      }
    }
  },
  
  // Add a method to handle user typing indicators
  setTypingStatus: (isTyping) => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    
    if (socket && selectedUser?._id) {
      socket.emit("userTyping", {
        receiverId: selectedUser._id,
        isTyping
      });
    }
  },
  
  // Clear messages when logging out
  clearChatData: () => {
    get().unsubscribeFromMessages();
    set({
      messages: [],
      users: [],
      selectedUser: null
    });
  },
  
  // Add method to refresh users periodically
  refreshUsers: async () => {
    const lastFetch = get().lastUsersFetch;
    const now = Date.now();
    
    // Only refresh if last fetch was more than 60 seconds ago
    if (!lastFetch || now - lastFetch > 60000) {
      await get().getUsers();
    }
    
    // Always refresh online status
    useAuthStore.getState().refreshOnlineUsers();
  }
}));

export default useChatStore;