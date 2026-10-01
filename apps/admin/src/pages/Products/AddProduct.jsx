import { useEffect, useState } from "react";
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

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

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

  // fetching categories from db

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

  // fetch brands

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/categories`),
          fetch(`${import.meta.env.VITE_API_URL}/brands`),
        ]);

        if (!categoriesResponse.ok || !brandsResponse.ok) {
          throw new Error("Failed to fetch product options");
        }

        const [categoriesData, brandsData] = await Promise.all([
          categoriesResponse.json(),
          brandsResponse.json(),
        ]);

        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Failed to fetch product options:", error);
      }
    };

    fetchOptions();
  }, []);

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
        categories={categories}
        brands={brands}
      />
    </div>
  );
}

export default AddProduct;
