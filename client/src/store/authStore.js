// // import { create } from "zustand";
// // import { persist } from "zustand/middleware";
// // import axios from "axios";

// // const API_URL = "http://localhost:5000/api";

// // // Create axios instance with defaults
// // const api = axios.create({
// //   baseURL: API_URL,
// //   withCredentials: true, // Important for cookies
// // });

// // // Request interceptor
// // api.interceptors.request.use(
// //   (config) => {
// //     const state = useAuthStore.getState();
// //     if (state.token) {
// //       config.headers["Authorization"] = `Bearer ${state.token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // const useAuthStore = create(
// //   persist(
// //     (set, get) => ({
// //       user: null,
// //       token: null,
// //       loading: false,
// //       error: null,
// //       isAuthenticated: false,
// //       lastTokenValidation: null, // Track when we last validated the token

// //       // Login action
// //       login: async (email, password) => {
// //         set({ loading: true, error: null });

// //         try {
// //           const response = await api.post("/auth/login", { email, password });

// //           const { token, user } = response.data;
          
// //           if (!user || !user.role) {
// //             throw new Error("Incomplete user data received from server");
// //           }

// //           // Set auth header for future requests
// //           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
// //           api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// //           set({
// //             user,
// //             token,
// //             isAuthenticated: true,
// //             loading: false,
// //             error: null,
// //             lastTokenValidation: Date.now(),
// //           });

// //           return { success: true, user };
// //         } catch (err) {
// //           const errorMessage =
// //             err.response?.data?.error ||
// //             err.response?.data?.message ||
// //             err.message ||
// //             "Login failed";

// //           set({ error: errorMessage, loading: false });
// //           throw new Error(errorMessage);
// //         }
// //       },

// //       // Register action
// //       register: async (formData) => {
// //         set({ loading: true, error: null });

// //         try {
// //           const response = await api.post("/auth/register", formData);

// //           const { token, user } = response.data;

// //           // Set auth header for future requests
// //           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
// //           api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// //           set({
// //             user,
// //             token,
// //             isAuthenticated: true,
// //             loading: false,
// //             error: null,
// //             lastTokenValidation: Date.now(),
// //           });

// //           return { success: true, user };
// //         } catch (err) {
// //           const errorMessage =
// //             err.response?.data?.error ||
// //             err.response?.data?.message ||
// //             err.message ||
// //             "Registration failed";

// //           set({ error: errorMessage, loading: false });
// //           throw new Error(errorMessage);
// //         }
// //       },

// //       // Logout action
// //       logout: async () => {
// //         set({ loading: true });

// //         try {
// //           // Clean up state first to ensure we logout even if server request fails
// //           set({
// //             user: null,
// //             token: null,
// //             isAuthenticated: false,
// //             loading: false,
// //             error: null,
// //             lastTokenValidation: null,
// //           });

// //           // Remove auth header
// //           delete axios.defaults.headers.common["Authorization"];
// //           delete api.defaults.headers.common["Authorization"];

// //           // Call logout endpoint but don't wait for it
// //           api.get("/auth/logout").catch((err) => {
// //             console.warn("Logout notification failed:", err.message);
// //           });

// //           return { success: true };
// //         } catch (err) {
// //           console.error("Logout error:", err);
// //           return { success: true }; // Still consider logout successful
// //         }
// //       },

// //       // Fetch current user
// //       fetchUser: async () => {
// //         const { token, lastTokenValidation } = get();
// //         if (!token) return null;
        
// //         // Skip validation if we recently validated (within 5 minutes)
// //         const VALIDATION_THRESHOLD = 5 * 60 * 1000; // 5 minutes
// //         if (
// //           lastTokenValidation && 
// //           Date.now() - lastTokenValidation < VALIDATION_THRESHOLD
// //         ) {
// //           return get().user;
// //         }

// //         set({ loading: true });

// //         try {
// //           // Ensure token is in headers
// //           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
// //           api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// //           const response = await api.get("/auth/me");
          
// //           if (!response.data?.data) {
// //             throw new Error("Invalid user data received from server");
// //           }
          
// //           console.log("Received user data:", response.data.data);
          
// //           // Check if returned user has a role
// //           if (!response.data.data.role) {
// //             console.warn("User data missing role: ", response.data.data);
// //           }

// //           set({
// //             user: response.data.data,
// //             isAuthenticated: true,
// //             loading: false,
// //             lastTokenValidation: Date.now(),
// //           });

// //           return response.data.data;
// //         } catch (err) {
// //           console.error("Fetch user error:", err);
          
// //           if (err.response?.status === 401) {
// //             // Token invalid, clean up
// //             set({
// //               user: null,
// //               token: null,
// //               isAuthenticated: false,
// //               loading: false,
// //               error: null,
// //               lastTokenValidation: null,
// //             });
            
