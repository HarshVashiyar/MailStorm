import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    resetPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    resetPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let valid = true;
    let errors = {};

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordRegex.test(formData.resetPassword)) {
      valid = false;
      errors.resetPassword =
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character.";
    }

    if (formData.resetPassword !== formData.confirmPassword) {
      valid = false;
      errors.confirmPassword = "Passwords do not match.";
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}${
            import.meta.env.VITE_BACKEND_RESETPASSWORD_ROUTE
          }`,
          {
            email,
            newPassword: formData.resetPassword,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          toast.success("Password reset successfully!");
          setFormData({ resetPassword: "", confirmPassword: "" });
          navigate("/");
        } else {
          toast.error("An error occurred while resetting the password.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center flex-grow py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="resetPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="resetPassword"
                name="resetPassword"
                value={formData.resetPassword}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
              {errors.resetPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.resetPassword}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
