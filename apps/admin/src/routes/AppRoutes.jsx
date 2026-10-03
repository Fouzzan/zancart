import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";

import Brands from "@/pages/Brands/Brands";
import AddCoupon from "@/pages/Coupons/AddCoupon";
import Coupons from "@/pages/Coupons/Coupons";
import EditCoupon from "@/pages/Coupons/EditCoupons";
import Inventory from "@/pages/Inventory/Inventory";
import OrderDetails from "@/pages/Orders/OrderDetails";
import Orders from "@/pages/Orders/Orders";
import AddProduct from "@/pages/Products/AddProduct";
import EditProduct from "@/pages/Products/EditProduct";
import Products from "@/pages/Products/Products";
import UserDetails from "@/pages/Users/UserDetails";
import Users from "@/pages/Users/Users";
import Categories from "../pages/Categories/Categories";
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

        <Route path="/categories" element={<Categories />} />

        <Route path="/brands" element={<Brands />} />

        <Route path="/inventory" element={<Inventory />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/orders/:id" element={<OrderDetails />} />

        <Route path="/users" element={<Users />} />

        <Route path="/users/:id" element={<UserDetails />} />

        <Route path="/coupons" element={<Coupons />} />

        <Route path="/coupons/add" element={<AddCoupon />} />

        <Route path="/coupons/edit/:id" element={<EditCoupon />} />

        <Route path="/reports" element={<div>Reports</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
