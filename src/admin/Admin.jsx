import axios from "axios";
import { useState } from "react";
import {
  Package,
  Tag,
  Layers,
  AlignLeft,
  Weight,
  Hash,
  DollarSign,
  Calendar,
  BarChart2,
  ImagePlus,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "",
  description: "",
  weight: "",
  unit: "",
  price: "",
  discountedPrice: "",
  manufacturingDate: "",
  expiryDate: "",
  quantity: "",
  images: [],
};

const API = import.meta.env.VITE_API_URL;

const FIELDS = [
  {
    key: "name",
    label: "Product Name",
    icon: Package,
    type: "text",
    required: true,
  },
  { key: "brand", label: "Brand", icon: Tag, type: "text", required: false },
  {
    key: "category",
    label: "Category",
    icon: Layers,
    type: "text",
    required: true,
  },
  {
    key: "weight",
    label: "Weight (e.g. 500g, 1L)",
    icon: Weight,
    type: "text",
    required: false,
  },
  {
    key: "unit",
    label: "Unit (kg / litre / pack)",
    icon: Hash,
    type: "text",
    required: false,
  },
  {
    key: "price",
    label: "MRP Price (₹)",
    icon: DollarSign,
    type: "number",
    required: true,
  },
  {
    key: "discountedPrice",
    label: "Discounted Price (₹)",
    icon: DollarSign,
    type: "number",
    required: false,
  },
  {
    key: "manufacturingDate",
    label: "Manufacturing Date",
    icon: Calendar,
    type: "date",
    required: false,
  },
  {
    key: "expiryDate",
    label: "Expiry Date",
    icon: Calendar,
    type: "date",
    required: false,
  },
  {
    key: "quantity",
    label: "Stock Quantity",
    icon: BarChart2,
    type: "number",
    required: true,
  },
];

function Admin() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") fd.append(key, value);
      });

      if (selectedFile) fd.append("image", selectedFile);

      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      const authConfig = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      await axios.post(`${API}/api/products`, fd, {
        ...authConfig,
        headers: {
          ...authConfig.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Product added successfully");
      setFormData(EMPTY_FORM);
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      alert(error?.response?.data?.message || "❌ Not authorized");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-[#EFF3F1] p-5 rounded-2xl border border-blue-200">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8  gap-2">
        <h1 className="text-2xl font-bold text-[#2E7D32]">Add Product</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new product for your store.
        </p>
      </div>
      <div className="max-w-6xl mx-auto">
        <form onSubmit={submitHandler}>
          <div className="grid lg:grid-cols-3 gap-4">
            {/* LEFT */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Product Information
                </h2>

                <div className="grid md:grid-cols-2 gap-3">
                  {FIELDS.map(({ key, label, icon: Icon, type, required }) => (
                    <div
                      key={key}
                      className={key === "name" ? "md:col-span-2" : ""}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>

                      <div className="relative">
                        <Icon
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type={type}
                          required={required}
                          value={formData[key]}
                          onChange={(e) => set(key, e.target.value)}
                          placeholder={`Enter ${label}`}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}

                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    rows={6}
                    required
                    value={formData.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Write product description..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-green-500 h-24"
                  />
                </div>
              </div>
            </div>
            {/* RIGHT SIDE */}
            <div className="space-y-6">
              {/* Upload Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                  Product Image
                </h2>

                <label
                  className={`w-full h-72 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition
                ${
                  preview
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-500 hover:bg-gray-50"
                }`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-center">
                      <ImagePlus
                        size={48}
                        className="mx-auto text-gray-400 mb-3"
                      />

                      <p className="font-semibold text-gray-700">
                        Upload Product Image
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        PNG, JPG or WEBP
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>

                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setSelectedFile(null);
                    }}
                    className="mt-4 w-full py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {/* Pricing Summary */}

              {(formData.price || formData.discountedPrice) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-5">
                    Pricing Summary
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">MRP</span>

                      <span className="font-semibold">
                        ₹{formData.price || 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Sale Price</span>

                      <span className="text-green-600 font-semibold">
                        ₹{formData.discountedPrice || 0}
                      </span>
                    </div>

                    {formData.price && formData.discountedPrice && (
                      <div className="flex justify-between pt-3 border-t">
                        <span className="font-semibold">Discount</span>

                        <span className="text-green-600 font-bold">
                          {Math.round(
                            ((formData.price - formData.discountedPrice) /
                              formData.price) *
                              100,
                          )}
                          % OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding Product...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Product
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;
