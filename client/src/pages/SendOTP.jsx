import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SendOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.state?.isNew ?? null;
  
  // Security: Redirect if isNew flag is missing (must come from proper flow)
  useEffect(() => {
    if (isNew === null) {
      toast.error("Invalid access. Please use the proper authentication flow.");
      navigate("/signin", { replace: true });
    }
  }, [isNew, navigate]);

  // Prevent browser back button from breaking the flow
  useEffect(() => {
    const handlePopState = () => {
      navigate("/signin", { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Don't render if security check fails
  if (isNew === null) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setIsLoading(true);
    const toastId = toast.loading("Please wait while we send the OTP...");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_SEND_OTP_ROUTE}`,
        { email, isNew }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastId);
        setIsLoading(false);
        toast.success("OTP sent successfully!");
        setTimeout(() => {
          navigate("/verifyotp", { state: { email, isNew }, replace: true });
        }, 700);
      } else {
        toast.dismiss(toastId);
        setIsLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      setIsLoading(false);
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
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              {isNew ? "Email Verification" : "Forgot Password"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300"
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center min-h-[42px] ${isLoading
                      ? 'opacity-75 cursor-not-allowed'
                      : 'hover:from-primary-600 hover:to-accent-600 hover:shadow-glow'
                    }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    "Send OTP"
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

export default SendOTP;
