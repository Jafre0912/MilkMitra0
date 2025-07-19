import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./../../shared/Navbar/Navbar";
import { Footer } from "./../../shared/Footer/Footer";
import Sidebar from "./../../shared/Sidebar/Sidebar";

function DashboardLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    window.innerWidth <= 1024
  );

  // Check for resize events to handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarCollapsed(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check for sidebar collapse/expand state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector("aside");
      if (sidebarElement) {
        const isCollapsed = sidebarElement.classList.contains("w-16");
        setIsSidebarCollapsed(isCollapsed);
      }
    };

    // Use a mutation observer to detect class changes on the sidebar
    const observer = new MutationObserver(checkSidebarState);
    const sidebarElement = document.querySelector("aside");

    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar is now self-contained with its own positioning */}
        <Sidebar />

        {/* Scrollable Content Area - Adaptive margin based on sidebar state */}
        <main
          className={`
            flex-1 transition-all duration-300 pt-2 pb-20 z-0
            ${isMobile ? "ml-0" : isSidebarCollapsed ? "ml-16" : "ml-64"}
          `}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30">
        <Footer />
      </footer>
    </div>
  );
}

export default DashboardLayout;
