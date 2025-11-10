import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { User, Lock, ShieldCheck, Globe, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Setting: React.FC = () => {
  const { user } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [preferences, setPreferences] = useState({
    twoFactorAuth: false,
    twoFactorType: "Email",
    language: "English (US)",
    emailNotifications: true,
    smsNotifications: false,
  });

  // === Validation Helpers ===
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone: string) =>
    /^(\+94|0)?[0-9]{9,10}$/.test(phone);

  // === Password Strength ===
  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return "Weak";
    if (score === 2) return "Medium";
    return "Strong";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (name === "newPassword") {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("❌ New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters long.");
      return;
    }

    toast.success("Password changed successfully!");
    setMessage("✅ Password updated successfully.");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

    // Clear message after 5 seconds
    setTimeout(() => setMessage(""), 5000);
  };

  const handlePreferenceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type, checked, value } = target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePreferences = async () => {
    try {
      toast.success("Preferences saved successfully!");

      if (preferences.twoFactorAuth) {
        toast.success(
          `Two-Factor Authentication enabled via ${preferences.twoFactorType}`
        );
      } else {
        toast("Two-Factor Authentication disabled.");
      }

      document.documentElement.lang =
        preferences.language === "සිංහල"
          ? "si"
          : preferences.language === "தமிழ்"
          ? "ta"
          : "en";
    } catch (err) {
      toast.error("Failed to save preferences. Try again.");
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDelete(false);
    toast.success("Your account has been deleted successfully.");
  };

  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600 mb-8">
            Manage your ServeXa account, security, and preferences.
          </p>

          {/* === Account Overview === */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-blue-600" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Account Overview
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <p>
                <strong>Full Name:</strong> {user?.fullName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "N/A"}{" "}
                {!validateEmail(user?.email || "") && (
                  <span className="text-red-500 text-sm ml-2">(Invalid)</span>
                )}
              </p>
              <p>
                <strong>Phone:</strong> {user?.phoneNumber || "N/A"}{" "}
                {!validatePhone(user?.phoneNumber || "") && (
                  <span className="text-red-500 text-sm ml-2">(Invalid)</span>
                )}
              </p>
              <p>
                <strong>Address:</strong> {user?.address || "Not provided"}
              </p>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              To update personal details, visit your <strong>Profile</strong> page.
            </p>
          </div>

          {/* === Change Password === */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-red-500" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["currentPassword", "newPassword", "confirmPassword"].map(
                  (field, index) => (
                    <div key={index}>
                      <label className="text-sm font-medium text-gray-700">
                        {field === "currentPassword"
                          ? "Current Password"
                          : field === "newPassword"
                          ? "New Password"
                          : "Confirm Password"}
                      </label>
                      <input
                        type="password"
                        name={field}
                        value={(passwordData as any)[field]}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-500 outline-none"
                        required
                      />
                      {field === "newPassword" && passwordData.newPassword && (
                        <p
                          className={`text-sm mt-1 ${
                            passwordStrength === "Weak"
                              ? "text-red-500"
                              : passwordStrength === "Medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          Strength: {passwordStrength}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* ✅ Show validation message */}
              {message && (
                <p
                  className={`text-sm font-medium mt-2 ${
                    message.startsWith("❌")
                      ? "text-red-500"
                      : message.startsWith("⚠️")
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="text-right mt-6">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* === Preferences === */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-indigo-500" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">
                App Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={preferences.twoFactorAuth}
                  onChange={handlePreferenceChange}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>Enable Two-Factor Authentication</span>
              </label>

              {preferences.twoFactorAuth && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Two-Factor Method
                  </label>
                  <select
                    name="twoFactorType"
                    value={preferences.twoFactorType}
                    onChange={handlePreferenceChange}
                    className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Email">Email Verification</option>
                    <option value="SMS">SMS Verification</option>
                    <option value="Authenticator">Authenticator App</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  name="language"
                  value={preferences.language}
                  onChange={handlePreferenceChange}
                  className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>සිංහල</option>
                  <option>தமிழ்</option>
                </select>
              </div>
            </div>

            <div className="text-right mt-6">
              <button
                onClick={handleSavePreferences}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* === Delete Account === */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="text-gray-600" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Delete Account
              </h2>
            </div>

            <p className="text-gray-600 mb-4">
              Deleting your account is permanent and cannot be undone.
            </p>

            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition"
            >
              Delete Account
            </button>

            {confirmDelete && (
              <div className="mt-5 p-4 border border-red-300 bg-red-50 rounded-lg">
                <p className="text-red-700 mb-3">
                  Are you sure you want to delete your account? This action is permanent.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* === Security Tip === */}
          <div className="flex items-center bg-blue-50 border border-blue-200 rounded-xl p-5">
            <ShieldCheck className="text-blue-600 mr-3" />
            <p className="text-gray-700 text-sm">
              Tip: Keep your account secure. Update your password regularly and enable two-factor authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
