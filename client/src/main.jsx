import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoutesFromElements, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import Layout from "./Layout";
import AuthLayout from "./components/Pages/Auth/AuthLayout";
import DashboardLayout from "./components/Pages/Dashboard/DashBoardLayout";
import AdminLayout from "./components/Pages/Admin/AdminLayout";
import Home from "./components/Pages/Home/Home";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";
import Dashboard from "./components/Pages/Dashboard/Dashboard";
import Cattle from "./components/Pages/Dashboard/Cattle/Cattle";
import CattleDetails from "./components/Pages/Dashboard/Cattle/ViewCattleDetails";
import EditCattle from "./components/Pages/Dashboard/Cattle/EditCattle";
import DiseasePrediction from "./components/Pages/Disease/DiseasePrediction";
import PredictionHistory from "./components/Pages/Disease/PredictionHistory";
import PredictionDetail from "./components/Pages/Disease/PredictionDetail";
import MilkManagement from "./components/Pages/Dashboard/MilkManagement";
import VeterinaryServices from "./components/Pages/Dashboard/VeterinaryServices";
import Finance from "./components/Pages/Dashboard/Finance";
import AdminDashboard from "./components/Pages/Admin/AdminDashboard";
import UserManagement from "./components/Pages/Admin/UserManagement";
import VeterinaryLocations from "./components/Pages/Admin/VeterinaryLocations";
import VeterinaryDoctors from "./components/Pages/Admin/VeterinaryDoctors";
import FarmerMilkTransactions from "./components/Pages/Admin/FarmerMilkTransactions";
import NewsAlertManagement from "./components/Pages/Admin/NewsAlertManagement";
import AdminMilkCollection from "./components/Pages/Admin/MilkCollection";
import NewsFeedPage from "./components/Pages/Dashboard/NewsFeedPage";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import HomeRedirect from "./components/HomeRedirect";
import ProfileSettings from "./components/Pages/Profile/ProfileSettings";
import MilkProductionRedirect from "./components/Pages/Dashboard/MilkProductionRedirect";
import UserChat from "./components/shared/Chat/UserChat"; 
import AdminChat from "./components/shared/Chat/AdminChat";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="home" element={<Home />} />
      </Route>

      {/* Auth Routes */}
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/cattle" element={<Cattle />} />
          <Route path="/dashboard/cattle/:id" element={<CattleDetails />} />
          <Route path="/dashboard/cattle/edit/:id" element={<EditCattle />} />
          <Route
            path="dashboard/milk-management"
            element={<MilkManagement />}
          />
          <Route path="dashboard/finance" element={<Finance />} />
          <Route
            path="dashboard/disease-prediction"
            element={<DiseasePrediction />}
          />
          <Route
            path="dashboard/disease-history"
            element={<PredictionHistory />}
          />
          <Route
            path="/dashboard/disease-prediction-detail/:id"
            element={<PredictionDetail />}
          />
          <Route
            path="dashboard/veterinary-services"
            element={<VeterinaryServices />}
          />
          <Route
            path="dashboard/profile-settings"
            element={<ProfileSettings />}
          />

          <Route path="dashboard/support" element={<UserChat />} /> 

          {/* Redirect old profile and settings routes to the new combined page */}
          <Route
            path="dashboard/profile"
            element={<Navigate to="/dashboard/profile-settings" replace />}
          />
          <Route
            path="dashboard/settings"
            element={<Navigate to="/dashboard/profile-settings" replace />}
          />
          {/* Redirect old milk routes to the new combined page */}
          <Route
            path="dashboard/milk-production"
            element={<MilkProductionRedirect />}
          />
          <Route
            path="dashboard/mpp"
            element={<Navigate to="/dashboard/milk-management?tab=1" replace />}
          />
          <Route path="dashboard/news-feed" element={<NewsFeedPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route
            path="admin/veterinary-locations"
            element={<VeterinaryLocations />}
          />
          <Route
            path="admin/veterinary-doctors"
            element={<VeterinaryDoctors />}
          />
          <Route path="admin/news-alerts" element={<NewsAlertManagement />} />
          <Route path="admin/profile-settings" element={<ProfileSettings />} />
          {/* Redirect old separate pages to combined profile-settings */}
          <Route
            path="admin/settings"
            element={<Navigate to="/admin/profile-settings" replace />}
          />
          <Route
            path="admin/profile"
            element={<Navigate to="/admin/profile-settings" replace />}
          />

          <Route path="admin/support" element={<AdminChat />} />
          
          <Route
            path="admin/farmers/:farmerId/milk-transactions"
            element={<FarmerMilkTransactions />}
          />
          <Route
            path="admin/milk-collection"
            element={<AdminMilkCollection />}
          />
        </Route>
      </Route>
      {/* Role-based redirects */}
      <Route path="*" element={<RoleBasedRedirect />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </StrictMode>
);
