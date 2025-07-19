const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
require("dotenv").config();

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    const server = http.createServer(app);
    const { io } = initSocket(server);
    global._io = io;

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
