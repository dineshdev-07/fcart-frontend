import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  Leaf,
  ShieldCheck,
  Sprout,
  Truck,
  Gift,
  Crown,
  Award,
} from "lucide-react";
import fruitsImg from "../assets/cat/Fruits.png";
import vegeImg from "../assets/cat/Vege.png";
import dairyImg from "../assets/cat/dairy.png";
import snacksImg from "../assets/cat/snacks.png";
import beveragesImg from "../assets/cat/beverages.png";
import bakeryImg from "../assets/cat/bakery.png";
import careImg from "../assets/cat/care.png";
import frozenImg from "../assets/cat/frozen.png";

const CACHE_KEY = "FreshCart_home";
const CACHE_TTL = 5 * 60 * 1000;

const API = import.meta.env.VITE_API_URL;
const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};
const writeCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};
const bustCache = () => sessionStorage.removeItem(CACHE_KEY);

const produceSlides = [
  {
    eyebrow: "Farm fresh morning picks",
    title: "Sweet fruits and crisp vegetables",
    copy: "Handpicked produce delivered with natural freshness, clean packing, and fair local prices.",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80",
    cta: "Shop Fruits",
    link: "/category/fruits",
  },
  {
    eyebrow: "Organic kitchen essentials",
    title: "Leafy greens for everyday meals",
    copy: "Bring home spinach, herbs, gourds, tomatoes, carrots, and seasonal vegetables at their best.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    cta: "Shop Vegetables",
    link: "/category/vegetables",
  },
  {
    eyebrow: "Natural freshness promise",
    title: "Better baskets for healthy homes",
    copy: "Save more on colorful fruits, fresh greens, and daily staples packed for quick delivery.",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
    cta: "View Offers",
    link: "#offers-section",
  },
];

const SectionTitle = ({ eyebrow, title, copy }) => (
  <div className="mb-4 sm:mb-6">
    <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#795548]">
      {eyebrow}
    </p>
    <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2E7D32]">
        {title}
      </h2>
      {copy && (
        <p className="max-w-xl text-xs sm:text-sm text-[#795548]/80">{copy}</p>
      )}
    </div>
  </div>
);

