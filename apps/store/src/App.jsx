import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import CartSync from "./components/CartSync";
import Navbar from "./components/Navbar";
import WishlistSync from "./components/wishlistSync";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <Toaster />
      <Navbar />
      <CartSync />
      <WishlistSync />
      <AppRoutes />
    </>
  );
}

export default App;
