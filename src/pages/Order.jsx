import axios from "axios";
import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Globe } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const userInfo = JSON.parse(localStorage.getItem("userInfo"));

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const { data } = await axios.get(`${API}/api/orders/admin`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setOrders(data.orders ? data.orders : data);
    } catch {
      console.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleScroll = () => {
      if (!loading && orders.length > 0)
        sessionStorage.setItem("adminOrdersScrollPos", window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, orders]);

  useLayoutEffect(() => {
    if (!loading && orders.length > 0) {
      const saved = sessionStorage.getItem("adminOrdersScrollPos");
      if (saved) setTimeout(() => window.scrollTo(0, parseInt(saved)), 50);
    }
  }, [loading, orders]);

  const deliverHandler = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    try {
      await axios.put(
        `${API}/api/orders/${id}/deliver`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      fetchOrders();
    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.message || "Delivery update failed");
    }
  };

  const refundHandler = async (id) => {
    if (!window.confirm("Confirm refund has been processed?")) return;
    try {
      await axios.put(
        `${API}/api/orders/${id}/refund`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );
      alert("Order marked as Refunded");
      fetchOrders();
    } catch (err) {
      console.log(err.response);

      alert(err.response?.data?.message || "Refund update failed");
    }
  };

  const resetDatabaseHandler = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (
      !window.confirm(
        "CRITICAL: This will archive all orders for Admin view. User history is preserved. Continue?",
      )
    )
      return;
    try {
      await axios.delete(`${API}/api/orders/reset`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setOrders([]);
      alert("Dashboard Reset");
    } catch (err) {
      alert("Reset failed: " + (err.response?.data?.message || "Error"));
    }
  };

  const searchFiltered = orders.filter((order) => {
    const s = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(s) ||
      (order.user?.name?.toLowerCase() || "guest").includes(s)
    );
  });

  const districtCounts = searchFiltered.reduce((acc, o) => {
    if (o.isDelivered || o.isCancelled) return acc;
    const d = o.shippingAddress?.district || "Unknown";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const districtList = ["ALL", ...Object.keys(districtCounts).sort()];

  const filteredOrders = searchFiltered.filter((order) => {
    if (selectedDistrict === "ALL") return true;
    const d = order.shippingAddress?.district || "Unknown";
    return d === selectedDistrict;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#6FAF8E] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#2E7D32]">
                Order Details
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage all customer orders
              </p>
            </div>

            {/* Search + Button */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search Order / Customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 h-11 px-4 border border-gray-300 rounded-lg outline-none focus:border-[#6FAF8E]"
              />

              <button
                onClick={resetDatabaseHandler}
                className="w-full sm:w-auto h-11 px-5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Reset Orders
              </button>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mb-5 text-gray-600 font-medium">
          Showing {filteredOrders.length} of {orders.length} Orders
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const offerName =
                  order.couponCode ||
                  order.promoCode ||
                  order.offerName ||
                  (order.discountPrice > 0 ? "Discount Applied" : null);

                let payment = "Unpaid";
                let paymentColor = "bg-[#EFF3F1] text-yellow-700";

                if (order.isPaid) {
                  payment = "Paid";
                  paymentColor = "bg-green-100 text-green-700";
                }

                if (order.isRefunded) {
                  payment = "Refunded";
                  paymentColor = "bg-purple-100 text-purple-700";
                }

                let status = "Processing";
                let statusColor = "bg-orange-100 text-orange-700";

                if (order.isDelivered) {
                  status = "Delivered";
                  statusColor = "bg-green-100 text-green-700";
                }

                if (order.isCancelled) {
                  status = "Cancelled";
                  statusColor = "bg-red-100 text-red-700";
                }
                return (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="bg-white border rounded-xl p-5 cursor-pointer hover:border-green-500 transition"
                  >
                    {/* Top */}

                    <div className="flex justify-between items-center">
                      <div>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-lg font-bold text-[#2E7D32]"
                        >
                          #{order._id.substring(14)}
                        </Link>

                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Body */}

                    <div className="grid md:grid-cols-2 gap-5 mt-5">
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Customer :</span>{" "}
                          {order.user?.name || "Guest"}
                        </p>

                        <p>
                          <span className="font-semibold">District :</span>{" "}
                          {order.shippingAddress?.district || "-"}
                        </p>

                        {offerName && (
                          <p className="text-green-700 text-sm">
                            Offer : {offerName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:text-right">
                        <p className="text-2xl font-bold">
                          ₹{order.totalPrice}
                        </p>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${paymentColor}`}
                        >
                          {payment}
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}

                    <div
                      className="flex gap-3 mt-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!order.isDelivered && !order.isCancelled && (
                        <button
                          onClick={() => deliverHandler(order._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Deliver
                        </button>
                      )}

                      {order.isCancelled &&
                        order.isPaid &&
                        !order.isRefunded && (
                          <button
                            onClick={() => refundHandler(order._id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Refund
                          </button>
                        )}

                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center mt-20">
                <h2 className="text-xl font-semibold">
                  No Orders Found
                </h2>

              
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