const Home = ({ search = "" }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [offers, setOffers] = useState([]);
  const [currentProduceAd, setCurrentProduceAd] = useState(0);

  const categories = [
    { name: "Fruits", image: fruitsImg },
    { name: "Vegetables", image: vegeImg },
    { name: "Dairy", image: dairyImg },
    { name: "Snacks", image: snacksImg },
    { name: "Beverages", image: beveragesImg },
    { name: "Bakery", image: bakeryImg },
    { name: "Personal Care", image: careImg },
    { name: "Frozen Foods", image: frozenImg },
  ];

  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache();
      if (cached) {
        setProducts(cached.products);
        setAds(cached.ads);
        setOffers(cached.offers);
        return;
      }
    }

    try {
      const [prodRes, adsRes, offRes] = await Promise.all([
        fetch(`${API}/api/products`, {
          credentials: "include",
        }),
        fetch(`${API}/api/ads`),
        fetch(`${API}/api/offers`),
      ]);
      const [products, ads, offers] = await Promise.all([
        prodRes.json(),
        adsRes.json(),
        offRes.json(),
      ]);
      writeCache({ products, ads, offers });
      setProducts(products);
      setAds(ads);
      setOffers(offers);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentProduceAd((prev) => (prev + 1) % produceSlides.length),
      4500,
    );
    return () => clearInterval(timer);
  }, []);

  const handleRemoveFromHome = async (id) => {
    if (!window.confirm("Remove this product from homepage?")) return;
    try {
      const res = await fetch(`${API}/api/products/${id}/pin`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      if (!res.ok) {
        alert("Failed to remove product");
        return;
      }
      bustCache();
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isPinned: false } : p)),
      );
    } catch {
      alert("Failed to remove product");
    }
  };

  const updateOfferLink = async (id, newLink) => {
    try {
      await fetch(`${API}/api/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ link: newLink }),
      });
      bustCache();
      fetchData(true);
    } catch (err) {
      console.error(err);
    }
  };

  const updateOfferImage = async (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    try {
      await fetch(`${API}/api/offers/${id}`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      bustCache();
      fetchData(true);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    await fetch(`${API}/api/offers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    bustCache();
    setOffers(offers.filter((o) => o._id !== id));
  };

  const pinnedProducts = products
    .filter((p) => p.isPinned)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 30);

  const goToSlideLink = (link) => {
    if (link.startsWith("#")) {
      document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-0 text-[#2E2A22]">
      <section className="relative mt-2 sm:mt-4 overflow-hidden rounded-2xl border  shadow-[0_18px_45px_rgba(46,125,50,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,199,132,0.3),transparent_28%),linear-gradient(135deg,#EFF3F1,rgba(255,255,255,0.75))]" />
        <div className="relative grid min-h-[360px] md:min-h-[420px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full border  bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#2E7D32]">
              <Leaf size={14} />
              Nature inspired groceries
            </div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#795548]">
              {produceSlides[currentProduceAd].eyebrow}
            </p>
            <h1 className="mt-2 max-w-xl text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-[#2E7D32]">
              {produceSlides[currentProduceAd].title}
            </h1>
            <p className="mt-3 max-w-lg text-sm sm:text-base leading-7 text-[#795548]">
              {produceSlides[currentProduceAd].copy}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  goToSlideLink(produceSlides[currentProduceAd].link)
                }
                className="rounded-full bg-[#2E7D32] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#2E7D32]/20 transition hover:bg-[#1B5E20]"
              >
                {produceSlides[currentProduceAd].cta}
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("category-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full border border-[#795548]/30 bg-white/70 px-5 py-2.5 text-sm font-bold text-[#795548] transition hover:border-[#2E7D32] hover:text-[#2E7D32]"
              >
                Browse Categories
              </button>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2 sm:max-w-md">
              {[
                { icon: Sprout, text: "Organic picks" },
                { icon: Truck, text: "Fast delivery" },
                { icon: ShieldCheck, text: "Fresh packed" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="rounded-xl border bg-white/65 px-2 py-2 text-center text-[10px] font-bold text-[#2E7D32]"
                >
                  <Icon className="mx-auto mb-1" size={16} />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
            {produceSlides.map((slide, i) => (
              <img
                key={slide.title}
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === currentProduceAd ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E7D32]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              {produceSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentProduceAd(i)}
                  aria-label={`Show produce slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === currentProduceAd
                      ? "w-8 bg-[#EFF3F1]"
                      : "w-2 bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="my-6 rounded-2xl border  bg-[#EFF3F1] border-blue-200 p-4 sm:my-10 sm:p-6 md:my-12"
        id="category-section"
      >
        <SectionTitle eyebrow="Shop fresh" title="Category"/>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
              className="group  text-center flex
                flex-col
                items-center
                justify-center "
            >
              <div
                className="w-36 rounded-xl border border-blue-200/90 bg-white p-4 shadow-sm transition-all 
                group-hover:-translate-y-1  duration-300 sm:rounded-2xl sm:p-2 md:p-3   "
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-32 aspect-square  object-contain group-hover:scale-110 transition-transform duration-300  "
                />
              </div>
              <p className="text-center text-sm md:text-base font-medium text-gray-700">
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 ">
        <div className="bg-[#EFF3F1] rounded-2xl shadow-sm p-6 border border-blue-200">
          <Gift className="text-yellow-700 mb-4" size={36} />
          <h3 className="text-xl font-bold text-[#2E7D32]">New User Offer</h3>
          <p className="text-gray-600 mt-2">
            Get <span className="font-bold text-green-600">20% OFF</span> on
            your first order.
          </p>
        </div>

        <div className="bg-[#EFF3F1] rounded-2xl border border-blue-200 shadow-sm p-6">
          <Crown className="text-yellow-700 mb-4" size={36} />
          <h3 className="text-xl font-bold text-[#2E7D32]">Plus Membership</h3>
          <p className="text-gray-600 mt-2">
            Extra <span className="font-bold text-green-600">5% OFF</span> +
            Free Delivery.
          </p>
        </div>

        <div className="bg-[#EFF3F1] rounded-2xl border border-blue-200 shadow-sm p-6">
          <Award className="text-yellow-700 mb-4" size={36} />
          <h3 className="text-xl font-bold text-[#2E7D32]">Loyalty Rewards</h3>
          <p className="text-gray-600 mt-2">
            Earn points on every purchase and redeem discounts.
          </p>
        </div>
      </div>

      <section className="my-8 rounded-xl bg-[#EFF3F1] border border-blue-200 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#795548]">
              Featured
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-[#2E7D32]">
              Featured Products
            </h2>

            {isAdmin && (
              <p className="text-sm text-gray-900 mt-1">
                {products.filter((p) => p.isPinned).length}/50 Products
              </p>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/products")}
              className=" font-semibold px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition"
            >
              Manage
            </button>
          )}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {pinnedProducts.length > 0 ? (
            pinnedProducts.map((product) => (
              <div key={product._id} className="relative group">
                <ProductCard product={product} />

                {isAdmin && (
                  <button
                    onClick={() => handleRemoveFromHome(product._id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No featured products available.
            </div>
          )}
        </div>
      </section>

      <footer className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#EFF3F1] text-[#2E7D32] pt-8 sm:pt-12 md:pt-16 pb-5 sm:pb-8 mt-10 sm:mt-14 md:mt-20 overflow-hidden border border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-3  sm:gap-8 md:gap-10">
          <div className="space-y-2 sm:space-y-3 sm:text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black  tracking-tight">
              FreshCart
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm  leading-relaxed max-w-[220px]  sm:mx-0">
              Your destination for farm-fresh produce. Quality you can taste.
            </p>
          </div>

          <div className=" sm:text-left">
            <h3 className=" font-bold mb-2 mt-2 sm:mb-4 uppercase text-[10px] sm:text-xs tracking-widest">
              Explore
            </h3>
            <ul className="text-[11px] sm:text-xs md:text-sm space-y-2">
              <li>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className=""
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("category-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className=""
                >
                  Shop Categories
                </button>
              </li>
            </ul>
          </div>

          <div className=" sm:text-left">
            <h3 className=" font-bold mb-2 mt-2 sm:mb-4 uppercase text-[10px] sm:text-xs tracking-widest">
              Support
            </h3>
            <div className="text-[11px] sm:text-xs md:text-sm space-y-1.5 sm:space-y-2 ">
              <p>
                <span className="">Email:</span> freshcart1234@gmail.com
              </p>
              <p>
                <span className="">Call:</span> +91 78100 70xxx
              </p>
            </div>
          <p className="text-[10px] pt-2">
            @Copyright 2026 FreshCart. All Rights
            Reserved.
          </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
