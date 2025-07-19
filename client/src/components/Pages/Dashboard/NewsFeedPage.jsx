import React from "react";
import { Link } from "react-router-dom";
import NewsFeed from "../../Dashboard/NewsFeed";
import { FaArrowLeft } from "react-icons/fa";

const NewsFeedPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Link
          to="/dashboard"
          className="flex items-center text-green-600 hover:text-green-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Farmers' Newsfeed & Seasonal Alerts
        </h1>
        <p className="text-gray-600 mt-1">
          Stay updated with the latest industry trends, disease outbreaks, and
          seasonal risks for better farm management
        </p>
      </div>

      <NewsFeed />
    </div>
  );
};

export default NewsFeedPage;
