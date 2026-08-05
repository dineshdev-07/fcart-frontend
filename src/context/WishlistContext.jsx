import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

const API = import.meta.env.VITE_API_URL;

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist once when app loads
  const fetchWishlist = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo?.token) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${API}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      });

      setWishlist(Array.isArray(data) ? data.map((p) => p._id) : []);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Fast like / unlike
  const toggleWishlist = async (productId) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo?.token) return;

    // Save old state in case API fails
    const previousWishlist = [...wishlist];

    // Instant UI update
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );

    try {
      await axios.post(
        `${API}/api/wishlist/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true,
        },
      );
    } catch (err) {
      console.error("Wishlist update error:", err);

      // Rollback if request fails
      setWishlist(previousWishlist);
    }
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        toggleWishlist,
        isWishlisted,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
