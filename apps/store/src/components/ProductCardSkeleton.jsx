import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3">
        {/* Product image */}
        <Skeleton className="aspect-square w-full rounded-xl" />

        {/* Product information */}
        <div className="space-y-3 p-2">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />

          {/* Category / brand */}
          <Skeleton className="h-4 w-1/2" />

          {/* Rating */}
          <Skeleton className="h-4 w-1/3" />

          {/* Price */}
          <Skeleton className="h-5 w-1/2" />

          {/* Add to cart button */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCardSkeleton;
