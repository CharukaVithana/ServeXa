import React from "react";
import Navbar from "../../components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Background image */}
      <img src="/landing1.png" alt="Background" className="absolute inset-0 w-full h-full object-cover -z-10" />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 -z-10" />
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="flex items-center justify-start px-16 py-24 min-h-[60vh] mt-10">
        <div className="w-full md:w-1/3 max-w-xl">
          <h1 className="text-5xl font-bold mb-6 text-black drop-shadow-lg text-left leading-tight">Fast, Reliable Car Service at Your Fingertips</h1>
          <p className="text-xl text-black
           mb-10 drop-shadow-lg text-left">Book appointments, track your vehicle service, and receive real-time updates</p>
          <div className="flex gap-4">
            <a href="/login" className="bg-[#D72638] text-white px-6 py-2 rounded font-semibold hover:bg-red-700">Get Start</a>
            <button className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-900">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
