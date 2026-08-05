import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  XCircle,
  CheckCircle,
  User,
  MapPin,
  Package,
  CreditCard,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-green-700 mb-4">{title}</h2>

    {children}
  </div>
);

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${API}/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });

      setOrder(data);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Order not found.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#6FAF8E] rounded-full"></div>
      </div>
    );
  }

  if (error || !order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF7] px-6">
        <div className="bg-white rounded-xl shadow border p-8 text-center max-w-md w-full">
          <XCircle size={50} className="text-red-500 mx-auto mb-4" />

          <h2 className="text-xl font-semibold mb-2">{error}</h2>

          <Link
            to="/myorders"
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );

  const localUser = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const isPlusMember = order.user?.isPlusMember || localUser?.isPlusMember;

  const deliveryCharge = order.itemsPrice >= 299 || isPlusMember ? 0 : 39;

  const actualPrice =
    order.itemsPrice ??
    order.orderItems.reduce(
      (sum, item) => sum + (item.mrp || item.price) * item.qty,
      0,
    );

  const sellingPrice = order.orderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const discount = actualPrice - sellingPrice;

  const orderInfo = [
    {
      label: "Order ID",
      value: order._id,
    },

    {
      label: "Placed On",
      value: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },

    {
      label: "Time",
      value: new Date(order.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ];

  const showRefundMessage =
    order.isPaid && order.isCancelled && !order.isRefunded;

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl">
      {/* Header */}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex gap-2">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="p-4 hover:bg-gray-100 rounded-xl text-gray-500 transition"
          >
            <ChevronLeft size={30} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2E7D32]">Order Details</h1>
          <p className="text-base text-gray-500 mt-2">#{order._id}</p>
        </div>
      </div>

      <main className=" mx-auto space-y-5">
        {/* Refund Message */}

        {showRefundMessage && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex gap-3">
            <Clock size={22} className="text-yellow-600 mt-1" />

            <div>
              <h3 className="font-semibold text-yellow-800">Order Cancelled</h3>

              <p className="text-sm text-yellow-700">
                Your payment has been received. Refund will be processed within
                7 working days.
              </p>
            </div>
          </div>
        )}

        {/* Order Information */}

        <Section title="Order Information">
          <div className="space-y-3">
            {orderInfo.map((item) => (
              <div
                key={item.label}
                className="flex justify-between border-b pb-2 last:border-0"
              >
                <span className="text-gray-600">{item.label}</span>

                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-blue-600" size={22} />
              <h2 className="text-lg font-semibold">Customer Details</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-800">
                  {order?.user?.name || order?.customerName || "Guest User"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-800">
                  {order?.user?.email || order?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">
                  {order?.shippingAddress?.phone || order?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-green-600" size={22} />
              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>

            {order?.shippingAddress ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.name}
                </p>

                <p>{order.shippingAddress.address}</p>

                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>

                <p>
                  {order.shippingAddress.country} -{" "}
                  {order.shippingAddress.postalCode}
                </p>

                <p className="mt-3 flex items-center gap-2">
                  <span className="font-medium">Phone:</span>

                  {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Address information not available
              </p>
            )}
          </div>
        </div>
        {/* Order Items Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <div className="flex items-center gap-3 mb-5">
            <Package className="text-purple-600" size={22} />
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>

          <div className="space-y-4">
            {order?.orderItems?.length > 0 ? (
              order.orderItems.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border rounded-lg p-4"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />

                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.qty}
                      </p>

                      {item.expiryDate && (
                        <p className="text-sm text-gray-500">
                          Expiry:{" "}
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹{item.price}
                      {item.mrp > item.price && (
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          ₹{item.mrp}
                        </span>
                      )}
                    </p>

                    {item.mrp > item.price && (
                      <p className="text-xs text-green-600">
                        Saved ₹{(item.mrp - item.price) * item.qty}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">
                      Total: ₹{(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No items found in this order
              </p>
            )}
          </div>
        </div>

        {/* Refund Completed */}
        {order.isRefunded && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex gap-3">
            <CheckCircle size={22} className="text-green-600 mt-1" />

            <div>
              <h3 className="font-semibold text-green-800">Refund Completed</h3>

              <p className="text-sm text-green-700">
                ₹{order.totalPrice} has been refunded successfully.
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Refunded on{" "}
                {new Date(order.refundedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-5">
              <CreditCard className="text-blue-600" size={22} />

              <h2 className="text-lg font-semibold">Payment Details</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>

                <span className="font-medium text-gray-800">
                  {order?.paymentMethod || "Cash on Delivery"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>

                <span
                  className={`font-medium ${
                    order.isRefunded
                      ? "text-purple-600"
                      : order.isPaid
                        ? "text-green-600"
                        : "text-orange-600"
                  }`}
                >
                  {order.isRefunded
                    ? "Refunded"
                    : order.isPaid
                      ? "Paid"
                      : "Pending"}
                </span>
              </div>
              {order.isCancelled && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Refund Status</span>

                  <span
                    className={`font-medium ${
                      order.isRefunded ? "text-purple-600" : "text-yellow-600"
                    }`}
                  >
                    {order.refundStatus}
                  </span>
                </div>
              )}

              {order.refundedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Refunded On</span>

                  <span className="font-medium">
                    {new Date(order.refundedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              {order?.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid On</span>

                  <span className="font-medium">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          {/* Price Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-5">
              <Package className="text-green-600" size={22} />
              <h2 className="text-lg font-semibold">Price Summary</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Actual Price</span>
                <span className="font-medium">₹{actualPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-green-600">
                  - ₹{discount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Charge</span>
                <span className="font-medium">
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">Total Paid</span>

                <span className="font-bold text-lg text-green-700">
                  ₹{(order.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Action */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate("/myorders")}
            className="px-5 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            Back to Orders
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
