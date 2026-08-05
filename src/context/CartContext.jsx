import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const API = import.meta.env.VITE_API_URL;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const mergeCartData = (items = []) => {
    const merged = items.reduce((acc, current) => {
      const productId = current.product?._id || current.product || current._id;
      const existing = acc.find(
        (item) => (item.product?._id || item.product || item._id) === productId,
      );
      if (existing) {
        existing.quantity += current.quantity;
      } else {
        acc.push({ ...current });
      }
      return acc;
    }, []);
    return merged;
  };

  const fetchCart = async () => {
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;

    if (!token) return;

    try {
      const res = await axios.get(`${API}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const items = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.cartItems || [];

      setCartItems(mergeCartData(items));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    const token = JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;

    if (!token) return;

    // Save old cart
    const previousCart = [...cartItems];

    // ⚡ Instant UI update
    setCartItems((prev) => {
      const existing = prev.find((item) => {
        const id = item.product?._id || item.product;
        return id === product._id;
      });

      if (existing) {
        return prev.map((item) => {
          const id = item.product?._id || item.product;

          return id === product._id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item;
        });
      }

      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.images?.[0],
          price: product.finalPrice || product.price,
          quantity,
        },
      ];
    });

    try {
      await axios.post(
        `${API}/api/cart`,
        {
          productId: product._id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
    } catch (err) {
      console.error("Add to Cart Error:", err);

      // Rollback if request fails
      setCartItems(previousCart);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, fetchCart, setCartItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
