import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Update the authentication state
  };

  useEffect(() => {
    checkAuth();

    // Listen for changes in localStorage to synchronize state
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <header className="bg-gray-900 py-2 fixed top-0 left-0 h-20 w-full z-50 flex justify-between items-center px-8" style={{ zIndex: 1500 }}>
      {/* Company Logo */}
      <div className="flex items-center">
        <NavLink to="/" className="flex items-center no-underline">
          <span className="font-montserrat font-bold text-6xl text-white">
            Comp
          </span>
          <span className="font-montserrat font-bold text-6xl text-yellow-500">
            any Lo
          </span>
          <span className="font-montserrat font-bold text-6xl text-white">
            go
          </span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="ml-auto">
        <ul className="flex list-none gap-10 md:gap-8 sm:gap-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `no-underline font-montserrat text-xl font-extrabold text-white relative transition-colors duration-300 ease-in-out ${
                  isActive ? "text-yellow-500" : ""
                }`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ViewProducts"
              className={({ isActive }) =>
                `no-underline font-montserrat text-xl font-extrabold text-white relative transition-colors duration-300 ease-in-out ${
                  isActive ? "text-yellow-500" : ""
                }`
              }
            >
              Browse
            </NavLink>
          </li>
          {isAuthenticated ? (
            <li>
              <NavLink
                to="/Profile"
                className={({ isActive }) =>
                  `no-underline font-montserrat text-xl font-extrabold text-white relative transition-colors duration-300 ease-in-out ${
                    isActive ? "text-yellow-500" : ""
                  }`
                }
              >
                Profile
              </NavLink>
            </li>
          ) : (
            <li>
              <NavLink
                to="/SignIn"
                className={({ isActive }) =>
                  `no-underline font-montserrat text-xl font-extrabold text-white relative transition-colors duration-300 ease-in-out ${
                    isActive ? "text-yellow-500" : ""
                  }`
                }
              >
                Sign In
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;