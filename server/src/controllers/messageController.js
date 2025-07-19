// controllers/messageController.js
const { User, Message } = require("../models/index.js");
const { getReceiverSocketId, io } = require("../config/socket.js");

exports.getUsersList = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    const adminUser = {};
    const users = {};

    filteredUsers.forEach((user) => {
      if (user.role === "admin") {
        adminUser[user._id] = user;
      } else {
        users[user._id] = user;
      }
    });

    res.status(200).json({ adminUser, users });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.sendMessage = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;
//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//     });
//     await newMessage.save();

//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }
//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log("Error in sendMessage controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if receiverId exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    // Use try-catch block for socket operations to prevent failure
    try {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    } catch (socketError) {
      console.log("Socket notification error:", socketError.message);
      // Continue execution even if socket notification fails
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};