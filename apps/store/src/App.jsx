import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import CartSync from "./components/CartSync";
import Navbar from "./components/Navbar";
import WishlistSync from "./components/wishlistSync";
import AppRoutes from "./routes/AppRoutes";
import UserSync from "./components/UserSync";

function App() {
  return (
    <>
      <Toaster />
      <Navbar />
      <CartSync />
      <WishlistSync />
      <UserSync />
      <AppRoutes />
    </>
  );
}

export default App;
