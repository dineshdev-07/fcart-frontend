import axios from "axios";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const MyOrders = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCancel, setLoadingCancel] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/orders/myorders`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (error.response?.status === 401) {
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (orders.length > 0)
        sessionStorage.setItem("userOrdersScrollPos", window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [orders]);

  useLayoutEffect(() => {
    if (orders.length > 0) {
      const savedPosition = sessionStorage.getItem("userOrdersScrollPos");
      if (savedPosition)
        setTimeout(() => window.scrollTo(0, parseInt(savedPosition)), 50);
    }
  }, [orders]);

  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      setLoadingCancel((prev) => ({ ...prev, [orderId]: true }));
      await axios.put(
        `${API}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );
      alert("Order cancelled ❌");
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    } finally {
      setLoadingCancel((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#6FAF8E] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 rounded-2xl bg-[#EFF3F1] border border-blue-200">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex gap-5">
        <div className="h-12 w-12 rounded-xl bg-[#2F7D32] flex items-center justify-center">
          <Package className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2E7D32]">MyOrders</h1>
          <p className="text-gray-500 mt-2">
            View and track all your FreshCart orders.
          </p>
        </div>
        <div></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse bg-white rounded-2xl border border-[#DDEFD8] p-5 h-40"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#DDEFD8] p-16 text-center">
            <div className="text-6xl mb-4">📦</div>

            <h2 className="text-2xl font-bold text-gray-800">No Orders Yet</h2>

            <p className="text-gray-500 mt-2">
              Looks like you haven't placed any orders.
            </p>

            <Link
              to="/"
              className="inline-block mt-6 bg-[#2F7D32] hover:bg-[#27682A] text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-[#EEF5EB] p-5 hover:shadow-md transition"
              >
                {/* Top */}

                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">
                        Order ID
                      </p>

                      <Link
                        to={`/order/${order._id}`}
                        className="font-semibold text-[#2F7D32] hover:underline"
                      >
                        #{order._id.slice(-8)}
                      </Link>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">
                        Products
                      </p>

                      <p className="text-gray-700">
                        {order.orderItems
                          ?.slice(0, 2)
                          .map((item) => item.name)
                          .join(", ")}

                        {order.orderItems?.length > 2 &&
                          ` +${order.orderItems.length - 2} more`}
                      </p>
                    </div>
                  </div>

                  {/* Right */}

                  <div className="space-y-3 text-left lg:text-right">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Date</p>

                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">Total</p>

                      <p className="text-2xl font-bold text-[#2F7D32]">
                        ₹{order.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom */}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/order/${order._id}`}
                    className="px-5 py-2 rounded-lg bg-[#EEF8EE] text-[#2F7D32] font-medium border border-blue-200"
                  >
                    View Details
                  </Link>

                  {!order.isDelivered && !order.isCancelled && (
                    <button
                      disabled={loadingCancel[order._id]}
                      onClick={() => cancelOrderHandler(order._id)}
                      className="px-5 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {loadingCancel[order._id] ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>

                {order.isCancelled && order.isPaid && (
                  <div className="mt-6 border-t border-[#E8E8E8] pt-5">
                    {order.refundStatus === "Pending" && (
                      <div className="bg-yellow-50 text-yellow-700 rounded-xl px-4 py-3">
                        ⏳ Refund request sent. Waiting for admin approval.
                      </div>
                    )}

                    {order.refundStatus === "Approved" && (
                      <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3">
                        ✅ Refund approved. Amount will be credited within 3–5
                        business days.
                      </div>
                    )}

                    {order.refundStatus === "Rejected" && (
                      <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3">
                        ❌ Refund request rejected.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
