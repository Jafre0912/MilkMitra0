import { useState, useEffect } from "react";
import { 
  FaUser, 
  FaEnvelope, 
  FaUserTie, 
  FaPhone, 
  FaSpinner, 
  FaBell,
  FaLock,
  FaHeadset
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import useAuthStore from "../../../store/authStore";
import SupportPopup from "../../UI/SupportPopup";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ProfileSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { user, fetchUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const isAdmin = user?.role === "admin";
  const [isSupportPopupOpen, setSupportPopupOpen] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    phoneNumber: "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    milkProductionAlerts: true,
    diseaseAlerts: true,
    financialReports: false
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Fetch profile data on component mount
  useEffect(() => {
    if (user) {
      console.log("User data loaded:", user);
      console.log("Phone number from user:", user.phoneNumber);
      
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Use the auth token from the store instead of localStorage
      const { token } = useAuthStore.getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      // Prepare profile data
      const profileUpdateData = {
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber || ""  // Ensure phoneNumber is always sent, even if empty
      };
      
      console.log("Sending profile update:", profileUpdateData);
      
      // Call the API with the correct endpoint
      const response = await axios.put(`${API_URL}/auth/update-me`, profileUpdateData, config);
      
      console.log("Profile update response:", response.data);
      
      if (response.data && response.data.data) {
        // Create a complete updated user object with all fields
        const updatedUser = response.data.data;
        
        console.log("Updated user from server:", updatedUser);
        
        // Update user data in auth store directly
        useAuthStore.getState().updateUserData(updatedUser);
        
        // Also update the local form state to match the server data
        setProfileData({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          role: updatedUser.role || "",
          phoneNumber: updatedUser.phoneNumber || ""
        });
        
        toast.success("Profile updated successfully!");
        return;
      }
    } catch (error) {
      console.error("Update profile error:", error);
      
      // Show error message with better fallback
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error ||
                         "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    
    // Fall back to local update if server update fails
    const updatedUserData = {
      ...user,
      ...profileData,  // This will include all profileData fields including phoneNumber
    };
    console.log("Updating user data locally:", updatedUserData);
    useAuthStore.getState().updateUserData(updatedUserData);
    toast.success("Profile updated locally");
  };

  // Handle notification settings update
  const handleUpdateNotifications = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Notification settings updated!");
    } catch (error) {
      toast.error("Failed to update notification settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);

    try {
      // Get token from auth store instead of localStorage
      const { token } = useAuthStore.getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      // Make the API call to change password
      const response = await axios.put(
        `${API_URL}/auth/change-password`, 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        config
      );
      
      // If we get here, the password was updated successfully
      toast.success("Password updated successfully!");
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Update token if needed
      if (response.data && response.data.token) {
        // Update token in auth store
        useAuthStore.getState().updateToken(response.data.token);
      }
    } catch (error) {
      console.error("Update password error:", error);
      
      // Show specific error message if available
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Support Popup */}
      <SupportPopup 
        isOpen={isSupportPopupOpen} 
        onClose={() => setSupportPopupOpen(false)} 
      />

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "profile"
              ? isAdmin ? "text-amber-600 border-b-2 border-amber-600" : "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <FaUser className="inline mr-2" /> Profile
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "notifications"
              ? isAdmin ? "text-amber-600 border-b-2 border-amber-600" : "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("notifications")}
        >
          <FaBell className="inline mr-2" /> Notifications
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "security"
              ? isAdmin ? "text-amber-600 border-b-2 border-amber-600" : "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("security")}
        >
          <FaLock className="inline mr-2" /> Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${isAdmin ? "border-t-4 border-amber-500" : ""}`}>
          <h2 className={`text-xl font-bold mb-6 ${isAdmin ? "text-amber-800" : "text-green-800"}`}>
            {isAdmin ? "Admin Profile Information" : "Profile Information"}
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Name Input */}
            <div className="form-group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role (Read-only) */}
            <div className="form-group">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={profileData.role}
                  readOnly
                  className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Role cannot be changed.</p>
            </div>

            {/* Phone Number Input */}
            <div className="form-group">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit and Support Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setSupportPopupOpen(true)}
                className={`px-4 py-2 border ${
                  isAdmin 
                    ? "border-amber-500 text-amber-700 hover:bg-amber-50" 
                    : "border-green-500 text-green-700 hover:bg-green-50"
                } rounded-lg 
                       focus:outline-none focus:ring-2 
                       focus:ring-offset-2 
                       ${isAdmin ? "focus:ring-amber-500" : "focus:ring-green-500"}
                       transition-colors duration-200
                       flex items-center space-x-2`}
              >
                <FaHeadset className="mr-2" />
                <span>Contact Support</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 ${
                  isAdmin 
                    ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500" 
                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                } text-white rounded-lg 
                       focus:outline-none focus:ring-2 
                       focus:ring-offset-2 
                       transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center space-x-2`}
              >
                {loading && <FaSpinner className="animate-spin" />}
                <span>{loading ? "Updating..." : "Update Profile"}</span>
              </button>
            </div>
          </form>
          
          {/* Help Message for Admin Profiles */}
          {isAdmin && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Admin Profile Help</h3>
              <p className="text-sm text-amber-700 mb-2">
                Having issues updating your admin profile? Our support team can help.
              </p>
              <button
                onClick={() => setSupportPopupOpen(true)}
                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
              >
                Contact support →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-green-800 mb-6">
            Notification Preferences
          </h2>

          <form onSubmit={handleUpdateNotifications} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    className="sr-only peer"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive alerts on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    className="sr-only peer"
                    checked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <hr className="my-4" />
              <h3 className="font-medium text-gray-800 mb-3">Alert Types</h3>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Milk Production Alerts</h3>
                  <p className="text-sm text-gray-500">Updates on milk production changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="milkProductionAlerts"
                    className="sr-only peer"
                    checked={notificationSettings.milkProductionAlerts}
                    onChange={handleNotificationChange}
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Disease Alerts</h3>
                  <p className="text-sm text-gray-500">Notifications about potential disease risks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="diseaseAlerts"
                    className="sr-only peer"
                    checked={notificationSettings.diseaseAlerts}
                    onChange={handleNotificationChange}
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Financial Reports</h3>
                  <p className="text-sm text-gray-500">Weekly and monthly financial summaries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="financialReports"
                    className="sr-only peer"
                    checked={notificationSettings.financialReports}
                    onChange={handleNotificationChange}
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg 
                         hover:bg-green-700 focus:outline-none focus:ring-2 
                         focus:ring-green-500 focus:ring-offset-2 
                         transition-colors duration-200
                         disabled:bg-green-400 disabled:cursor-not-allowed
                         flex items-center space-x-2"
              >
                {loading && <FaSpinner className="animate-spin" />}
                <span>{loading ? "Saving..." : "Save Notification Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-green-800 mb-6">
            Security Settings
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-4">
              <div className="form-group">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long.</p>
              </div>

              <div className="form-group">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg 
                         hover:bg-green-700 focus:outline-none focus:ring-2 
                         focus:ring-green-500 focus:ring-offset-2 
                         transition-colors duration-200
                         disabled:bg-green-400 disabled:cursor-not-allowed
                         flex items-center space-x-2"
              >
                {loading && <FaSpinner className="animate-spin" />}
                <span>{loading ? "Updating..." : "Change Password"}</span>
              </button>
            </div>
          </form>

          {/* Account Security Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Account Security</h3>
            <p className="text-sm text-gray-700 mb-3">
              Your account security is important to us. Make sure to use a strong, unique password and
              keep it secure.
            </p>
            <p className="text-sm text-gray-700">
              Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings; 