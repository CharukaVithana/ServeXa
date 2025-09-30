import React from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ResetPasswordRequest = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call backend API to send reset link/OTP
    // For now, just go to Step 2 page
    navigate("/reset-password/new");
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
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Right side - Form */}
      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        <h1 className="text-4xl font-bold mb-10">Welcome to ServeXa</h1>

        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#D72638]">
            Reset Your Password
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Enter the Email address associated with your account
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                required
                className="border-b border-gray-300 focus:outline-none p-2 w-full"
              />
              <FaEnvelope className="absolute right-2 top-3 text-gray-400" />
            </div>

            <button
              type="submit"
              className="bg-[#D72638] text-white py-2 rounded-lg font-semibold mt-4 hover:bg-red-700"
            >
              Next
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/reset-options")}
              className="text-[#D72638] hover:underline text-sm"
            >
              Try another way
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
