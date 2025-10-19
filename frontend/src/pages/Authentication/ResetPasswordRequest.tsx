import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { authValidation, validateForm } from "../../utils/validation";

interface ResetPasswordRequestData {
  email: string;
}

const ResetPasswordRequest = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<ResetPasswordRequestData>({
    initialValues: {
      email: "",
    },
    validate: (values) => validateForm(values, authValidation.resetPasswordRequest),
    onSubmit: async (values) => {
      try {
        setServerError(null);
        setSuccessMessage(null);
        await requestPasswordReset(values.email);
        setSuccessMessage("Password reset link has been sent to your email");
      } catch (error) {
        setServerError(error instanceof Error ? error.message : "Failed to send reset email");
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
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        <h1 className="text-4xl font-bold mb-10">Welcome to ServeXa</h1>

        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#D72638]">
            Reset Your Password
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Enter the Email address associated with your account
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
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`border-b ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none p-2 w-full pr-8`}
                />
                <FaEnvelope className="absolute right-2 top-3 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#D72638] hover:bg-red-700"
              } text-white py-2 rounded-lg font-semibold mt-4 transition-colors`}
            >
              {isSubmitting ? "Sending..." : "Next"}
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

export default ResetPasswordRequest;