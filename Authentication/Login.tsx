import React from "react";

const Login = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - reduced width */}
      <div className="w-1/3 h-screen relative">
        <img src="/car1.jpg" alt="Car 1" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Right side login form with car image UI */}
      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        {/* Car image as UI element */}
        <h1 className="text-4xl font-bold mb-6">Welcome to ServeXa</h1>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email Address or User Name"
              className="border-b border-gray-300 focus:outline-none p-2"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="border-b border-gray-300 focus:outline-none p-2 w-full"
              />
              <span className="absolute right-2 top-2 cursor-pointer text-gray-400">👁️</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="text-[#D72638] hover:underline">
                Forgot password
              </a>
            </div>

            <button
              type="submit"
              className="bg-[#D72638] text-white py-2 rounded-lg font-semibold mt-4 hover:bg-red-700"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#D72638] hover:underline">
              Sign up
            </a>
          </p>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4 justify-center">
            <button className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100">
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100">
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
