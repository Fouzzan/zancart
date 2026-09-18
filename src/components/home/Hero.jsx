import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#F5F5F7]">
      <div className="grid min-h-130 items-center lg:grid-cols-2">
        {/* Content */}
        <div className="px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
          <span className="mb-5 inline-block rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white">
            New Season Collection
          </span>

          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-[#1D1D1F] sm:text-5xl lg:text-6xl">
            Everything you want.
            <span className="block text-gray-500">All in one place.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
            Discover products you'll love, from everyday essentials to the
            latest trends — all at prices you'll appreciate.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full bg-white px-6"
            >
              <Link to="/products?sort=featured">Explore Featured</Link>
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-full min-h-90 lg:min-h-130">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            alt="Zancart fashion collection"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
