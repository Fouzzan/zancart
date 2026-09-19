import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import fashionCover from "../assets/categories/fashion-cover.png";

const categories = [
  {
    name: "Fashion",
    description: "Style for every day",
    image: fashionCover,
    link: "/products?category=Fashion",
    size: "large",
  },
  {
    name: "Electronics",
    description: "Tech made simple",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1000&q=85",
    link: "/products?category=Electronics",
  },
  {
    name: "Home",
    description: "Make your space yours",
    image:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1000&q=85",
    link: "/products?category=Home",
  },
  {
    name: "Beauty",
    description: "Feel confident every day",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85",
    link: "/products?category=Beauty",
  },
];

function CategoryCard({ category }) {
  return (
    <Link
      to={category.link}
      className="group relative block h-full overflow-hidden rounded-[2rem] bg-muted"
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="
            h-full
            w-full
            object-cover
            
            brightness-[0.5]
            transition-[filter,transform]
            duration-700
            ease-out
            group-hover:blur-0
            hover:blur-0
            group-hover:brightness-100
          "
        />
      </div>

      {/* Overlay */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-t from-black/65 via-black/10 to-transparent
          transition-all duration-500
          group-hover:from-black/50
        "
      />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-white/70">Discover</p>

            <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {category.name}
            </h3>

            <p className="mt-1 text-sm text-white/75">{category.description}</p>
          </div>

          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-full bg-white text-black
              translate-y-3 opacity-0
              transition-all duration-500
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ShopByCategory() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-7">
      <div className="mx-auto max-w-[1480px]">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Curated for you
            </p>

            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Explore our world
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Discover collections carefully selected for the way you live, work
              and express yourself.
            </p>
          </div>

          <Link
            to="/products"
            className="
              hidden text-sm font-medium
              underline underline-offset-4
              transition-opacity hover:opacity-60
              sm:block
            "
          >
            View all products
          </Link>
        </div>

        {/* Category layout */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Large Fashion card */}
          <div className="h-[480px] sm:h-[560px] lg:h-[620px]">
            <CategoryCard category={categories[0]} />
          </div>

          {/* Smaller cards */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {categories.slice(1).map((category) => (
              <div
                key={category.name}
                className="h-[260px] sm:h-[300px] lg:h-auto lg:min-h-0 lg:flex-1"
              >
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view all */}
        <Link
          to="/products"
          className="
            mt-6 block text-center text-sm font-medium
            underline underline-offset-4
            sm:hidden
          "
        >
          View all products
        </Link>
      </div>
    </section>
  );
}

export default ShopByCategory;
