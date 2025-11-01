import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const verifiedEmail = location.state?.email || "";
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(verifiedEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Fields marked with * are required.");
      return;
    }
    setError("");
    setIsLoading(true);
    const toastId = toast.loading("Please wait while we sign you up...");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_USER_SIGNUP_ROUTE
        }`,
        {
          fullName,
          email,
          password,
        }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastId);
        setIsLoading(false);
        toast.success("Signed up successfully!");
        setTimeout(() => {
          navigate("/signin");
        }, 700);
      }
    } catch (error) {
      setIsLoading(false);
      if (error?.response?.data?.message) {
        toast.dismiss(toastId);
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center flex-grow py-12">
        <div className="bg-dark-800/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass w-full max-w-md p-8 md:-mt-8 -mt-4 relative overflow-hidden group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Signup</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email {verifiedEmail && <span className="text-green-400 text-xs">(Verified)</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300 ${verifiedEmail ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={!!verifiedEmail}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full bg-dark-800/50 text-white placeholder-gray-400 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/40 backdrop-blur-sm transition-all duration-300"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-full px-4 py-2 font-semibold transition-all duration-300 bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 hover:shadow-glow hover:scale-105"
              >
                Signup
              </button>
            </form>
            {!verifiedEmail && (
              <p className="text-center mt-4 text-sm text-gray-400">
                New user?{" "}
                <span
                  className="text-primary-400 hover:text-accent-400 font-semibold underline-offset-4 hover:underline transition-colors duration-300 cursor-pointer"
                  onClick={() => navigate("/sendotp", { state: { isNew: true } })}
                >
                  Verify your email first
                </span>
              </p>
            )}
            <p className="text-center mt-4">
              Already have an account?{" "}
              <a href="/SignIn" className="text-primary-400 hover:text-accent-400 underline-offset-4 hover:underline transition-colors duration-300">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
