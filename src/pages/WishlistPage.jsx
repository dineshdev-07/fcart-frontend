import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, Frown, ShoppingCart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { calculateDiscountedPrice } from "../utils/offerUtils";

const API = import.meta.env.VITE_API_URL;

const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

const WishlistProductCard = ({
  product,
  isLowestPriceItem = false,
  onRemove,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted } = useWishlist();

  const liked = isWishlisted(product._id);

  const loyaltyPoints = Number(userInfo?.loyaltyPoints || 0);
  const isNewUser = !!(userInfo && userInfo.firstOrderCompleted === false);
  const isPlusMember = userInfo?.isPlusMember || false;

  const stock = product.quantity || 0;
  const isOutOfStock = stock === 0;
  const mrp = Number(product.price) || 0;

  const offerData = calculateDiscountedPrice(
    product,
    {
      isNewUser,
      loyaltyPoints,
      isPlusMember,
    },
    {
      isLowestPriceItem,
      isFirstOrder: isNewUser,
      quantityIndex: 0,
    },
  );

  const finalPrice = offerData.finalPrice;
  const totalSavings = mrp - finalPrice;

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="relative bg-white rounded-xl border border-gray-200 hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Heart button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(product._id);
        }}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition"
      >
        <Heart
          size={18}
          className={
            liked
              ? "text-red-500 fill-red-500"
              : "text-gray-400 hover:text-red-400"
          }
        />
      </button>

      {/* Product image */}
      <div className="w-full h-36 bg-gray-50 flex items-center justify-center p-3">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/200"}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product details */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">₹{finalPrice}</span>

          {mrp > finalPrice && (
            <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
          )}
        </div>

        {/* Plus badge */}
        {isPlusMember && (
          <div className="mt-2 inline-flex items-center gap-1 self-start rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
            ⭐ Plus Member
          </div>
        )}

        {/* Savings */}
        {totalSavings > 0 && (
          <p className="text-xs text-green-600 mt-2">Save ₹{totalSavings}</p>
        )}

        {/* Add to cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) {
              addToCart({ ...product, finalPrice });
            }
          }}
          disabled={isOutOfStock}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#2E7D32] text-white hover:bg-[#1B5E20]"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const { toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get(`${API}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });

        setProducts(data);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      // remove immediately from UI
      setProducts((prev) => prev.filter((item) => item._id !== productId));

      // update server in background
      await toggleWishlist(productId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex justify-between">
        <h1 className="text-2xl font-bold text-[#2E7D32]">Wishlist</h1>
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
          {products.length} Item(s)
        </span>
      </div>

      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[45vh] items-center justify-center px-6">
            <div className="max-w-sm text-center">
              <h2 className="mt-6 text-2xl font-bold text-gray-900 mb-5">
                Wishlist is Empty
              </h2>

              <button
                onClick={() => navigate("/")}
                className="rounded-xl border border-[#2E7D32] bg-[#2E7D32] py-3 px-4 font-semibold text-white hover:bg-[#1B5E20] transition"
              >
                Explore Products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {products.map((product, index) => (
              <WishlistProductCard
                key={product._id}
                product={product}
                isLowestPriceItem={index === 0}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
