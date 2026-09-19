import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import hero1 from "../assets/hero/hero-1.png";
import hero2 from "../assets/hero/hero-2.png";
import hero3 from "../assets/hero/hero-3.png";
import hero4 from "../assets/hero/hero-4.png";
import hero5 from "../assets/hero/hero-5.png";

const slides = [
  {
    id: 1,
    image: hero1,
    link: "/products",
    alt: "Shop smarter with Zancart",
  },
  {
    id: 2,
    image: hero2,
    link: "/products?category=Fashion",
    alt: "Zancart fashion collection",
  },
  {
    id: 3,
    image: hero3,
    link: "/products?category=Electronics",
    alt: "Zancart electronics collection",
  },
  {
    id: 4,
    image: hero4,
    link: "/products?category=Home",
    alt: "Zancart home and living collection",
  },
  {
    id: 5,
    image: hero5,
    link: "/products?category=Beauty",
    alt: "Zancart beauty collection",
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section className="px-4 pt-4 sm:px-6 lg:px-7">
      <div className="relative mx-auto max-w-[1480px] overflow-hidden rounded-[2rem]">
        {/* Slide */}
        <Link
          to={slide.link}
          className="block focus:outline-none"
          aria-label={slide.alt}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="block h-auto w-full object-cover"
          />
        </Link>

        {/* Previous */}
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

        {/* Next */}
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

        {/* Slide indicator */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md">
          {slides.map((item, index) => (
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

        {/* Slide counter */}
        <div className="absolute bottom-5 left-5 hidden items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-medium backdrop-blur-md sm:flex">
          <span>{String(slide.id).padStart(2, "0")}</span>
          <span className="text-black/40">/</span>
          <span className="text-black/50">05</span>
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
