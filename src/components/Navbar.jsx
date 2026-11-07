import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Home,
  Package,
  Menu,
  X,
  ShoppingBag,
  LayoutDashboard,
  Settings,
  LogOut,
  Crown,
  Search,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL;

/* ================= SEARCH BOX ================= */

function SearchBox({
  search,
  setSearch,
  fetchSuggestions,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  handleSearch,
  placeholder,
}) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full">
      <div className="flex h-11 items-center rounded-full border border-[#DCE8E0] bg-white px-4 transition focus-within:border-[#6FAF8E] focus-within:ring-2 focus-within:ring-[#6FAF8E]/20">
        <Search size={17} className="shrink-0 text-gray-400" />

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") setShowSuggestions(false);
          }}
          onFocus={() => {
            if (search && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setShowSuggestions(false);
            }}
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
          >
            {suggestions.map((item) => (
              <button
                key={item._id}
                onClick={() => {
                  navigate(`/product/${item._id}`);
                  setShowSuggestions(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition hover:bg-green-50"
              >
                <span className="truncate font-medium text-gray-700">
                  {item.name || item.title}
                </span>

                <ArrowUpRight size={15} className="shrink-0 text-gray-400" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= MOBILE MENU ITEM ================= */

function MobileMenuItem({ icon: Icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between border-b border-black/[0.06] py-4 text-left"
    >
      <span className="flex items-center gap-4">
        {Icon && (
          <Icon size={21} strokeWidth={1.7} className="text-[#2E7D32]" />
        )}

        <span className="text-[20px] font-medium tracking-tight text-[#242424] sm:text-2xl">
          {label}
        </span>

        {badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2E7D32] px-1.5 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>

      <ArrowUpRight
        size={20}
        className="text-gray-300 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#2E7D32]"
      />
    </button>
  );
}

/* ================= APPLE-STYLE MOBILE MENU ================= */

function MobileMenu({
  isOpen,
  onClose,
  isLoggedIn,
  isAdmin,
  cartCount,
  wishlistCount,
  lowStockCount,
  deliveryAlertCount,
  refundAlertCount,
  handleLogout,
}) {
  const navigate = useNavigate();

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const totalOrderAlerts = deliveryAlertCount + refundAlertCount;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const menuLinks = isAdmin
    ? [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: lowStockCount,
          path: "/admin/dashboard",
        },
        {
          label: "Orders",
          icon: Package,
          badge: totalOrderAlerts,
          path: "/admin/orders",
        },
        {
          label: "Admin Panel",
          icon: Settings,
          path: "/admin",
        },
        {
          label: "FreshCart Plus",
          icon: Crown,
          path: "/plus",
        },
      ]
    : [
        {
          label: "Home",
          icon: Home,
          path: "/",
        },
        ...(isLoggedIn
          ? [
              {
                label: "My Orders",
                icon: Package,
                path: "/myorders",
              },
              {
                label: "Wishlist",
                icon: Heart,
                badge: wishlistCount,
                path: "/wishlist",
              },
              {
                label: "Shopping Cart",
                icon: ShoppingBag,
                badge: cartCount,
                path: "/cart",
              },
            ]
          : []),
        {
          label: "FreshCart Plus",
          icon: Crown,
          path: "/plus",
        },
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-[#F8FAF8]/95 backdrop-blur-2xl"
        >
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 sm:px-10">
            {/* Menu Header */}
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-black/[0.06]">
              <Link
                to="/"
                onClick={onClose}
                className="text-xl font-black tracking-tight text-[#2E7D32]"
              >
                FreshCart<span className="text-[#6FAF8E]">.</span>
              </Link>

              <button
                onClick={onClose}
                aria-label="Close navigation"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] transition hover:bg-black/10 active:scale-95"
              >
                <X size={21} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 py-7 sm:py-10">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.07,
                    },
                  },
                }}
              >
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
                >
                  {isAdmin ? "Administration" : "Explore FreshCart"}
                </motion.p>

                {menuLinks.map((item) => (
                  <motion.div
                    key={item.path}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <MobileMenuItem
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      onClick={() => go(item.path)}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Account Section */}
              <div className="mt-10 rounded-2xl border border-black/[0.05] bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F1E9]">
                    <UserRound size={19} className="text-[#2E7D32]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {isLoggedIn ? "Your Account" : "Welcome to FreshCart"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {isLoggedIn
                        ? "Manage your shopping account"
                        : "Sign in to enjoy your shopping"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => go("/login")}
                        className="flex-1 rounded-full bg-[#2E7D32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B5E20]"
                      >
                        Login
                      </button>

                      <button
                        onClick={() => go("/register")}
                        className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/[0.06] py-5 text-center text-xs text-gray-400">
              FreshCart · Freshness delivered to your doorstep.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= MAIN NAVBAR ================= */

export default function Navbar({
  isLoggedIn,
  isAdmin,
  cartCount,
  wishlistCount,
  deliveryAlertCount = 0,
  refundAlertCount = 0,
  lowStockCount = 0,
  search,
  setSearch,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const profileRef = useRef(null);

  // Close menus after route changes
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Product suggestions
  const fetchSuggestions = async (query) => {
    if (!query?.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/products/suggestions?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) throw new Error("Suggestion request failed");

      const data = await response.json();

      setSuggestions((Array.isArray(data) ? data : []).slice(0, 3));

      setShowSuggestions(true);
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) return;

    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("isAdmin");
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Apple-inspired mobile navigation */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        lowStockCount={lowStockCount}
        deliveryAlertCount={deliveryAlertCount}
        refundAlertCount={refundAlertCount}
        handleLogout={handleLogout}
      />

      <nav className="sticky top-0 z-50 w-full border-b border-[#DCE8E0] bg-[#EFF3F1]/95 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* MOBILE HEADER */}
          <div className="py-3 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6FAF8E]/20">
                  <ShoppingBag size={19} className="text-[#2E7D32]" />
                </div>

                <span className="text-lg font-black tracking-tight text-[#2E7D32] sm:text-xl">
                  FreshCart<span className="text-[#6FAF8E]">.</span>
                </span>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/cart"
                  aria-label="Shopping cart"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2E7D32]"
                >
                  <ShoppingBag size={19} />

                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2E7D32] px-1 text-[10px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open navigation"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32] text-white transition hover:bg-[#1B5E20] active:scale-95"
                >
                  <Menu size={21} />
                </button>
              </div>
            </div>

            {/* MOBILE SEARCH - SECOND ROW */}
            <div className="mt-3">
              <SearchBox
                search={search}
                setSearch={setSearch}
                fetchSuggestions={fetchSuggestions}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                handleSearch={handleSearch}
                placeholder="Search fresh products..."
              />
            </div>
          </div>

          {/* TABLET AND DESKTOP HEADER */}
          <div className="hidden md:block">
            {/* TOP ROW */}
            <div className="flex min-h-[76px] items-center justify-between gap-6">
              <Link to="/" className="flex shrink-0 items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6FAF8E]/20">
                  <ShoppingBag size={22} className="text-[#2E7D32]" />
                </div>

                <span className="text-2xl font-black tracking-tight text-[#2E7D32]">
                  FreshCart<span className="text-[#6FAF8E]">.</span>
                </span>
              </Link>

              {/* DESKTOP SEARCH */}
              <div className="w-full max-w-md">
                <SearchBox
                  search={search}
                  setSearch={setSearch}
                  fetchSuggestions={fetchSuggestions}
                  suggestions={suggestions}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                  handleSearch={handleSearch}
                  placeholder="Search fresh products..."
                />
              </div>

              {/* RIGHT ICONS */}
              <div className="flex shrink-0 items-center gap-5">
                <Link
                  to="/wishlist"
                  aria-label="Wishlist"
                  className="relative text-gray-600 transition hover:text-[#2E7D32]"
                >
                  <Heart
                    size={22}
                    className={
                      wishlistCount > 0 ? "fill-red-500 text-red-500" : ""
                    }
                  />

                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  aria-label="Shopping cart"
                  className="relative text-gray-600 transition hover:text-[#2E7D32]"
                >
                  <ShoppingBag size={22} />

                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2E7D32] px-1 text-[10px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* PROFILE */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-label="Account menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#795548] transition hover:bg-green-50"
                  >
                    <UserRound size={21} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full z-[90] mt-3 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
                      >
                        {!isLoggedIn ? (
                          <>
                            <button
                              onClick={() => {
                                navigate("/login");
                                setProfileOpen(false);
                              }}
                              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-green-50"
                            >
                              Login
                            </button>

                            <button
                              onClick={() => {
                                navigate("/register");
                                setProfileOpen(false);
                              }}
                              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-green-50"
                            >
                              Register
                            </button>
                          </>
                        ) : (
                          <>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => navigate("/admin")}
                                  className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-green-50"
                                >
                                  Admin Panel
                                </button>

                                <button
                                  onClick={() => navigate("/admin/dashboard")}
                                  className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-green-50"
                                >
                                  Dashboard
                                </button>

                                <button
                                  onClick={() => navigate("/admin/orders")}
                                  className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-green-50"
                                >
                                  Orders
                                </button>
                              </>
                            )}

                            <button
                              onClick={handleLogout}
                              className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
                            >
                              Logout
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* BOTTOM NAVIGATION */}
            <div className="flex min-h-12 items-center justify-between border-t border-[#DCE8E0]">
              <div className="flex items-center gap-8">
                <Link
                  to="/"
                  className="py-3 text-sm font-semibold text-[#795548] transition hover:text-[#2E7D32]"
                >
                  Home
                </Link>

                {isLoggedIn && (
                  <Link
                    to="/myorders"
                    className="py-3 text-sm font-semibold text-[#795548] transition hover:text-[#2E7D32]"
                  >
                    My Orders
                  </Link>
                )}

                <Link
                  to="/plus"
                  className="py-3 text-sm font-bold text-yellow-700 transition hover:text-yellow-800"
                >
                  Plus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
