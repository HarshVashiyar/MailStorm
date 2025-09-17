import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [otpCorrect, setOtpCorrect] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      toast.error(
        "No email found for OTP verification. Redirecting to send OTP page."
      );
      setTimeout(() => navigate("/SendOTP"), 2000);
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setOtp(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("No email found for OTP verification.");
      return navigate("/SendOTP");
    }

    if (otp.trim() === "") {
      toast.error("OTP is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_VERIFYOTP_ROUTE
        }`,
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        setOtpCorrect(true);
        toast.success("OTP verified successfully!");
        navigate("/ResetPassword", { state: { email } });
      } else {
        toast.error(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "An error occurred.");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center flex-grow py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              className={`w-full p-2 rounded-md text-white ${
                loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"
              }`}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
