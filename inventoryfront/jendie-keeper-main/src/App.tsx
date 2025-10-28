import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import Layout from "@/components/Layout"; // ✅ fixed path
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import InventoryNew from "./pages/InventoryNew";
import Dealers from "./pages/Dealers";
import Sales from "./pages/Sales";
import SalesNew from "./pages/SalesNew"; // ✅ added
import NotFound from "./pages/NotFound";

// 🔒 Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />

    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/new" element={<InventoryNew />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/new" element={<SalesNew />} /> {/* ✅ added */}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
