import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day easy returns",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
];

function BenefitsSection() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-7">
      <div className="mx-auto grid max-w-[1480px] grid-cols-2 overflow-hidden rounded-2xl border bg-background sm:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className={`flex items-center gap-3 p-5 sm:p-6 ${
                index !== benefits.length - 1
                  ? "border-b sm:border-b-0 sm:border-r"
                  : ""
              } ${index === 0 || index === 2 ? "border-r" : ""}`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold sm:text-base">
                  {benefit.title}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BenefitsSection;
