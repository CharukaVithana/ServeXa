import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { authValidation, validateForm } from "../../utils/validation";
import type { SignupData } from "../../types/auth";
import authService from "../../services/authService";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";

interface SignupFormData extends SignupData {
  phoneNumber: string | number | readonly string[] | undefined;
  role: string | number | readonly string[] | undefined;
  confirmPassword: string;
}

const Signup = () => {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors,
  } = useForm<SignupFormData>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: undefined,
      role: undefined,
    },
    validate: (values) => {
      const baseErrors = validateForm(values, authValidation.signup);
      const formErrors = { ...baseErrors } as any;

      // Additional validation for confirm password
      if (!values.confirmPassword) {
        formErrors.confirmPassword = "Please confirm your password";
      } else if (values.password !== values.confirmPassword) {
        formErrors.confirmPassword = "Passwords do not match";
      }

      return formErrors;
    },
    onSubmit: async (values) => {
      try {
        setServerError(null);
        const { confirmPassword, ...signupData } = values;
        await signup(signupData);
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Signup failed"
        );
      }
    },
  });

  const handleSocialSignup = async (provider: "google" | "facebook") => {
    try {
      if (provider === "google") {
        await authService.loginWithGoogle();
      } else {
        await authService.loginWithFacebook();
      }
    } catch (error) {
      setServerError(`Failed to sign up with ${provider}`);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        <h1 className="text-4xl font-bold mb-6">Welcome to ServeXa</h1>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Create Account
          </h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <div>
              <input
                type="text"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                autoComplete="name"
                className={`border-b ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } focus:outline-none p-2 w-full`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Email Address"
                autoComplete="email"
                required
                className={`border-b ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none p-2 w-full`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                name="role"
                id="role"
                value={values.role}
                onChange={(e) =>
                  handleChange(
                    e as unknown as React.ChangeEvent<HTMLInputElement>
                  )
                }
                className={`border-b ${
                  errors.role ? "border-red-500" : "border-gray-300"
                } focus:outline-none p-2 w-full bg-white ${
                  values.role ? "text-gray-900" : "text-gray-400"
                }`}
              >
                <option value="">Select a role</option>
                <option value="CUSTOMER">Customer</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="sr-only">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={values.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                autoComplete="tel"
                className={`border-b ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                } focus:outline-none p-2 w-full`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={`border-b ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none p-2 w-full pr-10`}
                />

                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <PasswordStrengthIndicator password={values.password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={`border-b ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none p-2 w-full pr-10`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
              {!errors.confirmPassword &&
                values.confirmPassword &&
                values.password === values.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ Passwords match
                  </p>
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
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-[#D72638] hover:underline">
              Log in
            </Link>
          </p>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleSocialSignup("google")}
              className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100"
            >
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
            <button
              onClick={() => handleSocialSignup("facebook")}
              className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100"
            >
              <img src="/facebook.png" alt="Facebook" className="w-5 h-5" />
              Sign up with Facebook
            </button>
          </div>
        </div>
      </div>

      <div className="w-1/3 h-screen relative">
        <img
          src="/car2.jpg"
          alt="Car 2"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
    </div>
  );
};

export default Signup;
