import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/authContext";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isFirstMount = useRef(true);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const toastID = toast.loading("Loading user data...");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_USER_PROFILE_ROUTE
          }`,
          { withCredentials: true }
        );
        if (response.data?.success === true) {
          setUser(response.data.data);
          setIsLoading(false);
          toast.dismiss(toastID);
          if (isFirstMount.current) {
            toast.success("Welcome to your profile!");
            isFirstMount.current = false;
          }
          return;
        } else {
          toast.dismiss(toastID);
          setIsLoading(false);
          toast.error(response.data?.message || "Failed to load user data.");
        }
      } catch (error) {
        setIsLoading(false);
        toast.dismiss(toastID);
        if (error?.response?.data?.message) {
          if (isFirstMount.current) {
            toast.error(error.response.data.message);
            isFirstMount.current = false;
          }
        }
        else {
          if (isFirstMount.current) {
            toast.error("Something went wrong!");
            isFirstMount.current = false;
          }
        }
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  const handleGoToAdmin = () => {
    navigate("/Admin");
  };

  const handleLogout = async () => {
    const toastID = toast.loading("Logging out...");
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_USER_LOGOUT_ROUTE
        }`,
        {},
        { withCredentials: true }
      );
      toast.dismiss(toastID);
      logout();
      toast.success("Logged out successfully!");
      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Failed to logout.");
    }
  };

  return user ? (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="p-8 max-w-xl mx-auto bg-dark-800/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="space-y-3 text-gray-300">
            <p className="text-xl">
              <span className="font-semibold text-primary-300">Full Name:</span> {user.fullName}
            </p>
            <p className="text-xl">
              <span className="font-semibold text-primary-300">Email:</span> {user.email}
            </p>
            <p className="text-xl">
              <span className="font-semibold text-primary-300">Role:</span> {user.role}
            </p>
            <p className="text-xl">
              <span className="font-semibold text-primary-300">Account Created:</span>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
            <p className="text-xl">
              <span className="font-semibold text-primary-300">Last Updated:</span>{" "}
              {new Date(user.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={handleGoToAdmin}
            className="rounded-full px-6 py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 hover:shadow-glow hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400/40 cursor-pointer"
          >
            Admin Page
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full px-6 py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 hover:shadow-glow hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400/40 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="p-8 text-center text-2xl">Loading...</div>
    </div>
  );
};

export default Profile;
