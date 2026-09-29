import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";

import AddProduct from "@/pages/Products/AddProduct";
import EditProduct from "@/pages/Products/EditProduct";
import Products from "@/pages/Products/Products";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import Unauthorized from "../pages/Unauthorized/Unauthorized";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login/*" element={<Login />} />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/add" element={<AddProduct />} />

        <Route path="/products/:id/edit" element={<EditProduct />} />

        <Route path="/categories" element={<div>Categories</div>} />

        <Route path="/brands" element={<div>Brands</div>} />

        <Route path="/orders" element={<div>Orders</div>} />

        <Route path="/users" element={<div>Users</div>} />

        <Route path="/coupons" element={<div>Coupons</div>} />

        <Route path="/reports" element={<div>Reports</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