// //             delete axios.defaults.headers.common["Authorization"];
// //             delete api.defaults.headers.common["Authorization"];
// //           } else {
// //             set({ loading: false });
// //           }
          
// //           return null;
// //         }
// //       },

// //       // Clear error action
// //       clearError: () => set({ error: null }),
      
// //       // Force update user data (useful after role changes)
// //       updateUserData: (userData) => {
// //         if (!userData) return;
        
// //         const updatedUser = { ...get().user, ...userData };
        
// //         // Save to localStorage to ensure persistence
// //         set({
// //           user: updatedUser,
// //           lastTokenValidation: Date.now(),
// //         });
        
// //         return updatedUser;
// //       },
      
// //       // Update token (useful after password change)
// //       updateToken: (newToken) => {
// //         if (!newToken) return;
        
// //         // Update token in state
// //         set((state) => ({
// //           token: newToken,
// //           lastTokenValidation: Date.now(),
// //         }));
        
// //         // Update auth headers
// //         axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
// //         api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
// //       }
// //     }),
// //     {
// //       name: "auth-storage",
// //       partialize: (state) => ({
// //         user: state.user,
// //         token: state.token,
// //         isAuthenticated: state.isAuthenticated,
// //         lastTokenValidation: state.lastTokenValidation,
// //       }),
// //       onRehydrateStorage: () => (state) => {
// //         // Initialize auth header after storage is rehydrated
// //         if (state?.token) {
// //           axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
// //           api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
          
// //           // Verify token validity
// //           state.fetchUser();
// //         }
// //       },
// //     }
// //   )
// // );

// // export default useAuthStore;


// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import axios from "axios";
// import { io } from "socket.io-client";

// const API_URL = "http://localhost:5000/api";
// const BASE_URL = "http://localhost:5000"; 

// // Create a store reference variable for the interceptor to access
// let storeRef = null;

// // Create axios instance with defaults
// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // Important for cookies
// });

// // Request interceptor - will be updated after store creation
// api.interceptors.request.use(
//   (config) => {
//     // Use the store reference instead of directly accessing the store
//     if (storeRef?.getState().token) {
//       config.headers["Authorization"] = `Bearer ${storeRef.getState().token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       user: null,
//       token: null,
//       loading: false,
//       error: null,
//       isAuthenticated: false,
//       lastTokenValidation: null, // Track when we last validated the token
//       isCheckingAuth: true,
//       onlineUsers: [],
//       socket: null,

//       checkAuth: async () => {
//         try {
//           const res = await api.get("/auth/check");
    
//           set({ user: res.data }); // Changed from authUser to user
//           get().connectSocket();
//         } catch (error) {
//           console.log("Error in checkAuth:", error);
//           set({ user: null });
//         } finally {
//           set({ isCheckingAuth: false });
//         }
//       },

//       // Login action
//       login: async (email, password) => {
//         set({ loading: true, error: null });

//         try {
//           const response = await api.post("/auth/login", { email, password });

//           const { token, user } = response.data;
          
//           if (!user || !user.role) {
//             throw new Error("Incomplete user data received from server");
//           }

//           // Set auth header for future requests
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//           api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             loading: false,
//             error: null,
//             lastTokenValidation: Date.now(),
//           });
//           get().connectSocket();

//           return { success: true, user };
//         } catch (err) {
//           const errorMessage =
//             err.response?.data?.error ||
//             err.response?.data?.message ||
//             err.message ||
//             "Login failed";

//           set({ error: errorMessage, loading: false });
//           throw new Error(errorMessage);
//         }
//       },

//       // Register action
//       register: async (formData) => {
//         set({ loading: true, error: null });

//         try {
//           const response = await api.post("/auth/register", formData);

//           const { token, user } = response.data;

//           // Set auth header for future requests
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//           api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             loading: false,
//             error: null,
//             lastTokenValidation: Date.now(),
//           });

//           get().connectSocket();

//           return { success: true, user };
//         } catch (err) {
//           const errorMessage =
//             err.response?.data?.error ||
//             err.response?.data?.message ||
//             err.message ||
//             "Registration failed";

//           set({ error: errorMessage, loading: false });
//           throw new Error(errorMessage);
//         }
//       },

//       // Logout action
//       logout: async () => {
//         set({ loading: true });

//         try {
//           // Clean up state first to ensure we logout even if server request fails
//           set({
//             user: null,
//             token: null,
//             isAuthenticated: false,
//             loading: false,
//             error: null,
//             lastTokenValidation: null,
//           });

//           // Remove auth header
//           delete axios.defaults.headers.common["Authorization"];
//           delete api.defaults.headers.common["Authorization"];

//           // Call logout endpoint but don't wait for it
//           api.get("/auth/logout").catch((err) => {
//             console.warn("Logout notification failed:", err.message);
//           });

//           get().disconnectSocket();

