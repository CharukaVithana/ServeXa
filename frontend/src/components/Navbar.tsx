import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Link as ScrollLink } from "react-scroll";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-[#282828] text-white fixed w-full z-50">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="ServeXa Logo" className="h-10 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}/>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <ScrollLink
          to="hero"
          smooth={true}
          duration={500}
          className="cursor-pointer hover:text-[#D72638]"
        >
          Home
        </ScrollLink>
        <ScrollLink
          to="service"
          smooth={true}
          duration={500}
          offset={-80} // Adjust for navbar height
          className="cursor-pointer hover:text-[#D72638]"
        >
          Service
        </ScrollLink>
        <ScrollLink
          to="about"
          smooth={true}
          duration={500}
          offset={-80}
          className="cursor-pointer hover:text-[#D72638]"
        >
          About
        </ScrollLink>
        <ScrollLink
          to="contact"
          smooth={true}
          duration={500}
          offset={-80}
          className="cursor-pointer hover:text-[#D72638]"
        >
          Contact
        </ScrollLink>
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
