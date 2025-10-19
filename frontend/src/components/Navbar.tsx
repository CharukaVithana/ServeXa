import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-[#282828] text-white">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="ServeXa Logo" className="h-10" />
      </div>
      <div className="flex items-center gap-8">
        <Link to="/" className="px-3 py-1 rounded bg-white text-[#D72638] font-semibold">Home</Link>
        <a href="#service" className="hover:text-[#D72638]">Service</a>
        <a href="#about" className="hover:text-[#D72638]">About</a>
        <a href="#contact" className="hover:text-[#D72638]">Contact</a>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <span className="mr-4">Welcome, {user?.fullName}</span>
            <Link to="/dashboard" className="px-4 py-2 rounded bg-[#D72638] text-white font-semibold hover:bg-red-700">
              Dashboard
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded border border-[#D72638] text-[#D72638] font-semibold hover:bg-[#D72638] hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 rounded bg-[#D72638] text-white font-semibold hover:bg-red-700">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded border border-[#D72638] text-[#D72638] font-semibold hover:bg-[#D72638] hover:text-white">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;