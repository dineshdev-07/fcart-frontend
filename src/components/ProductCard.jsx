import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { calculateDiscountedPrice } from "../utils/offerUtils";

const ProductCard = ({ product, isLowestPriceItem = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const liked = isWishlisted(product._id);

  // User data
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  const loyaltyPoints = Number(userInfo?.loyaltyPoints || 0);

  const offerData = calculateDiscountedPrice(
    product,
    {
      isNewUser: userInfo?.firstOrderCompleted === false,
      loyaltyPoints,
      isPlusMember: userInfo?.isPlusMember || false,
    },
    { isLowestPriceItem },
  );

  const finalPrice = offerData.finalPrice;
  const totalDiscount = offerData.totalDiscount;

  const stock = Math.max(0, Number(product.quantity) || 0);
  const isOutOfStock = stock === 0;

  const mrp = Number(product.price) || 0;

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);
      await toggleWishlist(product._id);
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-2xl border border-blue-200/90"
    >
      {/* Product Image */}
      <div className="relative h-44 shrink-0 bg-gray-50">
        <img
          loading="lazy"
          src={product.images?.[0] || "https://via.placeholder.com/300"}
          alt={product.name}
          className="h-full w-full object-contain p-4"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95 transition"
        >
          <Heart
            size={20}
            className={
              liked
                ? "fill-red-500 text-red-500"
                : "text-gray-500 hover:text-red-500"
            }
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 truncate">
          {product.brand || "FreshCart"}
        </p>

        <h3 className="mt-1 h-10 line-clamp-2 text-sm font-semibold text-gray-800 ">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-3">
          {/* Main Price + MRP */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{finalPrice}
            </span>

            {mrp > finalPrice && (
              <span className="text-sm text-gray-400 line-through">₹{mrp}</span>
            )}
          </div>

          {/* Discount / Offer Badge */}
          <div className="mt-1 h-6 flex items-center">
            {mrp > finalPrice ? (
              <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                {totalDiscount}% OFF
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                ✓ Best Price
              </span>
            )}
          </div>
        </div>

        {/* Plus Badge */}
        {userInfo?.isPlusMember && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-700">
            ⭐ FreshCart Plus
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            if (!isOutOfStock) {
              addToCart({ ...product, finalPrice });
            }
          }}
          disabled={isOutOfStock}
          className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
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

export default React.memo(ProductCard);
