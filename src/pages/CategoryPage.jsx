import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ChevronLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`, {
          credentials: "include",
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          const categoryFiltered = data.filter(
            (p) =>
              p.category?.toLowerCase().trim() ===
              categoryName.toLowerCase().trim(),
          );
          setAllProducts(categoryFiltered);
        }
      } catch (err) {
        console.error("Category fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, allProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#6FAF8E] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5 flex">
        <button
          onClick={() => navigate(-1)}
          className="p-4 hover:bg-gray-100 rounded-xl text-gray-500 transition"
        >
          <ChevronLeft size={30} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-[#2E7D32] mt-3">
            {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)}
          </h1>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg font-medium">
            No products available
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-[#2E7D32] text-white px-5 py-2 rounded-lg hover:bg-green-600"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
