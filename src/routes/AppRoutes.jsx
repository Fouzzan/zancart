import ProtectedRoute from "../components/ProtectedRoute";
import Addresses from "../pages/Addresses";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import OrderDetails from "../pages/OrderDetails";
import Orders from "../pages/Orders";
import OrderSuccess from "../pages/OrderSuccess";
import Payment from "../pages/Payment";
import ProductDetails from "../pages/ProductDetails";
import ProductList from "../pages/ProductList";
import Register from "../pages/Register";
import Wishlist from "../pages/Wishlist";

import { Route, Routes } from "react-router-dom";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

      {/* Private Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/profile" element={<div>Profile</div>} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
