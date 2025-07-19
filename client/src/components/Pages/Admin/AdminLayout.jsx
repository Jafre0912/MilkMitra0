import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  BarChart2,
  Settings,
  Menu,
  X,
  Map,
  ChevronDown,
  LogOut,
  User,
  Bell,
  MessageCircle,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";
import NotificationsDropdown from "../../UI/NotificationsDropdown";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { logout } = useAuthStore();
  const profileDropdownRef = useRef(null);

  const menuItems = [
    {
      path: "/admin",
      name: "Dashboard",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      path: "/admin/users",
      name: "User Management",
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: "/admin/milk-collection",
      name: "Milk Collection",
      icon: (
        <span className="w-5 h-5 flex items-center justify-center">🥛</span>
      ),
    },
    {
      path: "/admin/veterinary-doctors",
      name: "Veterinary Doctors",
      icon: <User className="w-5 h-5" />,
    },
    {
      path: "/admin/veterinary-locations",
      name: "Veterinary Locations",
      icon: <Map className="w-5 h-5" />,
    },
    {
      path: "/admin/news-alerts",
      name: "News & Alerts",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      path: "/admin/settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
    navigate("/auth/login");
  };

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    if (path !== "/admin" && location.pathname.includes(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-amber-600 to-amber-500 shadow-md z-40">
        <div className="flex justify-between items-center px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-amber-100 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-200"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="FarmFlow"
                className="h-10 w-auto mr-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
              <h1 className="text-xl font-bold text-white">FarmFlow</h1>
            </div>
          </div>

          {/* Right navigation */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsDropdown />

            {/* Profile dropdown */}
            <div className="relative ml-3" ref={profileDropdownRef}>
              <div>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-amber-300 flex items-center justify-center text-amber-800">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-white hidden sm:block">Admin</span>
                  <ChevronDown className="ml-1 h-4 w-4 text-amber-200 hidden sm:block" />
                </button>
              </div>

              {/* Profile dropdown panel */}
              {isProfileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-amber-200 focus:outline-none z-50">
                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0 z-10">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-white border-r border-amber-200">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-lg font-bold text-amber-800">
                    FarmFlow Admin
                  </h1>
                </div>
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                        isActive(item.path)
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      <div
                        className={`mr-3 ${
                          isActive(item.path)
                            ? "text-amber-500"
                            : "text-gray-400 group-hover:text-amber-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 flex z-40 md:hidden ${
            isSidebarOpen ? "block" : "hidden"
          }`}
        >
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={toggleSidebar}
          ></div>

          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-lg font-bold text-amber-800">
                  FarmFlow Admin
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive(item.path)
                        ? "bg-amber-100 text-amber-700"
                        : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                    onClick={toggleSidebar}
                  >
                    <div
                      className={`mr-4 ${
                        isActive(item.path)
                          ? "text-amber-500"
                          : "text-gray-400 group-hover:text-amber-500"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden z-0">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-amber-200 mt-auto">
            <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4 flex items-center justify-between">
                <div className="text-sm text-amber-700">
                  &copy; {new Date().getFullYear()} FarmFlow. All rights
                  reserved.
                </div>
                <div className="flex space-x-6">
                  <a
                    href="#"
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    Help Center
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
