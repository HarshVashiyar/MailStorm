import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FaServer,
    FaEnvelope,
    FaLock,
    FaNetworkWired,
    FaPlug,
    FaShieldAlt,
    FaTimes,
    FaCheck,
    FaExclamationTriangle,
    FaInfoCircle,
} from "react-icons/fa";

const AddCustomSmtp = ({
    show,
    onClose,
    selectedSlot,
    onSmtpAdded,
}) => {
    const [formData, setFormData] = useState({
        email: "",
        host: "",
        port: 587,
        secure: true,
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handlePortChange = (e) => {
        const value = parseInt(e.target.value) || "";
        setFormData({ ...formData, port: value });

        // Auto-set secure based on port
        if (value === 465) {
            setFormData(prev => ({ ...prev, port: value, secure: true }));
        } else if (value === 587 || value === 25) {
            setFormData(prev => ({ ...prev, port: value, secure: false }));
        }
    };

    const validate = () => {
        let tempErrors = {};

        if (!formData.email) {
            tempErrors.email = "Email address is required";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address";
        }

        if (!formData.host) {
            tempErrors.host = "SMTP host is required";
        }

        if (!formData.port) {
            tempErrors.port = "Port is required";
        } else if (formData.port < 1 || formData.port > 65535) {
            tempErrors.port = "Port must be between 1 and 65535";
        }

        if (!formData.password) {
            tempErrors.password = "Password or App Password is required";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            email: "",
            host: "",
            port: 587,
            secure: true,
            password: "",
        });
        setErrors({});
        setShowPassword(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        const toastID = toast.loading("Adding custom SMTP...");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}smtp/add-custom`,
                {
                    slotNumber: selectedSlot,
                    email: formData.email,
                    host: formData.host,
                    port: formData.port,
                    secure: formData.secure,
                    password: formData.password,
                },
                { withCredentials: true }
            );

            if (response.data?.success === true) {
                toast.dismiss(toastID);
                toast.success(response.data?.message || "Custom SMTP added successfully!");
                resetForm();
                if (onSmtpAdded) {
                    onSmtpAdded(response.data?.data);
                }
                onClose();
            } else {
                toast.dismiss(toastID);
                toast.error(response.data?.message || "Failed to add custom SMTP.");
            }
        } catch (error) {
            toast.dismiss(toastID);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data) {
                toast.error(
                    typeof error.response.data === "string"
                        ? error.response.data
                        : "An error occurred."
                );
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Common SMTP configurations
    const smtpPresets = [
        { label: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
        { label: "Outlook", host: "smtp.office365.com", port: 587, secure: false },
        { label: "Yahoo", host: "smtp.mail.yahoo.com", port: 465, secure: true },
        { label: "Zoho", host: "smtp.zoho.com", port: 465, secure: true },
        { label: "iCloud", host: "smtp.mail.me.com", port: 587, secure: false },
        { label: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    ];

    const applyPreset = (preset) => {
        setFormData(prev => ({
            ...prev,
            host: preset.host,
            port: preset.port,
            secure: preset.secure,
        }));
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24"
            style={{ zIndex: 1100 }}
        >
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-white/20 flex flex-col mt-4">
                {/* Header */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center space-x-3 mb-1">
                                <span className="text-green-400">
                                    <FaServer />
                                </span>
                                <span>Add Custom SMTP</span>
                            </h3>
                            <p className="text-gray-300 text-sm">
                                Configure custom SMTP credentials for Slot {selectedSlot}
                            </p>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 flex items-start gap-3">
                        <FaInfoCircle className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-100">
                            <p className="font-medium mb-1">Important:</p>
                            <ul className="list-disc list-inside text-xs text-blue-200 space-y-0.5">
                                <li>For Gmail, use an App Password (not your regular password)</li>
                                <li>Enable "Less secure apps" or use App-specific passwords</li>
                                <li>Your credentials are encrypted and stored securely</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Scrollable Form Container */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Quick Presets */}
                    <div className="mb-4">
                        <label className="text-white text-sm font-medium mb-2 block">
                            Quick Setup (Optional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {smtpPresets.map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-200"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-white text-sm font-medium flex items-center space-x-2">
                                <FaEnvelope className="text-yellow-400" />
                                <span>Email Address</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your-email@domain.com"
                                className="w-full px-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm flex items-center space-x-1">
                                    <FaExclamationTriangle />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Host & Port Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* SMTP Host */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-white text-sm font-medium flex items-center space-x-2">
                                    <FaNetworkWired className="text-purple-400" />
                                    <span>SMTP Host</span>
                                </label>
                                <input
                                    type="text"
                                    name="host"
                                    value={formData.host}
                                    onChange={handleChange}
                                    placeholder="smtp.example.com"
                                    className="w-full px-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                />
                                {errors.host && (
                                    <p className="text-red-400 text-sm flex items-center space-x-1">
                                        <FaExclamationTriangle />
                                        <span>{errors.host}</span>
                                    </p>
                                )}
                            </div>

                            {/* Port */}
                            <div className="space-y-1">
                                <label className="text-white text-sm font-medium flex items-center space-x-2">
                                    <FaPlug className="text-cyan-400" />
                                    <span>Port</span>
                                </label>
                                <input
                                    type="number"
                                    name="port"
                                    value={formData.port}
                                    onChange={handlePortChange}
                                    placeholder="587"
                                    min="1"
                                    max="65535"
                                    className="w-full px-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                />
                                {errors.port && (
                                    <p className="text-red-400 text-sm flex items-center space-x-1">
                                        <FaExclamationTriangle />
                                        <span>{errors.port}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Security Toggle */}
                        <div className="space-y-1">
                            <label className="text-white text-sm font-medium flex items-center space-x-2">
                                <FaShieldAlt className="text-green-400" />
                                <span>Security (SSL/TLS)</span>
                            </label>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, secure: true }))}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${formData.secure
                                            ? "bg-green-500 text-white"
                                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                                        }`}
                                >
                                    SSL/TLS (Secure)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, secure: false }))}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!formData.secure
                                            ? "bg-orange-500 text-white"
                                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                                        }`}
                                >
                                    STARTTLS
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">
                                {formData.secure
                                    ? "Port 465 typically uses SSL/TLS"
                                    : "Ports 25 and 587 typically use STARTTLS"}
                            </p>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="text-white text-sm font-medium flex items-center space-x-2">
                                <FaLock className="text-red-400" />
                                <span>Password / App Password</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your email password or app password"
                                    className="w-full px-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-20"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-sm flex items-center space-x-1">
                                    <FaExclamationTriangle />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                            <p className="text-gray-400 text-xs mt-1">
                                For Gmail, Outlook, and Yahoo: Use an App Password instead of your regular password
                            </p>
                        </div>
                    </form>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        <FaCheck />
                        <span>{loading ? "Adding..." : "Add Custom SMTP"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm border border-white/20 text-sm"
                    >
                        <FaTimes />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCustomSmtp;