//           return { success: true };
//         } catch (err) {
//           console.error("Logout error:", err);
//           return { success: true }; // Still consider logout successful
//         }
//       },

//       // Fetch current user
//       fetchUser: async () => {
//         const { token, lastTokenValidation } = get();
//         if (!token) return null;
        
//         // Skip validation if we recently validated (within 5 minutes)
//         const VALIDATION_THRESHOLD = 5 * 60 * 1000; // 5 minutes
//         if (
//           lastTokenValidation && 
//           Date.now() - lastTokenValidation < VALIDATION_THRESHOLD
//         ) {
//           return get().user;
//         }

//         set({ loading: true });

//         try {
//           // Ensure token is in headers
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//           api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//           const response = await api.get("/auth/me");
          
//           if (!response.data?.data) {
//             throw new Error("Invalid user data received from server");
//           }
          
//           console.log("Received user data:", response.data.data);
          
//           // Check if returned user has a role
//           if (!response.data.data.role) {
//             console.warn("User data missing role: ", response.data.data);
//           }

//           set({
//             user: response.data.data,
//             isAuthenticated: true,
//             loading: false,
//             lastTokenValidation: Date.now(),
//           });

//           return response.data.data;
//         } catch (err) {
//           console.error("Fetch user error:", err);
          
//           if (err.response?.status === 401) {
//             // Token invalid, clean up
//             set({
//               user: null,
//               token: null,
//               isAuthenticated: false,
//               loading: false,
//               error: null,
//               lastTokenValidation: null,
//             });
            
//             delete axios.defaults.headers.common["Authorization"];
//             delete api.defaults.headers.common["Authorization"];
//           } else {
//             set({ loading: false });
//           }
          
//           return null;
//         }
//       },

//       // Clear error action
//       clearError: () => set({ error: null }),
      
//       // Force update user data (useful after role changes)
//       updateUserData: (userData) => {
//         if (!userData) return;
        
//         const updatedUser = { ...get().user, ...userData };
        
//         // Save to localStorage to ensure persistence
//         set({
//           user: updatedUser,
//           lastTokenValidation: Date.now(),
//         });
        
//         return updatedUser;
//       },
      
//       // Update token (useful after password change)
//       updateToken: (newToken) => {
//         if (!newToken) return;
        
//         // Update token in state
//         set({
//           token: newToken,
//           lastTokenValidation: Date.now(),
//         });
        
//         // Update auth headers
//         axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//         api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//       },

//       connectSocket: () => {
//         const { user } = get();
//         if (!user || get().socket?.connected) return;
    
//         const socket = io(BASE_URL, {
//           query: {
//             userId: user._id,
//           },
//         });
//         socket.connect();
    
//         set({ socket: socket });
    
//         socket.on("getOnlineUsers", (userIds) => {
//           set({ onlineUsers: userIds });
//         });
//       },
//       disconnectSocket: () => {
//         if (get().socket?.connected) get().socket.disconnect();
//       },
//     }),
//     {
//       name: "auth-storage",
//       partialize: (state) => ({
//         user: state.user,
//         token: state.token,
//         isAuthenticated: state.isAuthenticated,
//         lastTokenValidation: state.lastTokenValidation,
//       }),
//       onRehydrateStorage: () => (state) => {
//         // Initialize auth header after storage is rehydrated
//         if (state?.token) {
//           axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
//           api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
          
//           // Verify token validity
//           state.fetchUser();
//         }
//       },
//     }
//   )
// );

// // Update the store reference after creation
// storeRef = useAuthStore;

// export default useAuthStore;



import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5000"; 

