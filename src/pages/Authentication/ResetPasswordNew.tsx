import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordNew = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend API to reset password here
    alert("Password reset successfully!");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Car images */}
      <div className="w-1/3 h-screen relative">
        <img
          src="/car3.jpg"
          alt="Car 3"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#D72638]">
            Reset Your Password
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Set new password for login
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                required
                className="border-b border-gray-300 focus:outline-none p-2 w-full"
              />
              <span
                className="absolute right-2 top-3 cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                required
                className="border-b border-gray-300 focus:outline-none p-2 w-full"
              />
              <span
                className="absolute right-2 top-3 cursor-pointer text-gray-400"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              className="bg-[#D72638] text-white py-2 rounded-lg font-semibold mt-4 hover:bg-red-700"
            >
              Reset Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordNew;
