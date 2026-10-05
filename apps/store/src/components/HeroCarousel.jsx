import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

function HeroCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get("/banners");

        const activeBanners = response.data
          .filter((banner) => banner.isActive)
          .sort((a, b) => a.order - b.order);

        setBanners(activeBanners);
        setCurrent(0);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Keep the section space stable while banners are loading.
  if (loading) {
    return (
      <section className="px-4 pt-4 sm:px-6 lg:px-7">
        <div className="relative mx-auto max-w-[1480px] overflow-hidden rounded-[2rem]">
          <div className="aspect-[16/6] w-full animate-pulse bg-muted" />
        </div>
      </section>
    );
  }

  // Don't render anything if there are no active banners.
  if (banners.length === 0) {
    return null;
  }

  const slide = banners[current];

  return (
    <section className="px-4 pt-4 sm:px-6 lg:px-7">
      <div className="relative mx-auto max-w-[1480px] overflow-hidden rounded-[2rem]">
        {/* Slide */}
        <Link
          to={slide.link}
          className="block focus:outline-none"
          aria-label={slide.alt || "ZanCart banner"}
        >
          <img
            src={slide.image}
            alt={slide.alt || "ZanCart banner"}
            className="block h-auto w-full object-cover"
          />
        </Link>

        {/* Previous */}
        {banners.length > 1 && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={previousSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border bg-white/90 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white sm:left-6 sm:h-11 sm:w-11"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}

        {/* Next */}
        {banners.length > 1 && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border bg-white/90 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white sm:right-6 sm:h-11 sm:w-11"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}

        {/* Slide indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md">
            {banners.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index
                    ? "w-7 bg-black"
                    : "w-2 bg-black/30 hover:bg-black/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {banners.length > 1 && (
          <div className="absolute bottom-5 left-5 hidden items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-medium backdrop-blur-md sm:flex">
            <span>{String(current + 1).padStart(2, "0")}</span>
            <span className="text-black/40">/</span>
            <span className="text-black/50">
              {String(banners.length).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroCarousel;
