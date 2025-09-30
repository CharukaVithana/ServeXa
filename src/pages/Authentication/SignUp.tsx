import React from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left side signup form */}
      <div className="w-2/3 flex flex-col justify-center items-center p-12 bg-white relative">
        <h1 className="text-4xl font-bold mb-6">Welcome to ServeXa</h1>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border-b border-gray-300 focus:outline-none p-2"
            />
            <input
              type="email"
              placeholder="Email Address"
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

            <button
              type="submit"
              className="bg-[#D72638] text-white py-2 rounded-lg font-semibold mt-4 hover:bg-red-700"
            >
              Create Account
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/" className="text-[#D72638] hover:underline">
              Log in
            </Link>
          </p>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4 justify-center">
            <button className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100">
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
            <button className="border border-gray-300 py-2 px-4 rounded flex items-center gap-2 hover:bg-gray-100">
              <img src="/facebook.png" alt="Facebook" className="w-5 h-5" />
              Sign up with Facebook
            </button>
          </div>
        </div>
      </div>

      {/* Right side - car image */}
      <div className="w-1/3 h-screen relative">
        <img src="/car2.jpg" alt="Car 2" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
    </div>
  );
};

export default Signup;
