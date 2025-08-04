const {NewsFeed} = require("../models");
const cloudinary = require("../config/cloudinary");
const upload = require("../utils/multer");

exports.uploadNewsPhoto = upload.single("photo");

// Get all news feed items
exports.getAllNews = async (req, res) => {
  try {
    const news = await NewsFeed.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get a single news feed item
exports.getNewsById = async (req, res) => {
  try {
    const news = await NewsFeed.findById(req.params.id);
   
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }
   
    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create a new news feed item
exports.createNews = async (req, res) => {
  try {
    // Parse tags if they exist
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }
    
    // Get Cloudinary URL from uploaded file
    if (req.file) {
      req.body.photo = req.file.path;
    }
    
    const news = await NewsFeed.create(req.body);
   
    res.status(201).json({
      success: true,
      data: news,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
   
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update a news feed item
exports.updateNews = async (req, res) => {
  try {
    // Get existing news item to check for photo updates
    const existingNews = await NewsFeed.findById(req.params.id);
    
    if (!existingNews) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }

    // Parse tags if they exist
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }
    
    // Handle photo update
    if (req.file) {
      // If there's a new file, we update the path
      req.body.photo = req.file.path;
      
      // Delete the old image from Cloudinary if it exists
      if (existingNews.photo && existingNews.photo.includes('cloudinary')) {
        const publicId = existingNews.photo.split('/').pop().split('.')[0];
        
        try {
          await cloudinary.uploader.destroy(`news_feed/${publicId}`);
        } catch (cloudinaryErr) {
          console.error('Failed to delete old image from Cloudinary:', cloudinaryErr);
        }
      }
    }
    
    const news = await NewsFeed.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
   
    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
   
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Delete a news feed item
exports.deleteNews = async (req, res) => {
  try {
    const news = await NewsFeed.findById(req.params.id);
   
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }
    
    // Delete image from Cloudinary
    if (news.photo && news.photo.includes('cloudinary')) {
      const publicId = news.photo.split('/').pop().split('.')[0];
      
      try {
        await cloudinary.uploader.destroy(`news_feed/${publicId}`);
      } catch (cloudinaryErr) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryErr);
      }
    }
    
    // Delete the news document
    await NewsFeed.findByIdAndDelete(req.params.id);
   
    res.status(200).json({
      success: true,
      message: "News item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get news by tag
exports.getNewsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const news = await NewsFeed.find({
      tags: tag,
      isActive: true
    }).sort({ createdAt: -1 });
   
    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};