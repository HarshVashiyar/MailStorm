import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext"

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  const activeClasses = 'text-white bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-400/30 shadow-glow';
  const inactiveClasses = 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800/20 backdrop-blur-xl border-b border-white/10 shadow-glass" style={{ zIndex: 1500 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
            <NavLink to="/" className="flex items-center no-underline group">
              <div className="relative">
                <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent group-hover:animate-glow">
                  MailStorm
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </NavLink>
          </div>

          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => `relative px-6 py-3 rounded-full transition-all duration-300 group ${isActive ? activeClasses : inactiveClasses}`}
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">Home</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full animate-pulse-slow"></div>
                  )}
                </>
              )}
            </NavLink>

            {isAuthenticated ? (
              <NavLink
                to="/profile"
                className={({ isActive }) => `relative px-6 py-3 rounded-full transition-all duration-300 group ${isActive ? activeClasses : inactiveClasses}`}
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Profile</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full animate-pulse-slow"></div>
                    )}
                  </>
                )}
              </NavLink>
            ) : (
              <NavLink
                to="/signin"
                className={({ isActive }) => `relative px-6 py-3 rounded-full transition-all duration-300 group ${isActive ? activeClasses : inactiveClasses}`}
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Sign In</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full animate-pulse-slow"></div>
                    )}
                  </>
                )}
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
