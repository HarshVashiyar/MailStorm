import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Verifyotp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          toast.error("OTP expired! Redirecting to sign in...");
          setTimeout(() => navigate("/signin"), 700);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    const toastId = toast.loading("Verifying OTP...");
    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_VERIFY_OTP_ROUTE
        }`,
        { email, otp }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastId);
        setIsLoading(false);
        toast.success("OTP verified successfully!");
        setTimeout(() => {
          navigate("/resetpassword", { state: { email } });
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
            <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Verify OTP
            </h2>
            <p className="text-center text-gray-400 text-sm mb-1">
              OTP sent to{" "}
              <span className="font-semibold text-primary-400">{email}</span>
            </p>
            <p className="text-center text-sm font-medium text-red-400 mb-6">
              Time remaining: {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm text-center mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  placeholder="6-digit OTP"
                  className="mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300 tracking-widest text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center min-h-[42px] ${isLoading || timeLeft === 0
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:from-primary-600 hover:to-accent-600 hover:shadow-glow'
                  }`}
                disabled={isLoading || timeLeft === 0}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>

            <div className="text-sm text-gray-400 text-center mt-4 bg-dark-800/30 p-3 rounded-lg border border-white/5">
              Please enter the OTP sent to your email to continue.
            </div>

            <p className="text-sm text-center mt-4 text-gray-300">
              Didn't receive the OTP?{" "}
              <span
                className="text-primary-400 hover:text-accent-400 font-semibold underline-offset-4 hover:underline transition-colors duration-300 cursor-pointer"
                onClick={() => navigate("/forgotpassword")}
              >
                Resend here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verifyotp;
