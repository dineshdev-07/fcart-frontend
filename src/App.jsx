import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
import { UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  HomeIcon,
  Package,
  Menu,
  X,
  ShoppingBag,
  LayoutDashboard,
  Settings,
  LogOut,
  Crown,
  ChevronRight,
  Search,
} from "lucide-react";
import { CartProvider, useCart } from "./context/CartContext";
import { WishlistProvider, useWishlist } from "./context/WishlistContext";

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

function BrandWordmark({ className = "" }) {
  return (
    <h1 className="text-2xl font-black bg-gradient-to-r text-[#2E7D32]">
      FreshCart!!
    </h1>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  isLoggedIn,
  isAdmin,
  deliveryAlertCount,
  refundAlertCount,
  lowStockCount,
  cartCount,
  wishlistCount,
  handleLogout,
}) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const totalOrderAlerts = deliveryAlertCount + refundAlertCount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
            }}
            className="fixed left-0 top-0 z-[70] flex h-full w-[280px] max-w-[85vw] flex-col overflow-hidden bg-[#F8FBF9] shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between bg-[#EFF3F1] px-5 py-4 border-b border-[#DCE8E0]">
              <BrandWordmark className="text-xl" />

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {/* ================= ADMIN ================= */}
              {isAdmin ? (
                <>
                  <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-gray-400">
                    Admin Menu
                  </p>

                  <div className="space-y-1">
                    <DrawerItem
                      icon={<LayoutDashboard size={17} />}
                      label="Dashboard"
                      badge={
                        lowStockCount > 0
                          ? {
                              count: lowStockCount,
                              color: "bg-amber-500",
                            }
                          : null
                      }
                      onClick={() => go("/admin/dashboard")}
                    />
                    <DrawerItem
                      icon={<Package size={17} />}
                      label="Orders"
                      badge={
                        totalOrderAlerts > 0
                          ? {
                              count: totalOrderAlerts,
                              color: "bg-red-500",
                            }
                          : null
                      }
                      onClick={() => go("/admin/orders")}
                    />

                    <DrawerItem
                      icon={<Settings size={17} />}
                      label="Admin Panel"
                      onClick={() => go("/admin")}
                    />
                    {/* Plus */}
                    <DrawerItem
                      icon={<Crown size={17} className="text-yellow-500" />}
                      label="FreshCart Plus"
                      labelClass="text-yellow-600"
                      onClick={() => go("/plus")}
                    />
                  </div>
                </>
              ) : (
                /* ================= NORMAL USER ================= */
                <>
                  <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-gray-400">
                    Menu
                  </p>

                  <div className="space-y-1">
                    <DrawerItem
                      icon={<HomeIcon size={17} />}
                      label="Home"
                      onClick={() => go("/")}
                    />

                    {isLoggedIn ? (
                      <>
                        <DrawerItem
                          icon={<Package size={17} />}
                          label="My Orders"
                          onClick={() => go("/myorders")}
                        />

                        <DrawerItem
                          icon={<Crown size={17} className="text-yellow-500" />}
                          label="FreshCart Plus"
                          labelClass="text-yellow-600"
                          onClick={() => go("/plus")}
                        />

                        <DrawerItem
                          icon={<Heart size={17} />}
                          label="Wishlist"
                          badge={
                            wishlistCount > 0
                              ? {
                                  count: wishlistCount,
                                  color: "bg-red-500",
                                }
                              : null
                          }
                          onClick={() => go("/wishlist")}
                        />

                        <DrawerItem
                          icon={<ShoppingBag size={17} />}
                          label="Cart"
                          badge={
                            cartCount > 0
                              ? {
                                  count: cartCount,
                                  color: "bg-[#2E7D32]",
                                }
                              : null
                          }
                          onClick={() => go("/cart")}
                        />
                      </>
                    ) : (
                      <DrawerItem
                        icon={<Crown size={17} className="text-yellow-500" />}
                        label="FreshCart Plus"
                        labelClass="text-yellow-600"
                        onClick={() => go("/plus")}
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Bottom */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-3">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-500 hover:bg-red-50 transition"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50">
                    <LogOut size={17} />
                  </div>

                  <span className="text-sm font-semibold">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => go("/login")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-3 py-3 text-sm font-bold text-white hover:bg-[#1B5E20] transition"
                >
                  <UserRound size={17} />
                  Login
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({ icon, label, sub, badge, onClick, labelClass = "" }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white active:scale-[0.98]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF3F1] text-[#2E7D32] transition group-hover:bg-[#E3F0E7]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold leading-tight text-gray-800 ${labelClass}`}
        >
          {label}
        </p>

        {sub && (
          <p className="mt-0.5 text-[10px] leading-tight text-gray-400">
            {sub}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {badge && (
          <span
            className={`${badge.color} flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-black text-white`}
          >
            {badge.count > 9 ? "9+" : badge.count}
          </span>
        )}

        <ChevronRight
          size={14}
          className="text-gray-300 transition group-hover:text-gray-500"
        />
      </div>
    </button>
  );
}
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [deliveryAlertCount, setDeliveryAlertCount] = useState(0);
  const [refundAlertCount, setRefundAlertCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "null");

    setIsLoggedIn(!!user);
    setIsAdmin(user?.isAdmin || false);
  }, [location.pathname]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query?.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API}/api/products/suggestions?q=${query}`);
      const data = await res.json();
      setSuggestions((Array.isArray(data) ? data : []).slice(0, 3));
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) return;

    navigate(`/search?q=${encodeURIComponent(search)}`);
    setShowSuggestions(false);
  };
  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("isAdmin");
      window.location.href = "/login";
    }
  };

  const fetchAdminAlerts = useCallback(async () => {
    if (!isAdmin) return;

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
        orders.filter((o) => o.isCancelled && o.isPaid && !o.isRefunded).length,
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
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminAlerts();
      const iv = setInterval(fetchAdminAlerts, 30000);
      return () => clearInterval(iv);
    }
  }, [isAdmin, fetchAdminAlerts]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";

  return (
    <div className="bg-white border border-brand-light/30">
      <ScrollToTop />
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        deliveryAlertCount={deliveryAlertCount}
        refundAlertCount={refundAlertCount}
        lowStockCount={lowStockCount}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        handleLogout={handleLogout}
      />

      {!isAuthPage && (
        <nav className="sticky top-0 z-50 bg-[#EFF3F1] border-blue-200 ">
          {/* ================= MOBILE NAVBAR ================= */}
          <div className="md:hidden px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#6FAF8E]/20 flex items-center justify-center">
                  <ShoppingBag size={17} className="text-[#2E7D32]" />
                </div>

                <h1 className="text-lg font-black text-[#2E7D32] whitespace-nowrap">
                  FreshCart !!
                </h1>
              </Link>

              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  onFocus={() => search && setShowSuggestions(true)}
                  placeholder="Search products"
                  className="w-full h-9 rounded-full border border-green-200 bg-white pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-[#6FAF8E]"
                />
              </div>

              {/* Menu */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-green-200 text-[#2E7D32] hover:bg-green-50 active:scale-95 transition"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* ================= DESKTOP NAVBAR ================= */}
          <div className="hidden md:block max-w-7xl mx-4">
            {/* Top */}
            <div className="h-16 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 pl-5">
                <div className="w-10 h-10 rounded-xl bg-[#6FAF8E]/20 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-[#2E7D32]" />
                </div>

                <div>
                  <h1 className="text-2xl font-black text-[#2E7D32]">
                    FreshCart !!
                  </h1>
                </div>
              </Link>

              {/* Right Icons */}

              <div className="flex items-center gap-5 ">
                <Link to="/wishlist" className="relative hover:text-[#2E7D32]">
                  <Heart
                    size={21}
                    className={
                      wishlistCount > 0 ? "fill-red-500 text-red-500" : ""
                    }
                  />

                  {wishlistCount > 0 && (
                    <span
                      className=" absolute
                -top-2
                -right-2
                bg-red-500
                text-white
                text-[10px]
                w-5
                h-5
                rounded-full
                flex
                items-center
                justify-center
            "
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="relative hover:text-[#2E7D32]">
                  <ShoppingBag size={21} />

                  {cartCount > 0 && (
                    <span
                      className="absolute
-top-2
-right-2
bg-[#2E7D32]
text-white
text-[10px]
w-5
h-5
rounded-full
flex
items-center
justify-center"
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="p-2 rounded-full hover:bg-green-50 transition"
                  >
                    <UserRound size={22} className="text-[#795548]" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      {!isLoggedIn ? (
                        <>
                          <button
                            onClick={() => {
                              navigate("/login");
                              setProfileOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-green-50"
                          >
                            Login
                          </button>

                          <button
                            onClick={() => {
                              navigate("/register");
                              setProfileOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-green-50"
                          >
                            Register
                          </button>
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  navigate("/admin");
                                  setProfileOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-green-50"
                              >
                                Admin
                              </button>
                              <button
                                onClick={() => {
                                  navigate("/admin/dashboard");
                                  setProfileOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-green-50"
                              >
                                Dashboard
                              </button>
                              <button
                                onClick={() => {
                                  navigate("/admin/orders");
                                  setProfileOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-green-50"
                              >
                                Orders
                              </button>
                            </>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50"
                          >
                            Logout
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="pb-3 pl-5 flex items-center justify-between">
              <div className="flex gap-10">
                <Link
                  to="/"
                  className="font-semibold text-[#795548] hover:text-[#2E7D32]"
                >
                  Home
                </Link>

                <Link
                  to="/myorders"
                  className="font-semibold text-[#795548] hover:text-[#2E7D32]"
                >
                  My Orders
                </Link>

                <Link
                  to="/plus"
                  className="px-4 py-1 rounded-full text-yellow-700 text-sm font-bold"
                >
                  Plus
                </Link>
              </div>

              {/* Search */}

              <div className="relative w-80 max-w-xs sm:max-w-sm md:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  onFocus={() => search && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full h-10 sm:h-11 rounded-full border border-green-200 bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#6FAF8E]"
                />
              </div>
            </div>
          </div>
        </nav>
      )}

      <main
        className={`flex-grow ${
          isAuthPage ? "p-0" : "max-w-7xl mx-auto w-full p-2 md:p-8"
        }`}
      >
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
