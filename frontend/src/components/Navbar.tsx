import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Smooth scroll helper with offset for fixed navbar
  const scrollToId = (id: string, offset = 80) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-[#282828] text-white fixed w-full z-50">
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="ServeXa Logo"
          className="h-10 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => scrollToId("hero", 80)}
          className="cursor-pointer hover:text-[#D72638] focus:outline-none"
        >
          Home
        </button>

        <button
          onClick={() => scrollToId("service", 80)}
          className="cursor-pointer hover:text-[#D72638] focus:outline-none"
        >
          Service
        </button>

        <button
          onClick={() => scrollToId("about", 80)}
          className="cursor-pointer hover:text-[#D72638] focus:outline-none"
        >
          About
        </button>

        <button
          onClick={() => scrollToId("contact", 80)}
          className="cursor-pointer hover:text-[#D72638] focus:outline-none"
        >
          Contact
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <span className="mr-4">Welcome, <RouterLink to="/profile" className="font-semibold hover:underline">{user?.fullName}</RouterLink></span>
            <RouterLink
              to="/dashboard"
              className="px-4 py-2 rounded bg-[#D72638] text-white font-semibold hover:bg-red-700"
            >
              Dashboard
            </RouterLink>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded border border-[#D72638] text-[#D72638] font-semibold hover:bg-[#D72638] hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <RouterLink
              to="/login"
              className="px-4 py-2 rounded bg-[#D72638] text-white font-semibold hover:bg-red-700"
            >
              Login
            </RouterLink>
            <RouterLink
              to="/signup"
              className="px-4 py-2 rounded border border-[#D72638] text-[#D72638] font-semibold hover:bg-[#D72638] hover:text-white"
            >
              Register
            </RouterLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
