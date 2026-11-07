import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import {
  calculateDiscountedPrice,
  calculateDeliveryCharge,
} from "../utils/offerUtils";
import {
  CreditCard,
  Truck,
  X,
  CheckCircle,
  MapPin,
  Navigation,
  Trash2,
  Plus,
} from "lucide-react";

const TN_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thiruvallur",
  "Tirupattur",
  "Tiruppur",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tiruvannamalai",
  "Tiruvarur",
  "Thoothukudi",
  "Vellore",
  "Villupuram",
  "Virudhunagar",
];

const API = import.meta.env.VITE_API_URL;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Address & User Sync
  const [dbUser, setDbUser] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressInput, setAddressInput] = useState({
    fullAddress: "",
    pinCode: "",
    phone: "",
    district: "",
  });
  const [editingAddress, setEditingAddress] = useState(null);

  // Admin States
  const [showAdminEdit, setShowAdminEdit] = useState(false);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editMfgDate, setEditMfgDate] = useState("");
  const [editExpDate, setEditExpDate] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editDiscountedPrice, setEditDiscountedPrice] = useState(0);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = useMemo(() => {
    return {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${userInfo?.token}`,
      },
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Profile request
        try {
          const profileRes = await axios.get(
            `${API}/api/users/profile`,
            config,
          );

          setDbUser(profileRes.data);

          if (profileRes.data.addresses?.length > 0) {
            setSelectedAddress(profileRes.data.addresses[0]);
          }
        } catch (err) {
          console.log("User not logged in");
        }

        // Product request
        const { data } = await axios.get(`${API}/api/products/${id}`);
        setProduct(data);
        setMainImage(data.images?.[0] || "");

        const simRes = await axios.get(
          `${API}/api/products/category/${data.category}`,
        );

        setSimilarProducts(simRes.data.filter((p) => p._id !== id));
      } catch (err) {
        console.error("Product Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (showAdminEdit && product) {
      setEditQuantity(product.quantity || 0);
      setEditMfgDate(
        product.manufacturingDate
          ? product.manufacturingDate.split("T")[0]
          : "",
      );
      setEditExpDate(
        product.expiryDate ? product.expiryDate.split("T")[0] : "",
      );
      setEditBrand(product.brand || "");
      setEditPrice(product.price || 0);
      setEditDiscountedPrice(product.discountedPrice || 0);
    }
  }, [showAdminEdit, product]);

  const saveNewAddress = async () => {
    if (
      !addressInput.fullAddress ||
      !addressInput.pinCode ||
      !addressInput.phone ||
      !addressInput.district
    )
      return alert("Fill all fields including district");
    try {
      const { data } = await axios.post(
        `${API}/api/users/address`,
        addressInput,
        config,
      );
      setDbUser({ ...dbUser, addresses: data });
      setSelectedAddress(data[data.length - 1]);
      setShowAddressForm(false);
      setAddressInput({
        fullAddress: "",
        pinCode: "",
        phone: "",
        district: "",
      });
    } catch {
      alert("Failed to save address");
    }
  };

  const saveEditedAddress = async () => {
    if (!editingAddress) return;
    if (
      !editingAddress.fullAddress ||
      !editingAddress.pinCode ||
      !editingAddress.phone ||
      !editingAddress.district
    )
      return alert("Fill all fields including district");
    try {
      const { data } = await axios.put(
        `${API}/api/users/address/${editingAddress._id}`,
        editingAddress,
        config,
      );
      setDbUser({ ...dbUser, addresses: data });
      if (selectedAddress?._id === editingAddress._id) {
        const fresh = data.find((a) => a._id === editingAddress._id);
        if (fresh) setSelectedAddress(fresh);
      }
      setEditingAddress(null);
    } catch {
      alert("Failed to update address");
    }
  };

  const { finalPrice, totalDiscount, appliedLabel, mrp, offerDetails } =
    useMemo(() => {
      if (!product)
        return {
          finalPrice: 0,
          totalDiscount: 0,
          appliedLabel: "",
          mrp: 0,
          offerDetails: {},
        };

      const isNewUser = dbUser ? dbUser.firstOrderCompleted === false : false;
      const loyaltyPoints = Number(dbUser?.loyaltyPoints || 0);
      const isPlusMember = dbUser?.isPlusMember || false;

      const result = calculateDiscountedPrice(
        product,
        { isNewUser, loyaltyPoints, isPlusMember },
        {
          isLowestPriceItem: true,
          isFirstOrder: isNewUser,
          quantityIndex: 0,
        },
      );

      return {
        finalPrice: result.finalPrice,
        totalDiscount: result.totalDiscount,
        appliedLabel: result.appliedLabel,
        mrp: result.mrp,
        offerDetails: result.offerDetails,
      };
    }, [product, dbUser]);

  const deliveryCharge = calculateDeliveryCharge(finalPrice, dbUser);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen font-bold text-green-600">
        Loading...
      </div>
    );
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        Product not found
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 10;

  return (
    <>
      {/* Product Image */}
      <div className=" rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-center h-[390px] p-8">
          <img
            src={
              mainImage?.startsWith("http") ? mainImage : `${API}${mainImage}`
            }
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="px-5 pb-6">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {product.brand || "FreshCart"}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800">
            {product.name}
          </h1>

          {appliedLabel && (
            <span className="inline-block mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {appliedLabel}
            </span>
          )}

          {/* Price */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-bold text-[#2E7D32]">
              ₹{finalPrice}
            </span>

            {mrp > finalPrice && (
              <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
            )}

            {totalDiscount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
                {totalDiscount}% OFF
              </span>
            )}
          </div>

          {mrp > finalPrice && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              You save ₹{mrp - finalPrice}
            </p>
          )}

          {/* Delivery */}
          <div className="mt-5 space-y-2 text-sm">
            <p className="text-green-600">✓ Free Delivery</p>

            <p className="text-gray-600">Delivered within 10-20 mins</p>

            {isOutOfStock ? (
              <p className="font-semibold text-red-600">Out of Stock</p>
            ) : isLowStock ? (
              <p className="font-semibold text-orange-500">
                Only {product.quantity} left
              </p>
            ) : (
              <p className="font-semibold text-green-600">In Stock</p>
            )}
          </div>

          {/* Description */}

          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Description</h2>

            <p
              className={`text-gray-600 leading-7 ${
                showFullDesc ? "" : "line-clamp-3"
              }`}
            >
              {product.description}
            </p>

            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="mt-2 text-sm font-semibold text-green-600"
            >
              {showFullDesc ? "Show Less" : "Read More"}
            </button>
          </div>
        </div>
      </div>

      {/* Similar Products */}

      <div className="mt-4 bg-white rounded-2xl p-5 pb-28">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Similar Products</h2>

          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-green-600"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {similarProducts.slice(0, 5).map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}

      {product.quantity > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t p-3">
          <div className="flex gap-3">
            <button
              onClick={() => addToCart({ ...product, finalPrice })}
              className="flex-1 rounded-xl border border-gray-300 py-3 font-semibold hover:bg-gray-100"
            >
              Add to Cart
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 rounded-xl border border-[#2E7D32] bg-[#2E7D32] py-3 font-semibold text-white hover:bg-[#1B5E20] transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Checkout</h2>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1"
              >
                <X size={22} />
              </button>
            </div>

            {/* Saved Address */}

            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">
              Delivery Address
            </h3>

            <div className="space-y-3">
              {dbUser?.addresses?.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    selectedAddress?._id === addr._id
                      ? "border-[#6FAF8E] bg-green-50"
                      : "border-gray-300 hover:border-[#6FAF8E]"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {addr.fullAddress}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {addr.district}
                      </p>

                      <p className="text-xs text-gray-500">
                        {addr.pinCode} • {addr.phone}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setEditingAddress({
                          ...addr,
                          district: addr.district || "",
                        });
                      }}
                      className="text-xs font-semibold text-green-600"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Address */}

            {editingAddress && (
              <div className="mt-6 rounded-xl border p-4 bg-gray-50">
                <h3 className="font-semibold mb-4">Edit Address</h3>

                <textarea
                  rows={3}
                  className="w-full rounded-lg border p-3 mb-3 outline-none"
                  value={editingAddress.fullAddress}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      fullAddress: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full rounded-lg border p-3 mb-3"
                  value={editingAddress.district}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      district: e.target.value,
                    })
                  }
                >
                  <option value="">Select District</option>

                  {TN_DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    className="rounded-lg border p-3"
                    placeholder="Pincode"
                    value={editingAddress.pinCode}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        pinCode: e.target.value,
                      })
                    }
                  />

                  <input
                    className="rounded-lg border p-3"
                    placeholder="Phone"
                    value={editingAddress.phone}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveEditedAddress}
                    className="flex-1 rounded-xl bg-[#6FAF8E] py-3 text-white font-semibold"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditingAddress(null)}
                    className="flex-1 rounded-xl border py-3 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add Address */}

            <div className="mt-6 rounded-xl border border-dashed p-4">
              <h3 className="font-semibold mb-4">Add New Address</h3>

              <textarea
                rows={3}
                className="w-full rounded-lg border p-3 mb-3"
                placeholder="Full Address"
                value={addressInput.fullAddress}
                onChange={(e) =>
                  setAddressInput({
                    ...addressInput,
                    fullAddress: e.target.value,
                  })
                }
              />

              <select
                className="w-full rounded-lg border p-3 mb-3"
                value={addressInput.district}
                onChange={(e) =>
                  setAddressInput({
                    ...addressInput,
                    district: e.target.value,
                  })
                }
              >
                <option value="">Select District</option>

                {TN_DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  className="rounded-lg border p-3"
                  placeholder="Pincode"
                  value={addressInput.pinCode}
                  onChange={(e) =>
                    setAddressInput({
                      ...addressInput,
                      pinCode: e.target.value,
                    })
                  }
                />

                <input
                  className="rounded-lg border p-3"
                  placeholder="Phone"
                  value={addressInput.phone}
                  onChange={(e) =>
                    setAddressInput({
                      ...addressInput,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <button
                onClick={saveNewAddress}
                className="w-full rounded-xl bg-[#6FAF8E] py-3 text-white font-semibold"
              >
                Save Address
              </button>
            </div>

            {/* Order Summary */}

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>MRP Total</span>
                  <span>₹{mrpTotal}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Base Discount</span>
                  <span>-₹{Math.round(baseDiscount)}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Expiry Discount</span>
                  <span>-₹{Math.round(expiryDiscount)}</span>
                </div>

                {specialDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {userInfo?.isPlusMember
                        ? "Plus Discount"
                        : userInfo?.firstOrderCompleted === false
                          ? "New User Offer"
                          : userInfo?.loyaltyPoints >= 20
                            ? "Loyalty Discount"
                            : "Special Discount"}
                    </span>

                    <span>-₹{Math.round(specialDiscount)}</span>
                  </div>
                )}

                <hr />

                <div className="flex justify-between font-semibold text-[#2E7D32]">
                  <span>Total Savings</span>
                  <span>₹{Math.round(totalSavings)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charge</span>

                  <span className="font-semibold text-green-600">
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-xl font-bold">
                  <span>Final Amount</span>

                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Payment */}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

              <div className="space-y-3">
                {/* Online */}

                <button
                  onClick={() => {
                    setPaymentMethod("ONLINE");
                    processPayment();
                  }}
                  disabled={loading || !selectedAddress}
                  className={`w-full rounded-xl py-3 font-semibold transition ${
                    loading
                      ? "bg-gray-300 text-white"
                      : "bg-[#6FAF8E] text-white hover:bg-green-700"
                  }`}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      💳 Pay Online
                      <div className="text-xs font-normal mt-1 opacity-90">
                        Razorpay
                      </div>
                    </>
                  )}
                </button>

                {/* COD */}

                <button
                  onClick={() => {
                    setPaymentMethod("COD");
                    placeOrder();
                  }}
                  disabled={loading || !selectedAddress}
                  className={`w-full rounded-xl border py-3 font-semibold transition ${
                    loading ? "bg-gray-100 text-gray-400" : "hover:bg-gray-100"
                  }`}
                >
                  {loading ? (
                    "Placing Order..."
                  ) : (
                    <>
                      🚚 Cash on Delivery
                      <div className="text-xs text-gray-500 mt-1">
                        Pay after delivery
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Address */}

            {selectedAddress && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-700">
                  Deliver To
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  {selectedAddress.fullAddress}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {selectedAddress.district} • {selectedAddress.pinCode}
                </p>

                <p className="text-xs text-gray-500">{selectedAddress.phone}</p>
              </div>
            )}

            {/* Footer */}

            <div className="mt-6 text-center text-xs text-gray-400">
              Orders are processed securely using Razorpay.
              <br />
              Your payment information is never stored.
            </div>
          </div>
        </div>
      )}
      {/* ---------------- ORDER SUCCESS ---------------- */}

      {orderSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
            {/* Success Icon */}

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={42} className="text-green-600" />
            </div>

            {/* Title */}

            <h2 className="mt-5 text-2xl font-bold text-gray-800">
              Order Confirmed 🎉
            </h2>

            {/* Message */}

            <p className="mt-3 text-sm text-gray-500 leading-6">
              Thank you for shopping with
              <span className="font-semibold text-green-600"> FreshCart</span>
              <br />
              Your order has been placed successfully.
            </p>

            {/* Order Details */}

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>

                <span className="font-semibold">₹{grandTotal}</span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>

                <span className="font-semibold">{paymentMethod}</span>
              </div>
            </div>

            {/* Buttons */}

            <div className="mt-7 space-y-3">
              <button
                onClick={() => navigate("/myorders")}
                className="w-full rounded-xl bg-[#6FAF8E] py-3 font-semibold text-white hover:bg-green-700"
              >
                View My Orders
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full rounded-xl border border-gray-300 py-3 font-semibold hover:bg-gray-100"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;
