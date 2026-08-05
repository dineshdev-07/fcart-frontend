import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faIndianRupeeSign,
  faRotateLeft,
  faArrowsRotate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const fetchDashboard = useCallback(async () => {
    if (!userInfo?.isAdmin) {
      setError("Admin access required");
      return;
    }
    setLoading(true);

    try {
      const res = await axios.get(`${API}/api/orders/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setData(res.data);
      setError("");
    } catch (err) {
      console.error("FRONTEND ERROR:", err);

      if (err.response?.status === 401) {
        setError("Admin login required");
      } else {
        setError("Failed to fetch dashboard data ❌");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userInfo?.isAdmin) {
      setLoading(false);
      return;
    }

    fetchDashboard();
  }, [fetchDashboard]);

  const normalizedData = {
    totalRevenue: data?.totalRevenue ?? 0,
    totalRefunded: data?.totalRefunded ?? 0,
    paidOrders: data?.paidOrders ?? 0,
    usersCount: data?.usersCount ?? 0,
    cancelledOrders: data?.cancelledOrders ?? 0,
    totalOrders: data?.totalOrders ?? 0,
    codOrders: data?.codOrders ?? 0,
    productsCount: data?.productsCount ?? 0,
    lowStockProducts: data?.lowStockProducts || [],
    pendingRefunds: data?.pendingRefunds ?? 0,
    expiryTimeline: data?.expiryTimeline || [],
  };

  const handleResetMonthly = async () => {
    if (!window.confirm("Reset all monthly stats?")) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      };

      await axios.put(
        `${API}/api/orders/reset-monthly-data`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        },
      );

      alert("Monthly stats reset successfully ✅");
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Reset failed ❌");
    }
  };

  if (error)
    return (
      <div className="flex h-screen  items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <h2 className="text-xl text-red-500 font-semibold">{error}</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-[#2E7D32]">Admin Dashboard</h1>

          <p className="text-gray-500 mt-2">
            Welcome back! Here's today's business summary.
          </p>
        </div>

        {/* Main Statistics */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Revenue"
            value={`₹${normalizedData.totalRevenue}`}
            icon={<FontAwesomeIcon icon={faIndianRupeeSign} />}
          />

          <StatCard
            title="Orders"
            value={normalizedData.totalOrders}
            icon={<FontAwesomeIcon icon={faBoxOpen} />}
          />

          <StatCard
            title="Customers"
            value={normalizedData.usersCount}
            icon={<FontAwesomeIcon icon={faUsers} />}
          />

          <StatCard
            title="Products"
            value={normalizedData.productsCount}
            icon={<FontAwesomeIcon icon={faBoxOpen} />}
          />
        </div>

        {/* Business Summary */}

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Business Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniCard title="Paid Orders" value={normalizedData.paidOrders} />

            <MiniCard
              title="Cancelled"
              value={normalizedData.cancelledOrders}
            />
            <MiniCard
              title="Pending Refunds"
              value={normalizedData.pendingRefunds}
            />
            <MiniCard
              title="Refunded"
              value={`₹${normalizedData.totalRefunded}`}
            />

            <MiniCard title="COD Orders" value={normalizedData.codOrders} />
          </div>
        </div>

        {/* Low Stock */}

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex justify-between items-center p-5 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Low Stock Products
              </h2>
            </div>

            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              {normalizedData.lowStockProducts.length} Items
            </span>
          </div>

          {normalizedData.lowStockProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Inventory looks good 🎉
            </div>
          ) : (
            <div className="divide-y">
              {normalizedData.lowStockProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center p-5 hover:bg-green-50 transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-700">{item.name}</h3>

                    <p className="text-sm text-gray-500">
                      Product needs restocking
                    </p>
                  </div>

                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-semibold">
                    {item.quantity} Left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Expiry Timeline */}

        {/* Expiry Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 mt-8">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-700">
              Expiry Timeline
            </h2>
            <p className="text-sm text-gray-500">
              Products ordered by expiry date
            </p>
          </div>

          {normalizedData.expiryTimeline.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No expiry products found
            </div>
          ) : (
            <div className="divide-y">
              {normalizedData.expiryTimeline.map((product) => {
                const daysLeft = product.daysLeft;

                return (
                  <div
                    key={product._id}
                    className="flex justify-between items-center p-5"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Expiry:{" "}
                        {new Date(product.expiryDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">
                      {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button
          onClick={handleResetMonthly}
          className="flex-1 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-lg font-medium transition mt-5 p-5"
        >
          <FontAwesomeIcon />
          Reset Monthly Data
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#2E7D32] transition">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{title}</p>

        <div className="text-[#2E7D32] text-xl">{icon}</div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
    </div>
  );
};

const MiniCard = ({ title, value }) => {
  return (
    <div className="bg-[#F8F8F8] border border-gray-200 rounded-xl p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>

      <h3 className="text-2xl font-bold text-[#2E7D32] mt-2">{value}</h3>
    </div>
  );
};

export default AdminDashboard;
