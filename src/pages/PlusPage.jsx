import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Crown,
  Check,
  Percent,
  Truck,
  Tag,
  Gift,
  Lock,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export default function PlusPage({
  points = 0,
  isPlus = false,
  expiryDate = null,
  eligibleForPlus = false,
  processing = false,
  handleActivatePlus,
}) {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Percent,
      title: "Extra 5% savings",
      description: "Get additional discounts on eligible purchases.",
    },
    {
      icon: Truck,
      title: "Free delivery",
      description: "Enjoy free delivery on eligible orders.",
    },
    {
      icon: Tag,
      title: "Exclusive offers",
      description: "Discover special deals made for Plus members.",
    },
    {
      icon: Gift,
      title: "Member rewards",
      description: "Enjoy more value with your FreshCart shopping.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F7F5]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-9">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#2E7D32]">
                FreshCart Plus
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Your everyday shopping, made better.
              </p>
            </div>
          </div>

          {/* Main Membership Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-[#245D37] text-white px-6 py-9 sm:px-10 sm:py-12 mb-7">
            <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full border border-white/10" />
            <div className="absolute -right-5 -top-8 w-44 h-44 rounded-full border border-white/10" />

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 text-green-100 text-sm font-medium mb-5">
                <Crown size={18} className="text-yellow-300" />
                FRESHCART MEMBERSHIP
              </div>

              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
                More than shopping.
                <br />
                More value.
              </h2>

              <p className="text-green-100 text-sm sm:text-base mt-5 max-w-md leading-relaxed">
                Enjoy extra savings, free delivery and exclusive benefits with
                FreshCart Plus.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-7">
                <span className="rounded-full bg-white/15 px-4 py-2 text-sm text-white">
                  30-day membership
                </span>

                <span className="rounded-full bg-white/15 px-4 py-2 text-sm text-white">
                  Exclusive benefits
                </span>
              </div>
            </div>

            <div className="absolute right-8 bottom-8 hidden sm:flex w-24 h-24 rounded-full bg-white/10 items-center justify-center">
              <Crown size={46} className="text-yellow-300" strokeWidth={1.3} />
            </div>
          </section>

          {/* Membership Status */}
          <section className="bg-white rounded-2xl border border-[#E8ECE8] p-5 sm:p-7 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  YOUR MEMBERSHIP
                </p>

                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-2">
                  {isPlus ? "You're a Plus member." : "Make every order count."}
                </h2>

                <p className="text-sm text-gray-500 mt-2 max-w-lg leading-relaxed">
                  {isPlus
                    ? "Your FreshCart Plus membership is active. Enjoy your exclusive shopping benefits."
                    : eligibleForPlus
                      ? "You've unlocked FreshCart Plus. Activate your membership and enjoy exclusive benefits."
                      : "Complete an order above ₹500 and receive it successfully to unlock FreshCart Plus."}
                </p>
              </div>

              <div className="shrink-0">
                {isPlus ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF4EB] text-[#2E7D32] px-4 py-2 text-sm font-semibold">
                    <Check size={17} />
                    Active
                  </span>
                ) : eligibleForPlus ? (
                  <button
                    onClick={handleActivatePlus}
                    disabled={processing}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#2E7D32] text-white text-sm font-semibold hover:bg-[#1B5E20] transition disabled:opacity-60"
                  >
                    {processing ? "Activating..." : "Activate Plus"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-600 px-4 py-2 text-sm font-medium">
                    <Lock size={15} />
                    Locked
                  </span>
                )}
              </div>
            </div>

            {isPlus && expiryDate && (
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={17} />
                Valid until
                <span className="font-semibold text-gray-800">
                  {new Date(expiryDate).toLocaleDateString("en-IN")}
                </span>
              </div>
            )}

            {!isPlus && (
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#2E7D32]" />
                  {points} loyalty points earned
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#2E7D32]" />
                  30-day membership
                </span>
              </div>
            )}
          </section>

          {/* Benefits */}
          <section className="mb-9">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                THE PLUS EXPERIENCE
              </p>

              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mt-2">
                A little extra, every day.
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Thoughtful benefits to make your shopping better.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-[#E8ECE8] p-5 sm:p-6 hover:border-[#B9D3BD] transition"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#EAF4EB] flex items-center justify-center text-[#2E7D32] mb-5">
                      <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {benefit.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How to Unlock */}
          {!isPlus && !eligibleForPlus && (
            <section className="bg-[#EAF2EA] rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2E7D32]">
                  <Gift size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Unlock your Plus membership
                  </h2>
                  <p className="text-sm text-gray-500">
                    It's simple. Just shop and enjoy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <p className="text-sm text-gray-700 pt-1">
                  Place an order above ₹500.
                </p>
              </div>

              <div className="w-px h-5 bg-[#B9D3BD] ml-3.5 my-1" />

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <p className="text-sm text-gray-700 pt-1">
                  Receive your order successfully.
                </p>
              </div>

              <div className="w-px h-5 bg-[#B9D3BD] ml-3.5 my-1" />

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <p className="text-sm text-gray-700 pt-1">
                  Unlock FreshCart Plus and activate your membership.
                </p>
              </div>
            </section>
          )}

          {/* Footer Note */}
          <div className="text-center py-5">
            <p className="text-xs text-gray-400">
              FreshCart Plus · Better shopping, better value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
