import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelUpload from './ExcelUpload';
import { 
  FaBuilding, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaClipboardList, 
  FaUser, 
  FaMobileAlt,
  FaEdit,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaChartBar
} from 'react-icons/fa';

const AddCompany = ({
  upd,
  users,
  setUsers,
  selectedUsers,
  setSelectedUsers,
  closeForm,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    companyCountry: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    companyProductGroup: [],
    companyContactPersonName: "",
    companyContactPersonPhone: "",
  });

  const [productGroupString, setProductGroupString] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProductGroupChange = (e) => {
    setProductGroupString(e.target.value);
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.companyName)
      tempErrors.companyName = "Company Name is required";
    if (!formData.companyWebsite)
      tempErrors.companyWebsite = "Company Website is required";
    if (!formData.companyCountry)
      tempErrors.companyCountry = "Company Country is required";
    if (!formData.companyAddress)
      tempErrors.companyAddress = "Company Address is required";
    if (!formData.companyEmail)
      tempErrors.companyEmail = "Company Email is required";
    if (!formData.companyPhone)
      tempErrors.companyPhone = "Company Phone is required";
    if (!productGroupString.trim())
      tempErrors.companyProductGroup = "Company Product Group is required";
    if (!formData.companyContactPersonName)
      tempErrors.companyContactPersonName = "Contact Person Name is required";
    if (!formData.companyContactPersonPhone)
      tempErrors.companyContactPersonPhone = "Contact Person Phone is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const closeAddCompanyForm = () => {
    setFormData({
      companyName: "",
      companyWebsite: "",
      companyCountry: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      companyProductGroup: [],
      companyContactPersonName: "",
      companyContactPersonPhone: "",
    });
    setProductGroupString("");
    setErrors({});
    closeForm();
  };

  const handleAddCompany = async () => {
    setLoading(true);
    const toastID = toast.loading("Adding company...");
    if (validate()) {
      try {
        const updatedFormData = {
          ...formData,
          companyProductGroup: productGroupString
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item),
        };
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_COMPANY_ROUTE}`,
          updatedFormData,
          { withCredentials: true }
        );
        if (response.data?.success === true && response.status === 201) {
          const newCompany = response.data?.data;
          toast.dismiss(toastID);
          setLoading(false);
          if (newCompany) {
            setUsers(prevUsers => [...prevUsers, newCompany]);
          }
          toast.success(response.data?.message || "Company added successfully!");
          closeAddCompanyForm();
        } else {
          toast.dismiss(toastID);
          setLoading(false);
          toast.error(response.data?.message || "Addition failed.");
        }
      } catch (error) {
        toast.dismiss(toastID);
        setLoading(false);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.data) {
          toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    }
  };

  const handleUpdateCompany = async () => {
    if (validate()) {
      const toastID = toast.loading("Updating company...");
      setLoading(true);
      try {
        const updatedFormData = {
          ...formData,
          companyProductGroup: productGroupString
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item),
          id: selectedUsers,
        };
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_COMPANY_ROUTE}`,
          updatedFormData,
          { withCredentials: true }
        );
        if (response.data?.success === true && response.status === 200) {
          toast.dismiss(toastID);
          setLoading(false);
          const updatedCompany = response.data?.data;
          if (updatedCompany) {
            setUsers(prevUsers =>
              prevUsers.map(user =>
                user._id === updatedCompany._id ? updatedCompany : user
              )
            );
          }
          toast.success(response.data?.message || "Company updated successfully!");
          closeAddCompanyForm();
          setSelectedUsers([]);
        } else {
          toast.dismiss(toastID);
          setLoading(false);
          toast.error(response.data?.message || "Update failed.");
        }
      } catch (error) {
        toast.dismiss(toastID);
        setLoading(false);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.data) {
          toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    }
  };

  useEffect(() => {
    if (upd && selectedUsers) {
      const userData = users.find(
        (user) => String(user._id) === String(selectedUsers)
      );

      if (userData) {
        setFormData({
          companyName: userData.companyName || "",
          companyWebsite: userData.companyWebsite || "",
          companyCountry: userData.companyCountry || "",
          companyAddress: userData.companyAddress || "",
          companyEmail: userData.companyEmail || "",
          companyPhone: userData.companyPhone || "",
          companyContactPersonName: userData.companyContactPersonName || "",
          companyContactPersonPhone: userData.companyContactPersonPhone || "",
          companyProductGroup: userData.companyProductGroup || [],
        });

        setProductGroupString(
          userData.companyProductGroup
            ? userData.companyProductGroup.join(", ")
            : ""
        );
      }
    }
  }, [upd, selectedUsers, users]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24"
      style={{ zIndex: 1100 }}
    >
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden border border-white/20 flex flex-col mt-4">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <span className="text-white">{upd ? <FaEdit /> : <FaBuilding />}</span>
            <span>{upd ? 'Edit Company' : 'Add New Company'}</span>
          </h3>
          <p className="text-gray-300 text-sm">
            {upd ? 'Update company information and contact details' : 'Enter company information and contact details to add a new company'}
          </p>
        </div>

        {/* Scrollable Form Container */}
        <div className="flex-1 overflow-y-auto">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaBuilding className="text-blue-400" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyName && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyName}</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaGlobe className="text-green-400" />
                <span>Website</span>
              </label>
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://company.com"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyWebsite && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyWebsite}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaGlobe className="text-purple-400" />
                <span>Country</span>
              </label>
              <input
                type="text"
                name="companyCountry"
                value={formData.companyCountry}
                onChange={handleChange}
                placeholder="Enter country..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyCountry && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyCountry}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaMapMarkerAlt className="text-red-400" />
                <span>Address</span>
              </label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="Enter full address..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyAddress && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyAddress}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaEnvelope className="text-yellow-400" />
                <span>Email</span>
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="company@email.com"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyEmail && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyEmail}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaPhone className="text-cyan-400" />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyPhone && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyPhone}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaClipboardList className="text-orange-400" />
                <span>Products/Services</span>
              </label>
              <textarea
                value={productGroupString}
                onChange={handleProductGroupChange}
                placeholder="Software, Consulting, Marketing..."
                rows="3"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              />
              {errors.companyProductGroup && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyProductGroup}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaUser className="text-indigo-400" />
                <span>Contact Person Name</span>
              </label>
              <input
                type="text"
                name="companyContactPersonName"
                value={formData.companyContactPersonName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyContactPersonName && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyContactPersonName}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium flex items-center space-x-2">
                <FaMobileAlt className="text-pink-400" />
                <span>Contact Person Phone</span>
              </label>
              <input
                type="tel"
                name="companyContactPersonPhone"
                value={formData.companyContactPersonPhone}
                onChange={handleChange}
                placeholder="+1 (555) 987-6543"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
              {errors.companyContactPersonPhone && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <FaExclamationTriangle />
                  <span>{errors.companyContactPersonPhone}</span>
                </p>
              )}
            </div>

            {/* Excel Upload Section */}
            <div className="md:col-span-2 lg:col-span-3 space-y-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-medium text-lg mb-3 flex items-center space-x-2">
                  <FaChartBar className="text-teal-400" />
                  <span>Bulk Import</span>
                </h4>
                <ExcelUpload setUsers={setUsers} />
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={upd ? handleUpdateCompany : handleAddCompany}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm border border-blue-400/30"
          >
            <span className="text-white">{upd ? <FaEdit /> : <FaCheck />}</span>
            <span>{upd ? 'Update Company' : 'Add Company'}</span>
          </button>
          
          <button
            type="button"
            onClick={closeAddCompanyForm}
            className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm border border-white/20"
          >
            <FaTimes />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompany;
