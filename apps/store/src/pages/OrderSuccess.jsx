import { CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

function OrderSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="mx-auto h-16 w-16" />

        <h1 className="mt-6 text-3xl font-bold">Order Placed!</h1>

        <p className="mt-3 text-muted-foreground">
          Your order has been successfully placed.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">Order ID: #{id}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate("/orders")} className="rounded-full">
            View Orders
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="rounded-full"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
