import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { ArrowLeft, SlidersHorizontal, X, Search } from "lucide-react";
const API = import.meta.env.VITE_API_URL;
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResultsPage() {
  const query = useQuery();
  const searchTerm = query.get("q") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!searchTerm) return;
    setLoading(true);
    fetch(`${API}/api/products/search?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setResults(arr);
        setFilteredResults(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2E7D32]">
              Search Results
            </h1>

            <p className="text-sm text-gray-500">
              Showing results for{" "}
              <span className="font-semibold text-grey">"{searchTerm}"</span>
            </p>

            {!loading && (
              <p className="text-sm text-gray-400 mt-1">
                {filteredResults.length} product
                {filteredResults.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          /* No Results */
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <Search size={45} className="mx-auto text-gray-300 mb-4" />

            <h2 className="text-xl font-semibold text-gray-700">
              No Products Found
            </h2>

            <p className="text-gray-500 mt-2">
              We couldn't find any products matching your search.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Home
            </button>
          </div>
        ) : (
          /* Products */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredResults.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
