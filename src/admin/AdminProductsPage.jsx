import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const CACHE_KEY = "FreshCart_home";
const bustCache = () => sessionStorage.removeItem(CACHE_KEY);

const AdminProductsPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`, {
        credentials: "include",
      });
      const data = await res.json();

      setAllProducts(data);
      bustCache();
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const pinnedCount = useMemo(
    () => allProducts.filter((p) => p.isPinned).length,
    [allProducts],
  );

  const togglePin = async (productId) => {
    setTogglingId(productId);
    try {
      const res = await fetch(`${API}/api/products/${productId}/pin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      if (!res.ok) {
        alert("Failed to toggle pin");
        return;
      }
      const data = await res.json();
      setAllProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, isPinned: data.isPinned } : p,
        ),
      );
      bustCache();
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Failed to toggle pin");
    } finally {
      setTogglingId(null);
    }
  };
  const filteredProducts = allProducts.filter((product) => {
    const name = product.name?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase())
    );
  });

  const pinnedPct = Math.min((pinnedCount / 50) * 100, 100);
  const isFull = pinnedCount >= 50;

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex justify-between">
          <div className="flex">
            <button
              onClick={() => navigate(-1)}
              className="p-4 hover:bg-gray-100 rounded-xl text-gray-500 transition"
            >
              <ChevronLeft size={30} />
            </button>
            <h2 className="text-2xl font-bold text-[#2E7D32] mt-3">
              Homepage Products
            </h2>
          </div>
          <div
            className={`text-xl font-bold mt-3 ${
              isFull ? "text-red-500" : "text-green-600"
            }`}
          >
            {pinnedCount} / 50
          </div>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border p-16 text-center">
            <p className="text-gray-500">No Products Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredProducts.map((product) => {
              const imgPath = product.images?.[0] || product.image;

              const imageUrl = imgPath?.startsWith("http")
                ? imgPath
                : `${API}${imgPath?.startsWith("/") ? "" : "/"}${imgPath || ""}`;

              const isToggling = togglingId === product._id;
              return (
                <div
                  key={product._id}
                  className={`relative rounded-xl border overflow-hidden bg-white shadow-sm transition border-gray-200`}
                >
                  {/* Image */}

                  <div className="bg-gray-50 h-40 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-32 object-contain"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                  </div>

                  {/* Details */}

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 h-12">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {product.category}
                    </p>

                    <p className="text-lg font-bold text-green-700 mt-2">
                      ₹{product.price}
                    </p>

                    <button
                      onClick={() => togglePin(product._id)}
                      disabled={isToggling || (!product.isPinned && isFull)}
                      className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
                        product.isPinned
                          ? "bg-red-400 hover:bg-red-500 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isToggling
                        ? "Please Wait..."
                        : product.isPinned
                          ? "Unpin"
                          : "Pin"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