// Create a store reference variable for the interceptor to access
let storeRef = null;

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor - will be updated after store creation
api.interceptors.request.use(
  (config) => {
    // Use the store reference instead of directly accessing the store
    if (storeRef?.getState().token) {
      config.headers["Authorization"] = `Bearer ${storeRef.getState().token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      lastTokenValidation: null, // Track when we last validated the token
      isCheckingAuth: true,
      onlineUsers: [], // Array of user IDs that are online
      socket: null,

      checkAuth: async () => {
        try {
          const res = await api.get("/auth/check");
    
          set({ user: res.data }); // Changed from authUser to user
          get().connectSocket();
        } catch (error) {
          console.log("Error in checkAuth:", error);
          set({ user: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      // Login action
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/login", { email, password });

          const { token, user } = response.data;
          
          if (!user || !user.role) {
            throw new Error("Incomplete user data received from server");
          }

          // Set auth header for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            lastTokenValidation: Date.now(),
          });
          
          // Connect socket after login is complete and user is set
          setTimeout(() => get().connectSocket(), 500);

          return { success: true, user };
        } catch (err) {
          const errorMessage =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Login failed";

          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Register action
      register: async (formData) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/register", formData);

          const { token, user } = response.data;

          // Set auth header for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            lastTokenValidation: Date.now(),
          });

          // Connect socket after registration is complete
          setTimeout(() => get().connectSocket(), 500);

          return { success: true, user };
        } catch (err) {
          const errorMessage =
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Registration failed";

          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Logout action
      logout: async () => {
        set({ loading: true });

        try {
          // Disconnect socket first to ensure clean disconnect
          get().disconnectSocket();
          
          // Clean up state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            lastTokenValidation: null,
            onlineUsers: [], // Clear online users on logout
          });

          // Remove auth header
          delete axios.defaults.headers.common["Authorization"];
          delete api.defaults.headers.common["Authorization"];

          // Call logout endpoint but don't wait for it
          api.get("/auth/logout").catch((err) => {
            console.warn("Logout notification failed:", err.message);
          });

          return { success: true };
        } catch (err) {
          console.error("Logout error:", err);
          return { success: true }; // Still consider logout successful
        }
      },

      // Fetch current user
      fetchUser: async () => {
        const { token, lastTokenValidation } = get();
        if (!token) return null;
        
        // Skip validation if we recently validated (within 5 minutes)
        const VALIDATION_THRESHOLD = 5 * 60 * 1000; // 5 minutes
        if (
          lastTokenValidation && 
          Date.now() - lastTokenValidation < VALIDATION_THRESHOLD
        ) {
          return get().user;
        }

        set({ loading: true });

        try {
          // Ensure token is in headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const response = await api.get("/auth/me");
          
          if (!response.data?.data) {
            throw new Error("Invalid user data received from server");
          }
          
          console.log("Received user data:", response.data.data);
          
          // Check if returned user has a role
          if (!response.data.data.role) {
            console.warn("User data missing role: ", response.data.data);
          }

          set({
            user: response.data.data,
            isAuthenticated: true,
            loading: false,
            lastTokenValidation: Date.now(),
          });

          // Make sure socket is connected after user fetch
          get().connectSocket();

          return response.data.data;
        } catch (err) {
          console.error("Fetch user error:", err);
          
          if (err.response?.status === 401) {
            // Token invalid, clean up
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              error: null,
              lastTokenValidation: null,
            });
            
            delete axios.defaults.headers.common["Authorization"];
            delete api.defaults.headers.common["Authorization"];
            
            // Disconnect socket on auth failure
            get().disconnectSocket();
          } else {
            set({ loading: false });
          }
          
          return null;
        }
      },

      // Clear error action
      clearError: () => set({ error: null }),
      
      // Force update user data (useful after role changes)
      updateUserData: (userData) => {
        if (!userData) return;
        
        const updatedUser = { ...get().user, ...userData };
        
        // Save to localStorage to ensure persistence
        set({
          user: updatedUser,
          lastTokenValidation: Date.now(),
        });
        
        return updatedUser;
      },
      
      // Update token (useful after password change)
      updateToken: (newToken) => {
        if (!newToken) return;
        
        // Update token in state
        set({
          token: newToken,
          lastTokenValidation: Date.now(),
        });
        
        // Update auth headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      },

      connectSocket: () => {
        const { user, socket } = get();
        
        // Exit if no user or socket already connected
        if (!user || socket?.connected) return;
        
        console.log("Attempting to connect socket for user:", user._id);
        
        // Disconnect existing socket if any
        if (socket) {
          socket.disconnect();
        }
    
        // Create new socket connection
        const newSocket = io(BASE_URL, {
          query: {
            userId: user._id,
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
        });
        
        // Set socket before connecting to ensure we capture events
        set({ socket: newSocket });
        
        // Connect socket
        newSocket.connect();
        
        // Debug connection status
        newSocket.on('connect', () => {
          console.log("Socket connected successfully");
        });
        
        newSocket.on('connect_error', (error) => {
          console.error("Socket connection error:", error);
        });
    
        // Handle online users updates
        newSocket.on("getOnlineUsers", (userIds) => {
          console.log("Received online users:", userIds);
          set({ onlineUsers: userIds });
        });
        
        // Request initial online users list
        newSocket.emit("getOnlineUsers");
        
        return newSocket;
      },
      
      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          console.log("Disconnecting socket");
          socket.disconnect();
          set({ socket: null });
        }
      },
      
      // Add method to manually refresh online users
      refreshOnlineUsers: () => {
        const { socket } = get();
        if (socket?.connected) {
          socket.emit("getOnlineUsers");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastTokenValidation: state.lastTokenValidation,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize auth header after storage is rehydrated
        if (state?.token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
          api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
          
          // Verify token validity and reconnect socket
          setTimeout(() => {
            state.fetchUser().then(() => {
              state.connectSocket();
            });
          }, 1000);
        }
      },
    }
  )
);

// Update the store reference after creation
storeRef = useAuthStore;

export default useAuthStore;