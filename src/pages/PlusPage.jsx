import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Flame, Lock, ChevronLeft } from "lucide-react";
const API = import.meta.env.VITE_API_URL;

const LoyaltyPage = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [isPlus, setIsPlus] = useState(false);
  const [expiryDate, setExpiry] = useState(null);
  const [processing, setProcessing] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const config = {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
    withCredentials: true,
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo?.token) {
      navigate("/login");
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/profile`, config);

      setPoints(data.loyaltyPoints || 0);
      setIsPlus(data.isPlusMember || false);
      setExpiry(data.plusExpiryDate);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivatePlus = async () => {
    try {
      setProcessing(true);
      await axios.put(`${API}/api/users/upgrade-plus`, {}, config);
      fetchUserData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const requiredPoints = 20;

  const eligibleForPlus = points >= requiredPoints && !isPlus;

  const progress = Math.min(points, requiredPoints) / requiredPoints;
  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-4 hover:bg-gray-100 rounded-xl text-gray-500 transition"
          >
            <ChevronLeft size={30} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#2E7D32]">
              Loyalty Rewards
            </h1>
            <p className="text-sm text-gray-500">
              Earn points and unlock FreshCart Plus
            </p>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Available Points</p>

              <h2 className="text-4xl font-bold text-[#2E7D32] mt-1">
                {points}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Crown className="text-[#2E7D32]" size={28} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-gray-600">Membership</span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isPlus
                  ? "bg-[#EFF3F1] text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isPlus ? "Plus Member" : "Standard"}
            </span>
          </div>

          {isPlus && expiryDate && (
            <p className="mt-3 text-sm text-gray-500">
              Valid until{" "}
              <span className="font-semibold">
                {new Date(expiryDate).toLocaleDateString("en-IN")}
              </span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {isPlus ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EFF3F1] flex items-center justify-center">
                <Crown className="text-yellow-600" size={30} />
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                FreshCart Plus Active
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                You are enjoying all Plus member benefits.
              </p>
            </div>
          ) : eligibleForPlus ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                FreshCart Plus Unlocked 🎉
              </h3>

              <p className="text-sm text-gray-500 mb-5">
                Congratulations! You have collected 20 Loyalty Points. FreshCart
                Plus is now unlocked.
              </p>

              <button
                onClick={handleActivatePlus}
                disabled={processing}
                className="w-full bg-[#6FAF8E] text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-60"
              >
                {processing ? "Activating..." : "Activate Plus"}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Lock size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-800">Plus Locked</h3>
              </div>

              <p className="text-base text-gray-500 ml-6">
                Earn 20 more loyalty points to unlock FreshCart Plus
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Crown className="text-yellow-500" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">
              FreshCart Plus Benefits
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Extra Discount</span>
              <span className="font-semibold text-green-600">+5% OFF</span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Free Delivery</span>
              <span className="font-semibold text-green-600">Available</span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Priority Offers</span>
              <span className="font-semibold text-green-600">
                Exclusive Deals
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Membership Validity</span>
              <span className="font-semibold text-gray-800">30 Days</span>
            </div>
          </div>
        </div>

        {/* How to Earn Plus */}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 text-[#6FAF8E] font-bold flex items-center justify-center">
              1
            </div>

            <p className="text-gray-600">
              Earn loyalty points from every successful order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 text-[#6FAF8E] font-bold flex items-center justify-center">
              2
            </div>

            <p className="text-gray-600">
              Reach <strong>20 Loyalty Points</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 text-[#6FAF8E] font-bold flex items-center justify-center">
              3
            </div>

            <p className="text-gray-600">Activate FreshCart Plus.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 text-[#6FAF8E] font-bold flex items-center justify-center">
              4
            </div>

            <p className="text-gray-600">
              Enjoy Plus benefits for <strong>30 Days</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPage;
