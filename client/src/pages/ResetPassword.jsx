import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150); // 2 minutes 30 seconds initial timeout
  const timerRef = useRef(null);
  const MAX_TIME = 150; // Maximum time cap: 2 minutes 30 seconds

  useEffect(() => {
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          toast.error("Session expired! Redirecting to forgot password...");
          setTimeout(() => navigate("/forgotpassword"), 700);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate]);

  const extendTimeout = () => {
    // Add 60 seconds when backend returns an error, but cap at MAX_TIME
    setTimeLeft((prevTime) => Math.min(prevTime + 60, MAX_TIME));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword != confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    setError("");
    setIsLoading(true);
    const toastId = toast.loading("Resetting password...");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_RESET_PASSWORD_ROUTE
        }`,
        { email, newPassword, confirmPassword }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastId);
        setIsLoading(false);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/signin");
        }, 700);
      } else {
        toast.dismiss(toastId);
        setIsLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      setIsLoading(false);
      extendTimeout(); // Add 1 minute on error
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center flex-grow py-12">
        <div className="bg-dark-800/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass p-8 w-full max-w-md relative overflow-hidden group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="text-center text-sm font-medium text-amber-400 mb-6">
              Time remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="resetPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="resetPassword"
                  name="resetPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300"
                  required
                />
                {error.resetPassword && (
                  <p className="text-red-500 text-xs mt-1">{error.resetPassword}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300"
                  required
                />
                {error.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{error.confirmPassword}</p>
                )}
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div>
                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center min-h-[42px] ${
                    isLoading || timeLeft === 0
                      ? 'opacity-75 cursor-not-allowed'
                      : 'hover:from-primary-600 hover:to-accent-600 hover:shadow-glow'
                  }`}
                  disabled={isLoading || timeLeft === 0}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
