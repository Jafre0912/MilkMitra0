import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";

/**
 * Component for redirecting to the appropriate milk management page based on user role
 * Farmers are redirected directly to the procurement tab
 * Non-farmers are redirected to the default milk management page (production tab)
 */
const MilkProductionRedirect = () => {
  const { user } = useAuthStore();

  // Check if user is a farmer
  const isFarmer = user?.role === "farmer";

  // Redirect based on role
  if (isFarmer) {
    // Farmers don't have access to the production tab, send them to procurement
    return <Navigate to="/dashboard/milk-management" replace />;
  } else {
    // For non-farmers, redirect to the default tab (production)
    return <Navigate to="/dashboard/milk-management?tab=0" replace />;
  }
};

export default MilkProductionRedirect;
