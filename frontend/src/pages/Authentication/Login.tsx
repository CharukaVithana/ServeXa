import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { authValidation, validateForm } from "../../utils/validation";
import type { LoginCredentials } from "../../types/auth";

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<LoginCredentials>({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: (values) => validateForm(values, authValidation.login),
    onSubmit: async (values) => {
      try {
        setServerError(null);
        await login(values);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : "Login failed");
      }
    },

  });

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      // TODO: Implement social login
      setServerError(`Social login with ${provider} is not yet implemented`);
    } catch (error) {
      setServerError(`Failed to login with ${provider}`);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block lg:w-1/3 lg:h-screen relative">
        <img src="/car1.jpg" alt="Car 1" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      <div className="w-full lg:w-2/3 flex flex-col justify-center items-center p-6 sm:p-8 md:p-12 bg-white">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center">Welcome to ServeXa</h1>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">Login</h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                id="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Email Address"
                autoComplete="email"
                className={`border-b ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none p-2 w-full`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="current-password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={`border-b ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none p-2 w-full`}
                />
                <span
                  className="absolute right-2 top-2 cursor-pointer text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={values.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <Link to="/reset-password" className="text-[#D72638] hover:underline">
                Forgot password
              </Link>
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
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#D72638] hover:underline">
              Sign up
            </Link>
          </p>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100"
            >
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('facebook')}
              className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100"
            >
              <img src="/facebook.png" alt="Facebook" className="w-5 h-5" />
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;