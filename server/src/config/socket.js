// const { Server } = require("socket.io");

// const userSocketMap = {};

// function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// function initSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     const userId = socket.handshake.query.userId;
//     if (userId) userSocketMap[userId] = socket.id;

//     io.emit("getOnlineUsers", Object.keys(userSocketMap));

//     socket.on("disconnect", () => {
//       console.log("A user disconnected", socket.id);
//       delete userSocketMap[userId];
//       io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
//   });

//   console.log("Socket.io server initialized and ready");

//   return { io };
// }

// module.exports = { initSocket, getReceiverSocketId };

const { Server } = require("socket.io");

const userSocketMap = {};

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // Broadcast to all clients the updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle typing status
    socket.on("userTyping", ({ receiverId, isTyping }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId,
          isTyping
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      
      // Remove user from online users map
      if (userId) {
        delete userSocketMap[userId];
        // Broadcast updated online users list
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });

  console.log("Socket.io server initialized and ready");

  return { io, getReceiverSocketId };
}

module.exports = { initSocket, getReceiverSocketId };

// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

// const userSocketMap = {};

// function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// function initSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   // Middleware to authenticate socket connections
//   io.use((socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) {
//         return next(new Error("Authentication error"));
//       }
      
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.userId;
//       next();
//     } catch (error) {
//       next(new Error("Authentication error"));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("A user connected", socket.id);

//     socket.on("join", (userId) => {
//       userSocketMap[userId] = socket.id;
//       io.emit("userOnline", userId);
      
//       // Send list of online users to the newly connected client
//       socket.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });

//     socket.on("sendMessage", (message) => {
//       const receiverSocketId = getReceiverSocketId(message.receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("receiveMessage", message);
//       }
//     });

//     socket.on("typing", ({ receiverId, isTyping }) => {
//       const receiverSocketId = getReceiverSocketId(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("userTyping", {
//           userId: socket.userId,
//           isTyping
//         });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("A user disconnected", socket.id);
      
//       // Find which user this socket belonged to
//       const userId = Object.keys(userSocketMap).find(
//         key => userSocketMap[key] === socket.id
//       );
      
//       if (userId) {
//         delete userSocketMap[userId];
//         io.emit("userOffline", userId);
//       }
      
//       // Broadcast updated online users list
//       io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
//   });

//   console.log("Socket.io server initialized and ready");

//   return { io };
// }

// module.exports = { initSocket, getReceiverSocketId };