import React from "react";
import Navbar from "../../components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen w-full relative">
      <div className="relative h-screen w-full">
  <img
    src="/landing1.png"
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover -z-10"
  />
  <div className="absolute inset-0 bg-black bg-opacity-30 -z-10" />
  <Navbar />

  <div className="flex items-center justify-start px-8 md:px-16 h-full">
    <div className="w-full md:w-1/3 max-w-xl">
      <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg leading-tight">
        Fast, Reliable Car Service at Your Fingertips
      </h1>
      <p className="text-xl text-white mb-10 drop-shadow-lg">
        Book appointments, track your vehicle service, and receive real-time updates
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="bg-[#D72638] text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
        >
          Get Started
        </a>
        <button className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-900">
          Learn More
        </button>
      </div>
    </div>
  </div>
</div>


      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Customer Feature */}
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">Secure Login & Signup</h3>
              <p>Register or login securely to manage your vehicles and appointments.</p>
            </div>
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">Dashboard & Real-Time Updates</h3>
              <p>Track service progress in real-time with a mobile-friendly dashboard.</p>
            </div>
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">Book Service Appointments</h3>
              <p>Schedule your vehicle service conveniently through the platform.</p>
            </div>
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">Request Vehicle Modifications</h3>
              <p>Submit modification requests and monitor the project status online.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Progress Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">Track Your Service in Real-Time</h2>
          <div className="space-y-4">
            <div className="bg-gray-200 rounded-full h-6 w-full overflow-hidden">
              <div className="bg-[#D72638] h-6 w-1/3 transition-all duration-500"></div>
            </div>
            <p className="text-gray-700">Scheduled → In Progress → Completed</p>
          </div>
        </div>
      </section>

      {/* Chatbot Preview Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">AI Chatbot for Service Slots</h2>
          <p className="mb-8 text-gray-700">
            Ask our AI assistant about available service slots instantly.
          </p>
          <div className="bg-white p-6 rounded shadow inline-block w-full md:w-2/3">
            <p className="text-gray-500 italic">Chatbot preview (interactive version in actual app)</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-xl mb-2">5000+ Services Completed</h3>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">1200+ Satisfied Customers</h3>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">20+ Certified Technicians</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#D72638] text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Book Your Service?</h2>
        <a href="/login" className="bg-white text-[#D72638] px-8 py-3 rounded font-semibold hover:bg-gray-100">
          Get Started
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2025 AutoService Co. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">Services</a>
            <a href="#" className="hover:text-gray-300">About</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
