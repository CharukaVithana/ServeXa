import React from "react";

const Signup = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-[#282828] flex flex-col justify-center items-center gap-4">
  <img src="/car1.jpg" alt="Car 1" className="w-80" />
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        <h1 className="text-4xl font-bold mb-6">Create your account</h1>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
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
            <input
              type="password"
              placeholder="Password"
              className="border-b border-gray-300 focus:outline-none p-2"
            />

            <button
              type="submit"
              className="bg-[#D72638] text-white py-2 rounded-lg font-semibold mt-4 hover:bg-red-700"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-[#D72638] hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
