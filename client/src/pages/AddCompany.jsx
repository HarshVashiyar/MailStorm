import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelUpload from './ExcelUpload';

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
          `${import.meta.env.VITE_BACKEND_BASE_URL}${
            import.meta.env.VITE_BACKEND_ADDCOMPANY_ROUTE
          }`,
          updatedFormData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 201) {
          toast.success("Company added successfully!");
          toast.info("Please refresh the page to see the changes.");
          closeAddCompanyForm();
        } else {
          toast.error(response.data.message || "Addition failed.");
        }
      } catch (error) {
        if (error.response && error.response.data) {
          toast.error(error.response.data.message || "An error occurred.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    }
  };

  const handleUpdateCompany = async () => {
    if (validate()) {
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
          `${import.meta.env.VITE_BACKEND_BASE_URL}${
            import.meta.env.VITE_BACKEND_UPDATECOMPANY_ROUTE
          }`,
          updatedFormData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success("Company updated successfully!");
          toast.info("Please refresh the page to see the changes.");
          closeAddCompanyForm();
          setSelectedUsers([]);
        } else {
          toast.error(response.data.message || "Update failed.");
        }
      } catch (error) {
        if (error.response && error.response.data) {
          toast.error(error.response.data.message || "An error occurred.");
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
      className="absolute top-0 left-0 w-full h-max-screen bg-gray-800 bg-opacity-80 flex items-center justify-center z-40"
      style={{ zIndex: 1100 }}
    >
      <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-50 mb-6 text-center">
          Add Company
        </h2>
        <form className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyName && (
              <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Website
            </label>
            <input
              type="text"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyWebsite && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyWebsite}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Country
            </label>
            <input
              type="text"
              name="companyCountry"
              value={formData.companyCountry}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyCountry && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyCountry}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Address
            </label>
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyAddress && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyAddress}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Email
            </label>
            <input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyEmail && (
              <p className="text-red-400 text-sm mt-1">{errors.companyEmail}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Phone
            </label>
            <input
              type="text"
              name="companyPhone"
              value={formData.companyPhone}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyPhone && (
              <p className="text-red-400 text-sm mt-1">{errors.companyPhone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Company Products (comma-separated)
            </label>
            <textarea
              value={productGroupString}
              onChange={handleProductGroupChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              rows="3"
            />
            {errors.companyProductGroup && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyProductGroup}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Contact Person Name
            </label>
            <input
              type="text"
              name="companyContactPersonName"
              value={formData.companyContactPersonName}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyContactPersonName && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyContactPersonName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-50">
              Contact Person Phone
            </label>
            <input
              type="text"
              name="companyContactPersonPhone"
              value={formData.companyContactPersonPhone}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 text-gray-50 border border-gray-600 rounded-md shadow-sm p-2"
              required
            />
            {errors.companyContactPersonPhone && (
              <p className="text-red-400 text-sm mt-1">
                {errors.companyContactPersonPhone}
              </p>
            )}
          </div>
          <div className="col-span-3">
            <ExcelUpload />
          </div>
          <div className="col-span-3 flex justify-between gap-4">
            <button
              type="button"
              onClick={upd ? handleUpdateCompany : handleAddCompany}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Done
            </button>
            <button
              type="button"
              onClick={closeAddCompanyForm}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompany;
