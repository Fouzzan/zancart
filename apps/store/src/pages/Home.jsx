import BenefitsSection from "@/components/BenefitsSection";
import DealsSection from "@/components/DealsSection.jsx";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroCarousel from "@/components/HeroCarousel";
import Footer from "@/components/Footer.jsx";
import ShopByCategory from "@/components/ShopByCategory";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../redux/slices/productSlice.js";
import api from "../services/api";

function Home() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.product.products);

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
  return (
    <>
      <main>
        <HeroCarousel />
        <BenefitsSection />
        <ShopByCategory />
        <DealsSection />
        <FeaturedProducts products={products} />
      </main>

      <Footer />
    </>
  );
}

export default Home;
