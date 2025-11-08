import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { authValidation, validateForm } from "../../utils/validation";
import type { ResetPasswordData } from "../../types/auth";

const ResetPasswordNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extract token from URL query params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!token) {
      setServerError("Invalid or missing reset token");
    }
  }, [token]);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<ResetPasswordData>({
    initialValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => validateForm(values, authValidation.resetPassword),
    onSubmit: async (values) => {
      try {
        setServerError(null);
        setSuccessMessage(null);
        await resetPassword(values);
        setSuccessMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : "Failed to reset password");
      }
    },
  });

  return (
    <div className="flex min-h-screen">
      <div className="w-1/3 h-screen relative">
        <img
          src="/car3.jpg"
          alt="Car 3"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#D72638]">
            Reset Your Password
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Set new password for login
          </p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={values.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  className={`border-b ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none p-2 w-full pr-8`}
                />
                <span
                  className="absolute right-2 top-3 cursor-pointer text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className={`border-b ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none p-2 w-full pr-8`}
                />
                <span
                  className="absolute right-2 top-3 cursor-pointer text-gray-400"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className={`${
                isSubmitting || !token
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#D72638] hover:bg-red-700"
              } text-white py-2 rounded-lg font-semibold mt-4 transition-colors`}
            >
              {isSubmitting ? "Resetting..." : "Reset Now"}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/login")}
              className="text-[#D72638] hover:underline text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordNew;