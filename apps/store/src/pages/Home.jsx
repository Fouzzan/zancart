import BenefitsSection from "@/components/BenefitsSection";
import HeroCarousel from "@/components/HeroCarousel";
import ShopByCategory from "@/components/ShopByCategory";

function Home() {
  return (
    <>
      <main>
        <HeroCarousel />
        <BenefitsSection />
        <ShopByCategory />
      </main>
    </>
  );
}

export default Home;
