import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/authContext";
import { useSmtp } from "../context/SmtpContext";
import ProfileAvatar from "../components/ProfileAvatar";
import SmtpSlotCard from "../components/SmtpSlotCard";
import EmptySlotCard from "../components/EmptySlotCard";
import AddSmtpModal from "../components/modals/AddSmtpModal";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";
import { ProfileHeaderSkeleton, SmtpSlotsSkeleton } from "../components/SkeletonLoaders";
import {
  FaGoogle,
  FaMicrosoft,
  FaYahoo,
  FaServer,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaPowerOff
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ✅ Use context directly - no redundant local state sync
  const { smtpSlots, smtpStats, loading: loadingSmtp, fetchSlots, refresh: refreshSmtp } = useSmtp();

  const isFirstMount = useRef(true);
  const smtpSectionRef = useRef(null);
  const hasTriggeredSmtpFetch = useRef(false);

  const [user, setUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // SMTP Modal States
  const [showAddSmtpModal, setShowAddSmtpModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // ✅ Fetch ONLY user profile data on mount
  useEffect(() => {
    let isMounted = true;
    let toastID = null;

    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      toastID = toast.loading("Loading profile data...");

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_USER_PROFILE_ROUTE}`,
          { withCredentials: true }
        );

        if (!isMounted) {
          toast.dismiss(toastID);
          return;
        }

        if (response.data?.success === true) {
          setUser(response.data.data);
          if (isFirstMount.current) {
            toast.success("Welcome to your profile!");
            isFirstMount.current = false;
          }
        } else {
          toast.error(response.data?.message || "Failed to load user data.");
        }

        toast.dismiss(toastID);
        setIsLoadingProfile(false);
      } catch (error) {
        toast.dismiss(toastID);
        setIsLoadingProfile(false);

        if (!isMounted) return;

        // Check if user profile was deleted or authentication failed
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          logout();
          toast.error("Your account no longer exists. Redirecting to home...");
          setTimeout(() => {
            navigate("/");
          }, 1500);
          return;
        }

        if (isFirstMount.current) {
          toast.error(error?.response?.data?.message || "Something went wrong!");
          isFirstMount.current = false;
        }
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
      if (toastID) {
        toast.dismiss(toastID);
      }
    };
  }, [logout, navigate]);

  // ✅ IntersectionObserver to lazy-load SMTP slots when section scrolls into view
  useEffect(() => {
    if (!smtpSectionRef.current || hasTriggeredSmtpFetch.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTriggeredSmtpFetch.current) {
          // console.log('SMTP section visible - triggering fetch');
          hasTriggeredSmtpFetch.current = true;
          fetchSlots();
        }
      },
      {
        root: null,
        rootMargin: '100px', // Trigger 100px before section is visible
        threshold: 0.1
      }
    );

    observer.observe(smtpSectionRef.current);

    return () => {
      if (smtpSectionRef.current) {
        observer.unobserve(smtpSectionRef.current);
      }
    };
  }, [fetchSlots, isLoadingProfile]); // ✅ Re-run when loading completes and ref is available

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}smtp/available-slots`,
        { withCredentials: true }
      );
      if (response.data?.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  const handleAddSlot = async (slotNumber) => {
    setSelectedSlot(slotNumber);
    await fetchAvailableSlots();
    setShowAddSmtpModal(true);
  };

  const handleConnectOAuth = async (provider) => {
    const toastID = toast.loading(`Connecting to ${provider}...`);
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/oauth/${provider}/initiate`;

      const response = await axios.get(
        url,
        {
          params: { slotNumber: selectedSlot },
          withCredentials: true
        }
      );

      toast.dismiss(toastID);
      if (response.data?.success) {
        window.location.href = response.data.data.authUrl;
      } else {
        toast.error(response.data?.message || `Failed to connect ${provider}`);
      }
    } catch (error) {
      console.error('OAuth error:', error);
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || `Failed to connect ${provider}`);
    }
  };

  const handleDeleteSlot = async (slotNumber) => {
    const toastID = toast.loading("Deleting SMTP slot...");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}smtp/slot/${slotNumber}`,
        { withCredentials: true }
      );

      toast.dismiss(toastID);
      if (response.data?.success) {
        toast.success("SMTP slot deleted successfully!");
        await refreshSmtp();
      } else {
        toast.error(response.data?.message || "Failed to delete slot");
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Failed to delete slot");
    }
  };

  const handleToggleStatus = async (slotNumber, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}smtp/slot/${slotNumber}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data?.success) {
        toast.success(`Slot ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        await refreshSmtp();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleVerifySlot = async (slotNumber) => {
    const toastID = toast.loading("Verifying SMTP credentials...");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}smtp/verify/${slotNumber}`,
        {},
        { withCredentials: true }
      );

      toast.dismiss(toastID);
      if (response.data?.success) {
        toast.success("SMTP verified successfully! Account is now active.");
        await refreshSmtp();
      } else {
        toast.error(response.data?.message || "Verification failed");
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Failed to verify SMTP credentials");
      // Refresh to show the error in the UI
      await refreshSmtp();
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'gmail': return <FaGoogle className="text-red-500" />;
      case 'outlook': return <FaMicrosoft className="text-blue-500" />;
      case 'yahoo': return <FaYahoo className="text-purple-500" />;
      case 'custom': return <FaServer className="text-green-500" />;
      default: return <FaServer />;
    }
  };

  const getStatusIcon = (status, isVerified) => {
    if (!isVerified) return <FaExclamationCircle className="text-yellow-500" />;
    if (status === 'active') return <FaCheckCircle className="text-green-500" />;
    if (status === 'error' || status === 'needs_reauth') return <FaTimesCircle className="text-red-500" />;
    return <FaPowerOff className="text-gray-500" />;
  };

  const handleGoToAdmin = () => {
    navigate("/Admin");
  };

  const handleLogout = async () => {
    const toastID = toast.loading("Logging out...");
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_USER_LOGOUT_ROUTE}`,
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

  // ✅ Show skeleton while profile is loading
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto w-full">
          <ProfileHeaderSkeleton />
        </div>
      </div>
    );
  }

  return user ? (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-6xl mx-auto w-full">

        {/* Scroll Down Notice - Compact */}
        <div className="mb-4 bg-dark-800/40 backdrop-blur-md border border-primary-500/20 rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-300 text-center">
              Scroll down to manage your email sending account slots
            </p>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-dark-800/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-glass overflow-hidden mb-6">
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
                  Go to Dashboard
                </button>

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

        {/* ✅ SMTP Slots Section - lazy loaded with IntersectionObserver */}
        <div
          ref={smtpSectionRef}
          className="bg-dark-800/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-glass overflow-hidden"
        >
          <div className="px-6 md:px-10 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Email Sending Accounts</h2>
                <p className="text-gray-400 text-sm">Manage up to 5 SMTP accounts</p>
              </div>
              {smtpStats && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Today: {smtpStats.emailsSentToday} emails</p>
                  <p className="text-sm text-gray-400">Active: {smtpStats.activeSlots}/5</p>
                </div>
              )}
            </div>

            {/* ✅ Show skeleton while loading, otherwise show slots */}
            {loadingSmtp && smtpSlots.length === 0 ? (
              <SmtpSlotsSkeleton />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((slotNum) => {
                  const slot = smtpSlots.find(s => s.slotNumber === slotNum);

                  return slot ? (
                    <SmtpSlotCard
                      key={slotNum}
                      slot={slot}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteSlot}
                      onVerify={handleVerifySlot}
                      getProviderIcon={getProviderIcon}
                      getStatusIcon={getStatusIcon}
                    />
                  ) : (
                    <EmptySlotCard
                      key={slotNum}
                      slotNumber={slotNum}
                      onClick={() => handleAddSlot(slotNum)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSmtpModal
        show={showAddSmtpModal}
        onClose={() => setShowAddSmtpModal(false)}
        selectedSlot={selectedSlot}
        onConnectOAuth={handleConnectOAuth}
        onSmtpAdded={() => {
          refreshSmtp();
          setShowAddSmtpModal(false);
        }}
      />

      <DeleteAccountModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDeleteAccount();
        }}
      />
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