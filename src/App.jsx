import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import axios from "axios";

import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./admin/Admin";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/Order";
import AdminOrderDetails from "./admin/AdminOrderDetails";
import AdminDashboard from "./admin/AdminDashboard";
import CategoryPage from "./pages/CategoryPage";
import AdminProductsPage from "./admin/AdminProductsPage";
import ProductDetails from "./pages/ProductDetails";
import LoyaltyPage from "./pages/PlusPage";
import OrderDetails from "./pages/OrderDetails";
import SearchResultsPage from "./pages/SearchResultsPage";
import WishlistPage from "./pages/WishlistPage";
import SplashScreen from "./components/SplashScreen";
import Navbar from "./components/Navbar";
import { CartProvider, useCart } from "./context/CartContext";
import { WishlistProvider, useWishlist } from "./context/WishlistContext";
import Footer from "./components/Footer";

const API = import.meta.env.VITE_API_URL;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [deliveryAlertCount, setDeliveryAlertCount] = useState(0);
  const [refundAlertCount, setRefundAlertCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Check logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "null");

    setIsLoggedIn(!!user);
    setIsAdmin(user?.isAdmin || false);
  }, [location.pathname]);

  // Fetch admin alerts
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminAlerts = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

        if (!userInfo?.token) return;

        const { data } = await axios.get(`${API}/api/orders/admin`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        const orders = Array.isArray(data.orders) ? data.orders : data;

        setDeliveryAlertCount(
          orders.filter((o) => !o.isDelivered && !o.isCancelled).length,
        );

        setRefundAlertCount(
          orders.filter((o) => o.isCancelled && o.isPaid && !o.isRefunded)
            .length,
        );

        const { data: dashboardData } = await axios.get(
          `${API}/api/orders/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          },
        );

        setLowStockCount(dashboardData.lowStockProducts?.length || 0);
      } catch (err) {
        console.error("Badge fetch error:", err);
      }
    };

    fetchAdminAlerts();

    const interval = setInterval(fetchAdminAlerts, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <ScrollToTop />

      {!isAuthPage && (
        <Navbar
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          deliveryAlertCount={deliveryAlertCount}
          refundAlertCount={refundAlertCount}
          lowStockCount={lowStockCount}
          search={search}
          setSearch={setSearch}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home search={search} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />

          <Route
            path="/login"
            element={
              <Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/plus" element={<LoyaltyPage />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer only on homepage */}
      {location.pathname === "/" && !isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("splashShown"),
  );

  return (
    <CartProvider>
      <WishlistProvider>
        {showSplash && (
          <SplashScreen
            onDone={() => {
              sessionStorage.setItem("splashShown", "1");
              setShowSplash(false);
            }}
          />
        )}

        {!showSplash && <AppContent />}
      </WishlistProvider>
    </CartProvider>
  );
}
