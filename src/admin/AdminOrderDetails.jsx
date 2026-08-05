import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  CreditCard,
  Phone,
  CheckCircle,
  RefreshCcw,
  Truck,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const Row = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
  };
  return (
    <div
      className={`flex items-center justify-between border rounded-lg px-2.5 py-1 ${colors[color] || colors.blue}`}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[9px] font-bold">{label}</span>
      </div>
      <span className="text-[9px] font-black">{value}</span>
    </div>
  );
};

const FactorRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1 text-purple-400">
      {icon}
      <span className="text-[8px] text-gray-500">{label}</span>
    </div>
    <span className="text-[8px] font-black text-purple-600">{value}</span>
  </div>
);

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const { data } = await axios.get(`${API}/api/orders/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setOrder(data);
    } catch {
      setError("Order not found ❌");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateOrderStatus = async (action) => {
    try {
      setBtnLoading(true);
      const url =
        action === "cancel"
          ? `${API}/api/orders/admin/${id}/cancel`
          : `${API}/api/orders/${id}/${action}`;
      await axios.put(url, {}, { withCredentials: true });
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} order`);
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black text-[#6FAF8E] animate-pulse text-sm tracking-widest">
        Syncing Admin Portal...
      </div>
    );
  if (error || !order)
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 gap-4">
        <XCircle size={50} className="text-red-500" />
        <p className="font-bold text-gray-600">{error}</p>
      </div>
    );

  const itemsPriceSum = order.orderItems.reduce(
    (acc, i) => acc + i.price * i.qty,
    0,
  );
  const _localUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const isPlusMember = !!(order.user?.isPlusMember || _localUser?.isPlusMember);
  const deliveryFee = isPlusMember ? 0 : itemsPriceSum >= 299 ? 0 : 39;

  const showDeliverBtn = !order.isDelivered && !order.isCancelled;
  const showCancelBtn = !order.isDelivered && !order.isCancelled;
  const showRefundBtn = order.refundStatus === "Pending";

  const statusChips = [
    {
      show: order.isPaid,
      label: `Paid · ${order.paymentMethod}`,
      bg: "bg-green-100 text-green-700",
    },
    {
      show: !order.isPaid,
      label: "Unpaid",
      bg: "bg-red-100 text-red-600",
    },
    {
      show: order.isDelivered,
      label: "Delivered",
      bg: "bg-blue-100 text-blue-700",
    },
    {
      show: order.isCancelled,
      label: "Cancelled",
      bg: "bg-orange-100 text-orange-700",
    },
    {
      show: order.refundStatus === "Pending",
      label: "Refund Pending",
      bg: "bg-[#EFF3F1] text-yellow-700",
    },
    {
      show: order.refundStatus === "Approved",
      label: "Refund Approved",
      bg: "bg-green-100 text-green-700",
    },
  ].filter((s) => s.show);

 return (
   <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#2E7D32]"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2E7D32]">
              Order Details
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              {order._id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!order.isDelivered && !order.isCancelled && (
            <button
              disabled={btnLoading}
              onClick={() => updateOrderStatus("deliver")}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium disabled:opacity-60"
            >
              Mark Delivered
            </button>
          )}

          {!order.isDelivered && !order.isCancelled && (
            <button
              disabled={btnLoading}
              onClick={() => updateOrderStatus("cancel")}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-60"
            >
              Cancel
            </button>
          )}

          {order.refundStatus === "Pending" && (
            <button
              disabled={btnLoading}
              onClick={() => updateOrderStatus("refund")}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-sm font-medium disabled:opacity-60"
            >
              Approve Refund
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <CreditCard size={16} /> Payment
          </div>
          <p className="font-semibold text-gray-800">
            {order.isPaid ? "Paid" : "Unpaid"}
          </p>
          <p className="text-sm text-gray-500">{order.paymentMethod}</p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Package size={16} /> Status
          </div>
          <p className="font-semibold text-gray-800">{order.orderStatus}</p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Truck size={16} /> Delivery
          </div>
          <p className="font-semibold text-gray-800">
            {order.isDelivered ? "Delivered" : "Pending"}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <RefreshCcw size={16} /> Refund
          </div>
          <p className="font-semibold text-gray-800">{order.refundStatus}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border rounded-xl">
          <div className="border-b px-4 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Order Items</h2>
            <span className="text-sm text-gray-500">
              {order.orderItems.length} item(s)
            </span>
          </div>

          <div className="p-4 space-y-3">
            {order.orderItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between border rounded-lg p-3 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain bg-gray-50 rounded-lg p-1 border"
                  />

                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} × {item.qty}
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-gray-900 whitespace-nowrap">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Customer</h2>

            <p className="font-medium text-gray-900">
              {order.user?.name || "Guest User"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {order.user?.email}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-700 mt-3">
              <Phone size={15} className="text-[#2E7D32]" />
              {order.shippingAddress?.phone}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-[#2E7D32]" />
              <h2 className="font-semibold text-gray-800">Shipping Address</h2>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shippingAddress?.address}
              <br />
              {order.shippingAddress?.city},
              {order.shippingAddress?.district}
              <br />
              {order.shippingAddress?.postalCode}
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span>₹{order.itemsPrice || order.totalPrice}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">
                  -₹{order.discount || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>₹{order.deliveryPrice || 0}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#2E7D32]">₹{order.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Timeline</h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <Clock size={15} className="text-[#2E7D32] mt-0.5" />
                <div>
                  <p className="font-medium">Placed</p>
                  <p className="text-gray-500">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {order.isDelivered && order.deliveredAt && (
                <div className="flex items-start gap-2">
                  <CheckCircle
                    size={15}
                    className="text-green-600 mt-0.5"
                  />
                  <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-gray-500">
                      {new Date(order.deliveredAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default AdminOrderDetails;
