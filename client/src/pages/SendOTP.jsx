import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SendOTP = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setSuccessMessage("");
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email must be in the format: example@mail.com");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateEmail()) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}${
            import.meta.env.VITE_BACKEND_SENDOTP_ROUTE
          }`,
          { email },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setSuccessMessage(response.data.message);
          toast.success("OTP sent successfully!");
          navigate("/VerifyOTP", { state: { email } });
        } else {
          toast.error(response.data.message || "Failed to send OTP.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while sending OTP."
        );
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center flex-grow py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Forgot Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              {successMessage && (
                <p className="text-green-500 text-sm mt-1">{successMessage}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md"
            >
              Send OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendOTP;
