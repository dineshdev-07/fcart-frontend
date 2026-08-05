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
  ChevronDown,
  Menu,
  X,
  Home as HomeIcon,
  ShoppingCart,
  ShoppingBag,
  Package,
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
    <h1 className="text-2xl font-black bg-gradient-to-r from-[#2E7D32] via-[#81C784] to-[#795548] bg-clip-text text-transparent">
      FreshCart
    </h1>
  );
}

function JoinDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-full hover:bg-[#6FAF8E] font-bold text-xs transition"
      >
        <Users size={11} /> Join Us{" "}
        <ChevronDown
          size={11}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
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
}) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const [adminOpen, setAdminOpen] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[260px] bg-white z-50 flex flex-col shadow-2xl lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 bg-gray-900 shrink-0">
              <BrandWordmark className="text-xl" light />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 py-3">
              {!isAdmin && (
                <div className="px-3 space-y-0.5">
                  <DrawerItem
                    icon={<HomeIcon size={16} />}
                    label="Home"
                    onClick={() => go("/")}
                  />

                  {isLoggedIn && (
                    <>
                      <DrawerItem
                        icon={<Package size={16} />}
                        label="My Orders"
                        onClick={() => go("/myorders")}
                      />
                      <DrawerItem
                        icon={<Crown size={16} className="text-yellow-500" />}
                        label="Plus"
                        badge={null}
                        onClick={() => go("/plus")}
                        labelClass="text-yellow-600 font-bold"
                      />
                      <DrawerItem
                        icon={<Heart size={16} />}
                        label="Wishlist"
                        onClick={() => go("/wishlist")}
                      />
                    </>
                  )}

                  <div className="my-3 border-t border-gray-100" />
                </div>
              )}

              {isAdmin && (
                <div className="px-3 space-y-0.5">
                  <DrawerItem
                    icon={<HomeIcon size={16} />}
                    label="Home"
                    onClick={() => go("/")}
                  />
                  <p className="px-4 py-2 text-[12px] font-semibold text-gray-500 uppercase">
                    Admin Panel
                  </p>

                  <DrawerItem
                    icon={<Settings size={16} />}
                    label="Admin"
                    onClick={() => go("/admin")}
                  />
                  <DrawerItem
                    icon={<LayoutDashboard size={16} />}
                    label="Dashboard"
                    badge={
                      lowStockCount > 0
                        ? { count: lowStockCount, color: "bg-amber-500" }
                        : null
                    }
                    onClick={() => go("/admin/dashboard")}
                  />
                  <DrawerItem
                    icon={<ShoppingBag size={16} />}
                    label="Orders"
                    badge={
                      deliveryAlertCount + refundAlertCount > 0
                        ? {
                            count: deliveryAlertCount + refundAlertCount,
                            color: "bg-red-500",
                          }
                        : null
                    }
                    onClick={() => go("/admin/orders")}
                  />

                  <DrawerItem
                    icon={<ShoppingCart size={16} />}
                    label="Products"
                    onClick={() => go("/admin/products")}
                  />

                  <div className="my-2 border-t border-gray-100" />
                </div>
              )}
            </div>

            <div className="px-3 py-4 border-t border-gray-100 shrink-0">
              {isLoggedIn ? (
                <button
                  onClick={async () => {
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
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-red-500 border-t"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => go("/login")}
                  className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-xl bg-gray-900 text-white hover:bg-[#6FAF8E] transition font-semibold text-sm"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({ icon, label, sub, badge, onClick, labelClass = "" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition text-left group"
    >
      <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-600 shrink-0 transition">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold text-gray-800 leading-tight ${labelClass}`}
        >
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
            {sub}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {badge && (
          <span
            className={`${badge.color} text-white text-[9px] font-black h-5 min-w-5 px-1 flex items-center justify-center rounded-full`}
          >
            {badge.count > 9 ? "9+" : badge.count}
          </span>
        )}
        <ChevronRight
          size={13}
          className="text-gray-300 group-hover:text-gray-400 transition"
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

  const [deliveryAlertCount, setDeliveryAlertCount] = useState(0);
  const [refundAlertCount, setRefundAlertCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    if (!userInfo?.token) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const { data } = await axios.get(`${API}/api/orders/admin`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
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
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      if (dashboardData.lowStockProducts) {
        setLowStockCount(dashboardData.lowStockProducts.length);
      }
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

  const isActive = (path) => location.pathname === path;

  const totalAdminBadge = deliveryAlertCount + refundAlertCount + lowStockCount;

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
      />

      {!isAuthPage && (
        <nav className="sticky top-0 z-50 bg-[#EFF3F1] border-b border-blue-200 shadow-sm">
          <div className="max-w-7xl mx-4">
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
                  className="px-4 py-1 rounded-full  text-yellow-700 text-sm font-bold"
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
        className={`flex-grow ${isAuthPage ? "p-0" : "max-w-7xl mx-auto w-full p-2 md:p-8"} ${isLoggedIn && !isAuthPage ? "pb-20 lg:pb-0" : ""}`}
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

      {isLoggedIn && !isAuthPage && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center justify-around h-16 px-2">
            <BottomNavItem
              to="/"
              icon={<HomeIcon size={22} />}
              label="Home"
              active={isActive("/")}
            />

            <BottomNavItem
              to="/myorders"
              icon={<Package size={22} />}
              label="Orders"
              active={isActive("/myorders")}
            />

            <BottomNavItem
              to="/wishlist"
              icon={
                <div className="relative">
                  <Heart
                    size={22}
                    className={
                      wishlistCount > 0 ? "fill-red-500 text-red-500" : ""
                    }
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </div>
              }
              label="Wishlist"
              active={isActive("/wishlist")}
            />

            <BottomNavItem
              to="/cart"
              icon={
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#6FAF8E] text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
              }
              label="Cart"
              active={isActive("/cart")}
            />

            {isAdmin ? (
              <button
                onClick={() => setDrawerOpen(true)}
                className="bottom-nav-item flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-gray-400 relative"
              >
                <div className="relative">
                  <Settings size={18} />
                  {totalAdminBadge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                      {totalAdminBadge > 9 ? "9+" : totalAdminBadge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setDrawerOpen(true)}
                className="bottom-nav-item flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-gray-400"
              >
                <Menu size={22} />
                <span className="text-[10px] font-semibold">More</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function BottomNavItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`bottom-nav-item flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors ${
        active ? "text-[#6FAF8E]" : "text-gray-400"
      }`}
    >
      <motion.div
        animate={active ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {icon}
      </motion.div>
      <span
        className={`text-[10px] font-semibold ${active ? "text-[#6FAF8E]" : ""}`}
      >
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="bottomNavIndicator"
          className="absolute bottom-0 h-0.5 w-8 bg-[#6FAF8E] rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
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
