import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  CreditCard,
  Truck,
  Plus,
  Minus,
  CheckCircle,
  ShoppingBag,
  ChevronRight,
  MapPin,
  X,
  Navigation,
} from "lucide-react";
import {
  calculateDiscountedPrice,
  calculateDeliveryCharge,
} from "../utils/offerUtils";

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
const Cart = () => {
  const { cartItems, fetchCart, setCartItems } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressInput, setAddressInput] = useState({
    fullAddress: "",
    pinCode: "",
    phone: "",
    district: "",
  });
  const [locating, setLocating] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const config = {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
    withCredentials: true,
  };

  const isNewUser = dbUser?.firstOrderCompleted === false;
  const loyaltyPoints = Number(dbUser?.loyaltyPoints || 0);
  const isPlusMember = dbUser?.isPlusMember || false;

  useEffect(() => {
    const syncUser = async () => {
      if (!userInfo?._id) return;

      try {
        const { data } = await axios.get(`${API}/api/users/profile`, config);
        setDbUser(data);
        if (data.addresses?.length > 0) setSelectedAddress(data.addresses[0]);
      } catch (err) {
        console.error(err);
      }
    };
    syncUser();
    if (!window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [config, fetchCart]);

  const cartWithPrices = useMemo(() => {
    if (!cartItems.length) return [];
    const getMrp = (item) => Number(item.price) || 0;
    const lowestIndex = cartItems.reduce(
      (minIdx, item, i, arr) =>
        getMrp(arr[i]) < getMrp(arr[minIdx]) ? i : minIdx,
      0,
    );
    const userCtx = { isNewUser, loyaltyPoints, isPlusMember };

    return cartItems.map((item, index) => {
      const populated =
        item.product && typeof item.product === "object" ? item.product : {};
      const productData = {
        ...populated,
        price: item.price,
        discountedPrice: item.discountedPrice,
        name: item.name,
        quantity: item.quantity,
      };
      const isLowest = index === lowestIndex;

      const firstResult = calculateDiscountedPrice(productData, userCtx, {
        isLowestPriceItem: isLowest,
        isFirstOrder: isNewUser,
        quantityIndex: 0,
      });
      const restResult =
        item.quantity > 1
          ? calculateDiscountedPrice(productData, userCtx, {
              isLowestPriceItem: false,
              isFirstOrder: false,
              quantityIndex: 1,
            })
          : null;

      const firstPrice = firstResult.finalPrice;
      const restPrice = restResult ? restResult.finalPrice : firstPrice;
      const total = firstPrice + Math.max(0, item.quantity - 1) * restPrice;

      return {
        ...item,
        displayPrice: firstPrice,
        restQtyPrice: restPrice,
        totalItemPrice: total,
        mrp: firstResult.mrp,
        totalSavings: firstResult.offerDetails.totalSavings,
        offerDetails: firstResult.offerDetails,
      };
    });
  }, [cartItems, dbUser]);

  const totalPrice = useMemo(
    () => cartWithPrices.reduce((s, i) => s + i.totalItemPrice, 0),
    [cartWithPrices],
  );
  const deliveryCharge = calculateDeliveryCharge(totalPrice, dbUser);
  const grandTotal = totalPrice + deliveryCharge;

  const mrpTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const baseDiscount = cartWithPrices.reduce(
    (sum, item) => sum + (item.offerDetails?.baseDiscountAmount || 0),
    0,
  );

  const expiryDiscount = cartWithPrices.reduce(
    (sum, item) => sum + (item.offerDetails?.expiryDiscountAmount || 0),
    0,
  );

  const specialDiscount = cartWithPrices.reduce(
    (sum, item) =>
      sum +
      (item.offerDetails?.newUserDiscountAmount || 0) +
      (item.offerDetails?.loyaltyDiscountAmount || 0) +
      (item.offerDetails?.plusDiscountAmount || 0),
    0,
  );

  const totalSavings = baseDiscount + expiryDiscount + specialDiscount;

  const updateQuantity = async (productId, qty) => {
    if (qty < 1) return;
    try {
      await axios.put(
        `${API}/api/cart/${productId}`,
        { quantity: qty },
        config,
      );
      setCartItems(
        cartItems.map((i) =>
          (i.product?._id || i.product) === productId
            ? { ...i, quantity: qty }
            : i,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API}/api/cart/${productId}`, config);
      setCartItems(
        cartItems.filter((i) => (i.product?._id || i.product) !== productId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const saveNewAddress = async () => {
    if (
      !addressInput.fullAddress ||
      !addressInput.pinCode ||
      !addressInput.phone
    )
      return alert("Fill all fields");
    try {
      const { data } = await axios.post(
        `${API}/api/users/address`,
        addressInput,
        config,
      );
      setDbUser({ ...dbUser, addresses: data });
      setSelectedAddress(data[data.length - 1]);
      setAddressInput({
        fullAddress: "",
        pinCode: "",
        phone: "",
        district: "",
      });
    } catch (err) {
      console.log(err.response);
      console.log(err.response?.data);
      console.log(err.message);
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

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      const { data } = await axios.delete(
        `${API}/api/users/address/${id}`,
        config,
      );

      setDbUser({ ...dbUser, addresses: data });

      if (selectedAddress?._id === id) {
        setSelectedAddress(data[0] || null);
      }

      if (editingAddress?._id === id) {
        setEditingAddress(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete address");
    }
  };

  const buildOrderPayload = (method, isPaid) => ({
    orderItems: cartWithPrices.map((i) => ({
      product: typeof i.product === "object" ? i.product._id : i.product,
      name: i.name,
      qty: i.quantity,
      price: i.displayPrice,
      mrp: i.price,
      image: i.image,
      offerDetails: i.offerDetails || {},
    })),
    totalPrice: grandTotal,
    paymentMethod: method,
    isPaid,
    shippingAddress: {
      address: selectedAddress.fullAddress,
      city: selectedAddress.district || "Tamil Nadu",
      postalCode: selectedAddress.pinCode,
      phone: selectedAddress.phone,
      district: selectedAddress.district || "",
    },
  });

  const processPayment = async () => {
    if (!selectedAddress) {
      alert("Select a delivery address");
      return;
    }

    setLoading(true);
    setLoadingText("Preparing checkout...");
    setShowAddressForm(false);

    try {
      if (paymentMethod === "COD") {
        const { data } = await axios.post(
          `${API}/api/orders`,
          buildOrderPayload("COD", false),
          config,
        );

        setCartItems([]);
        setOrderSuccess(true);

        axios.delete(`${API}/api/cart`, config).catch(console.error);

        return;
      }
      const { data: order } = await axios.post(
        `${API}/api/orders`,
        buildOrderPayload("ONLINE", false),
        config,
      );

      const mongoOrderId = order._id;

      setLoadingText("Creating payment...");

      const { data: razorpayOrder } = await axios.post(
        `${API}/api/payment/create-order`,
        {
          amount: grandTotal,
        },
        config,
      );

      setLoading(false);

      const razorpay = new window.Razorpay({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "FreshCart",

        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: selectedAddress.phone,
        },

        theme: {
          color: "#16a34a",
        },

        handler: async (response) => {
          try {
            setLoading(true);
            await axios.post(
              `${API}/api/payment/verify`,
              {
                orderId: mongoOrderId,

                razorpay_order_id: response.razorpay_order_id,

                razorpay_payment_id: response.razorpay_payment_id,

                razorpay_signature: response.razorpay_signature,
              },
              config,
            );
            setCartItems([]);
            setOrderSuccess(true);

            axios.delete(`${API}/api/cart`, config).catch(console.error);

            setLoading(false);
          } catch (err) {
            setLoading(false);
            alert("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Checkout failed");
    }
  };

  if (orderSuccess)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-white px-6"
      >
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={42} className="text-green-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Order Confirmed
          </h1>

          <h4 className="mt-3 text-gray-500 leading-7">
            Your order has been placed successfully.
          </h4>

          <button
            onClick={() => navigate("/myorders")}
            className="mt-8 w-1/2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] py-3 font-semibold text-white transition"
          >
            View Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-3 w-1/2 rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    );

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="mt-5 text-lg font-semibold text-green-700">
          {loadingText}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex justify-between">
        <h1 className="text-2xl font-bold text-[#2E7D32]">Cart</h1>
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
          {cartItems.length} Item(s)
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex min-h-[45vh] items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900 mb-5">
              Your Cart is Empty
            </h2>
            <button
              onClick={() => navigate("/")}
              className="flex-1 rounded-xl border border-[#2E7D32] bg-[#2E7D32] py-3 px-3 font-semibold text-white hover:bg-[#1B5E20] transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-5">
            {cartWithPrices.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow border p-5 flex gap-5"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-contain bg-gray-100 rounded-lg mt-5"
                />

                {/* Details */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-green-600">
                      ₹{item.displayPrice}
                    </span>

                    {item.mrp > item.displayPrice && (
                      <span className="text-gray-400 line-through">
                        ₹{item.mrp}
                      </span>
                    )}
                  </div>

                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Total : ₹{item.totalItemPrice}
                    </p>
                  )}

                  {/* Quantity */}

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product?._id || item.product,
                          item.quantity - 1,
                        )
                      }
                      className="w-9 h-9 rounded border hover:bg-gray-100 pl-2"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="font-semibold">{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product?._id || item.product,
                          item.quantity + 1,
                        )
                      }
                      className="w-9 h-9 rounded border hover:bg-gray-100 pl-2"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Remove */}

                <button
                  onClick={() =>
                    removeFromCart(item.product?._id || item.product)
                  }
                  className="text-red-500 hover:text-red-700 font-bold mt-32"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Right Side */}

          <div>
            <div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

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

              {/* Payment */}

              <div className="mt-8">
                <h3 className="font-semibold mb-3">Payment Method</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                    />

                    <CreditCard size={18} />

                    <span>Online Payment</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />

                    <Truck size={18} />

                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setShowAddressForm(true)}
                disabled={loading}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Checkout Now"}

                {!loading && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-semibold">Select Delivery Address</h2>

              <button
                onClick={() => setShowAddressForm(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={22} />
              </button>
            </div>

            {/* Saved Addresses */}
            <div className="p-5 max-h-72 overflow-y-auto">
              <h3 className="font-semibold mb-3">Saved Addresses</h3>

              {dbUser?.addresses?.length ? (
                <div className="space-y-3">
                  {dbUser.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`border rounded-lg p-4 cursor-pointer transition
                      ${
                        selectedAddress?._id === addr._id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{addr.fullAddress}</p>

                          <p className="text-sm text-gray-500 mt-1">
                            {addr.district}
                          </p>

                          <p className="text-sm text-gray-500">
                            {addr.pinCode}
                          </p>

                          <p className="text-sm text-gray-500">{addr.phone}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              setEditingAddress({
                                _id: addr._id,
                                fullAddress: addr.fullAddress,
                                district: addr.district,
                                pinCode: addr.pinCode,
                                phone: addr.phone,
                              });
                            }}
                            className="text-green-600 text-sm font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(addr._id);
                            }}
                            className="text-red-500 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No address found.</p>
              )}

              {editingAddress && (
                <div className="mt-6 border rounded-xl p-5 bg-gray-50">
                  <h3 className="font-bold text-lg mb-4">Edit Address</h3>

                  <textarea
                    rows={3}
                    className="w-full border rounded-lg p-3 mb-3"
                    value={editingAddress.fullAddress}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        fullAddress: e.target.value,
                      })
                    }
                  />

                  <select
                    className="w-full border rounded-lg p-3 mb-3"
                    value={editingAddress.district}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress,
                        district: e.target.value,
                      })
                    }
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      className="border rounded-lg p-3"
                      value={editingAddress.pinCode}
                      onChange={(e) =>
                        setEditingAddress({
                          ...editingAddress,
                          pinCode: e.target.value,
                        })
                      }
                    />

                    <input
                      className="border rounded-lg p-3"
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
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => setEditingAddress(null)}
                      className="flex-1 border py-3 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Add Address */}

              <div className="mt-8 border-t pt-5">
                <h3 className="font-semibold mb-3">Add New Address</h3>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Full Address"
                    value={addressInput.fullAddress}
                    onChange={(e) =>
                      setAddressInput({
                        ...addressInput,
                        fullAddress: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-3"
                  />

                  <select
                    value={addressInput.district}
                    onChange={(e) =>
                      setAddressInput({
                        ...addressInput,
                        district: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-3"
                  >
                    <option value="">Select District</option>

                    {TN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={addressInput.pinCode}
                      onChange={(e) =>
                        setAddressInput({
                          ...addressInput,
                          pinCode: e.target.value,
                        })
                      }
                      className="border rounded-lg p-3"
                    />

                    <input
                      type="text"
                      placeholder="Phone"
                      value={addressInput.phone}
                      onChange={(e) =>
                        setAddressInput({
                          ...addressInput,
                          phone: e.target.value,
                        })
                      }
                      className="border rounded-lg p-3"
                    />
                  </div>

                  <button
                    onClick={saveNewAddress}
                    className="w-full bg-green-600 text-white rounded-lg py-3 hover:bg-green-700"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="border-t p-5">
              <button
                onClick={processPayment}
                disabled={!selectedAddress || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:bg-green-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
              >
                {loading ? loadingText : `Confirm & Pay ₹${grandTotal}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Cart;
