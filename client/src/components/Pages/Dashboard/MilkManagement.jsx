import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiBarChart2,
  FiDroplet,
  FiTruck,
  FiRefreshCw,
  FiDownload,
  FiFilter,
} from "react-icons/fi";
import { Tab } from "@headlessui/react";
import MilkProduction from "./MilkProduction";
import MPPDashboard from "../MPP/MPPDashboard";
import useAuthStore from "../../../store/authStore";
import useMPPStore from "../../../store/mppStore";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MilkManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { milkCollections, filters, fetchMilkCollections } = useMPPStore();

  // Check if user is a farmer
  const isFarmer = user?.role === "farmer";

  // Initialize tab from URL query parameter (default to 0 if not provided)
  // For farmers, always default to tab 1 (Procurement & Processing)
  const initialTab = isFarmer
    ? 0
    : parseInt(searchParams.get("tab") || "0", 10);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when tab changes
  const handleTabChange = (index) => {
    setActiveTab(index);
    navigate(`/dashboard/milk-management?tab=${index}`, { replace: true });
  };

  // Set initial tab based on URL query parameter
  useEffect(() => {
    if (isFarmer) {
      // For farmers, always set to procurement (tab 0 since we only have one tab)
      setActiveTab(0);
    } else {
      const tabParam = parseInt(searchParams.get("tab") || "0", 10);
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, isFarmer]);

  // Export milk collection data to CSV
  const exportToCSV = () => {
    try {
      if (!milkCollections || milkCollections.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create CSV header
      let csv = "Date,Shift,Milk Type,Fat %,SNF %,Rate,Quantity,Total Amount\n";

      // Add rows
      milkCollections.forEach((collection) => {
        const date = new Date(collection.collectionDate)
          .toISOString()
          .split("T")[0];
        const shift =
          collection.shift.charAt(0).toUpperCase() + collection.shift.slice(1);
        const milkType =
          { C: "Cow", B: "Buffalo", M: "Mixed" }[collection.milkType] ||
          collection.milkType;

        csv += `${date},${shift},${milkType},${collection.fat.toFixed(
          1
        )},${collection.snf.toFixed(1)},${collection.rate.toFixed(
          2
        )},${collection.quantity.toFixed(1)},${collection.totalAmount.toFixed(
          2
        )}\n`;
      });

      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `milk_collections_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export completed");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Milk Management
        </h1>
        <p className="text-gray-600">
          {isFarmer
            ? "View your milk procurement records and processing details"
            : "Manage milk production from your cattle and milk procurement in one place"}
        </p>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
        <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm mb-6 border border-gray-200">
          {/* Only show Production tab for non-farmers */}
          {!isFarmer && (
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-3 text-sm font-medium leading-5",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                )
              }
            >
              <div className="flex items-center justify-center">
                <FiDroplet className="mr-2" />
                <span>Production</span>
              </div>
            </Tab>
          )}
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-3 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-700"
              )
            }
          >
            <div className="flex items-center justify-center">
              <FiTruck className="mr-2" />
              <span>Procurement & Processing</span>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          {/* Only render Production panel for non-farmers */}
          {!isFarmer && (
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow p-6">
                <MilkProduction embedded={true} />
              </div>
            </Tab.Panel>
          )}
          <Tab.Panel>
            {/* Export button for milk collection data */}
            <div className="flex justify-end mb-4">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiDownload className="mr-2" />
                Export to CSV
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <MPPDashboard embedded={true} />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default MilkManagement;
