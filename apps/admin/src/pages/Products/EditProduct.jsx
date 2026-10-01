import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ProductForm from "@/components/products/ProductForm";

import { setError, updateProduct } from "@/features/products/productSlice";

import {
  getProductById,
  updateProduct as updateProductApi,
} from "@/features/products/productService";

function EditProduct() {
  const { id } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setErrorMessage] = useState("");

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getProductById(id);

        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setErrorMessage("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetching Product Categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/categories`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (productData, validationError) => {
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const updatedProduct = await updateProductApi(id, productData);

      dispatch(updateProduct(updatedProduct));
      dispatch(setError(null));

      navigate("/products");
    } catch (error) {
      console.error("Failed to update product:", error);

      setErrorMessage("Unable to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>

        <p className="text-destructive">{error || "Product not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>

        <p className="text-muted-foreground">
          Update the details of this product.
        </p>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={saving}
        error={error}
        submitLabel="Update Product"
        categories={categories}
      />
    </div>
  );
}

export default EditProduct;
