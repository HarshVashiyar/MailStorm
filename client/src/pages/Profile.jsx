import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/authContext";
import ProfileAvatar from "../components/ProfileAvatar";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isFirstMount = useRef(true);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        
        // Check if user profile was deleted or authentication failed
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          logout();
          toast.error("Your account no longer exists. Redirecting to home...");
          setTimeout(() => {
            navigate("/");
          }, 1500);
          return;
        }
        
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

  const handlePhotoChange = async (file) => {
    const toastID = toast.loading("Uploading profile photo...");
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_PROFILE_PHOTO_ROUTE}`,
        formData,
        { 
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      if (response.data?.success === true) {
        toast.dismiss(toastID);
        toast.success("Profile photo updated successfully!");
        // Update local state with new photo
        setUser(prev => ({
          ...prev,
          profilePhoto: response.data.data.profilePhoto
        }));
      } else {
        toast.dismiss(toastID);
        toast.error(response.data?.message || "Failed to upload photo.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Failed to upload photo.");
      console.error(error);
    }
  };

  const handleDeletePhoto = async () => {
    const toastID = toast.loading("Deleting profile photo...");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_DELETE_PROFILE_PHOTO_ROUTE}`,
        { withCredentials: true }
      );
      
      if (response.data?.success === true) {
        toast.dismiss(toastID);
        toast.success("Profile photo deleted successfully!");
        // Update local state to remove photo
        setUser(prev => ({
          ...prev,
          profilePhoto: { url: "", publicId: "" }
        }));
      } else {
        toast.dismiss(toastID);
        toast.error(response.data?.message || "Failed to delete photo.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Failed to delete photo.");
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    const toastID = toast.loading("Deleting account...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_USERS_ROUTE}`,
        {
          data: { userIds: [user._id] },
          withCredentials: true
        }
      );
      toast.dismiss(toastID);
      logout();
      toast.success("Account deleted successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Failed to delete account.");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return user ? (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Main Profile Card */}
        <div className="bg-dark-800/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-glass overflow-hidden">
          {/* Profile Content */}
          <div className="px-6 md:px-10 py-6">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-4">
              <ProfileAvatar
                fullName={user.fullName}
                size="xl"
                editable={true}
                onPhotoChange={handlePhotoChange}
                photoUrl={user.profilePhoto?.url}
                onPhotoDelete={handleDeletePhoto}
              />
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {user.fullName}
                </h2>
                <p className="text-gray-400 text-lg flex items-center justify-center md:justify-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* Account Information Card */}
              <div className="bg-dark-900/40 border border-white/5 rounded-2xl p-6 hover:border-primary-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Account Info</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-gray-200 font-medium">{user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="text-gray-200 font-medium break-all">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Activity Card */}
              <div className="bg-dark-900/40 border border-white/5 rounded-2xl p-6 hover:border-accent-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Activity</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Member Since</p>
                    <p className="text-gray-200 font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-200 font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleGoToAdmin}
                  className="flex-1 rounded-xl px-6 py-4 font-semibold transition-all duration-300 bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 hover:shadow-glow hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-400/40 flex items-center justify-center gap-2 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:rotate-12 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Go to Admin Dashboard
                </button>

                {/* Delete button moved here between Admin and Logout */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 rounded-xl px-6 py-4 font-semibold transition-all duration-300 bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-red-600 hover:to-red-700 hover:shadow-glow hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-400/40 flex items-center justify-center gap-2 group border border-red-500/20 hover:border-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete My Account
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="sm:flex-none rounded-xl px-6 py-4 font-semibold transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 hover:shadow-glow hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-400/40 flex items-center justify-center gap-2 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        {/* <div className="mt-4 bg-dark-900/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Visit our{" "}
            <span className="text-primary-400 hover:text-primary-300 cursor-pointer font-medium">Support Center</span>
            {" "}or{" "}
            <span className="text-primary-400 hover:text-primary-300 cursor-pointer font-medium">Contact Us</span>
          </p>
        </div> */}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-red-500/20 max-w-md w-full border border-red-500/20 animate-glow">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Delete Account?</h3>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-base">
              This action <span className="text-red-400 font-semibold">cannot be undone</span>.
              Your Account and all the associated data will be <span className="text-red-400 font-semibold">permanently deleted</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400/40 border border-gray-600/30 shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteAccount();
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400/40 border border-red-400/30 shadow-lg hover:shadow-red-500/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
        <p className="text-2xl text-gray-300 font-medium">Loading your profile...</p>
      </div>
    </div>
  );
};

export default Profile;
