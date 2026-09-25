import BenefitsSection from "@/components/BenefitsSection";
import DealsSection from "@/components/DealsSection.jsx";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer.jsx";
import HeroCarousel from "@/components/HeroCarousel";
import ShopByCategory from "@/components/ShopByCategory";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setProducts } from "../redux/slices/productSlice.js";
import api from "../services/api";

function Home() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        dispatch(setProducts(response.data));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [dispatch]);

  useEffect(() => {
    if (location.hash === "#deals") {
      const element = document.getElementById("deals");

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [location.hash]);

  return (
    <>
      <main>
        <HeroCarousel />
        <BenefitsSection />
        <ShopByCategory />
        <DealsSection id="deals" />
        <FeaturedProducts products={products} />
      </main>

      <Footer />
    </>
  );
}

export default Home;
