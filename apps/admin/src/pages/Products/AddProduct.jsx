import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import ProductForm from "@/components/products/ProductForm";

import { addProduct, setError } from "@/features/products/productSlice";

import { createProduct } from "@/features/products/productService";

function AddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState("");

  const handleSubmit = async (productData, validationError) => {
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const createdProduct = await createProduct(productData);

      dispatch(addProduct(createdProduct));
      dispatch(setError(null));

      navigate("/products");
    } catch (error) {
      console.error("Failed to create product:", error);

      setFormError("Unable to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>

        <p className="text-muted-foreground">
          Add a new product to your ZanCart store.
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Add Product"
      />
    </div>
  );
}

export default AddProduct;
