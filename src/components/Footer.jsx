
import React from "react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToCategories = () => {
    document
      .getElementById("category-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#EFF3F1] text-[#2E7D32] border-t border-[#D7E3D9]">

      {/* Centered Responsive Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 py-10 sm:py-12 md:py-14">

          {/* Brand */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              FreshCart
            </h2>

            <p className="max-w-xs text-sm leading-6 text-gray-600">
              Your destination for farm-fresh produce.
              Quality you can taste, freshness you can trust.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest">
              Explore
            </h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <button
                  onClick={scrollToTop}
                  className="transition-colors hover:text-[#2E7D32]"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  onClick={scrollToCategories}
                  className="transition-colors hover:text-[#2E7D32]"
                >
                  Shop Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest">
              Support
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <p className="break-words">
                <span className="font-semibold text-[#2E7D32]">
                  Email:
                </span>{" "}
                <a href="mailto:freshcart1234@gmail.com">
                  freshcart1234@gmail.com
                </a>
              </p>

              <p>
                <span className="font-semibold text-[#2E7D32]">
                  Call:
                </span>{" "}
                +91 78100 70xxx
              </p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#D7E3D9] py-5 text-center sm:text-left">

          <p className="text-xs text-gray-500">
            © 2026 FreshCart. All Rights Reserved.
          </p>

          <p className="text-xs text-gray-500">
            Freshness delivered to your doorstep.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
