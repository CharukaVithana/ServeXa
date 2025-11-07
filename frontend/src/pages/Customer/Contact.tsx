import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // clear error when user types again
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Check email validity before proceeding
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // ✅ If email valid, proceed
    setStatus("✅ Thank you! Your message has been sent successfully.");
    setError("");
    setFormData({ fullName: "", email: "", subject: "", message: "" });

    // Later: connect to backend POST /api/contact
  };

  return (
    <div className="flex bg-gray-50 text-slate-800 min-h-screen overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <div className="fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 ml-64 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          We’re here to help! Reach out to our ServeXa support team for inquiries, appointments, or feedback.
        </p>

        {/* ===== CONTACT INFO ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
            <Phone className="text-blue-600" size={26} />
            <div>
              <h3 className="font-semibold text-gray-800">Phone</h3>
              <p className="text-gray-600 text-sm">+94 77 123 4567</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
            <Mail className="text-red-500" size={26} />
            <div>
              <h3 className="font-semibold text-gray-800">Email</h3>
              <p className="text-gray-600 text-sm">support@servexa.com</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
            <MapPin className="text-green-600" size={26} />
            <div>
              <h3 className="font-semibold text-gray-800">Address</h3>
              <p className="text-gray-600 text-sm">
                No. 45, Galle Road, Colombo 03, Sri Lanka
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
            <Clock className="text-yellow-600" size={26} />
            <div>
              <h3 className="font-semibold text-gray-800">Service Hours</h3>
              <p className="text-gray-600 text-sm">Mon - Sat: 8:00 AM - 6:00 PM</p>
              <p className="text-gray-600 text-sm">Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* ===== CONTACT FORM ===== */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Send us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className={`border rounded-lg px-4 py-2 focus:ring-2 outline-none ${
                  error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
            </div>
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              rows={5}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
            <button
              type="submit"
              className="bg-[#D72638] hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Send Message
            </button>
          </form>

          {status && (
            <p className="text-green-600 font-medium mt-4">{status}</p>
          )}
        </div>

        {/* ===== MAP SECTION ===== */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Us</h2>
          <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <iframe
              title="ServeXa Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63322.08069203942!2d79.8356203!3d6.921836299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25951f20827cd%3A0x3bdbf5dbb2f26e57!2sColombo!5e0!3m2!1sen!2slk!4v1697800020000!5m2!1sen!2slk"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
