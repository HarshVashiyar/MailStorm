import { useState } from "react";
import ExcelJS from "exceljs";
import axios from "axios";
import { toast } from "react-toastify";

const ExcelUpload = ({ refreshUsers }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a file to import.");
    }

    setLoading(true);
    const toastId = toast.loading("Importing companies from Excel...");

    const workbook = new ExcelJS.Workbook();

    try {
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheet found in the file");
      }

      const jsonData = [];

      // Process each row (skip header)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData = {
            companyName: row.getCell(1).value ? String(row.getCell(1).value).trim() : null,
            companyProductGroup: row.getCell(2).value ? String(row.getCell(2).value).trim() : null,
            companyEmail: row.getCell(3).value ? String(row.getCell(3).value).trim() : null,
            contactPersonName: row.getCell(4).value ? String(row.getCell(4).value).trim() : null,
            website: row.getCell(5).value ? String(row.getCell(5).value).trim() : null,
            country: row.getCell(6).value ? String(row.getCell(6).value).trim() : null,
            address: row.getCell(7).value ? String(row.getCell(7).value).trim() : null,
            companyPhone: row.getCell(8).value ? String(row.getCell(8).value).trim() : null,
            contactPersonPhone: row.getCell(9).value ? String(row.getCell(9).value).trim() : null,
            procurementTeam: row.getCell(10).value ? String(row.getCell(10).value).toLowerCase().trim() : null,
            notes: row.getCell(11).value ? String(row.getCell(11).value).trim() : null
          };

          // Only add rows with required fields
          if (rowData.companyName && rowData.companyProductGroup && rowData.companyEmail && rowData.contactPersonName) {
            jsonData.push(rowData);
          }
        }
      });

      console.log("Parsed Data:", jsonData);

      if (jsonData.length === 0) {
        toast.dismiss(toastId);
        setLoading(false);
        return toast.error("No valid company data found. Ensure companyName, companyProductGroup, companyEmail, and contactPersonName are filled.");
      }

      const url = `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_IMPORT_EXCEL_ROUTE}`;

      const response = await axios.post(url, jsonData, { withCredentials: true });

      if (response.data?.success === true && (response.status === 201 || response.status === 207)) {
        toast.dismiss(toastId);
        toast.success(response.data?.message || "Companies imported successfully!");
        setLoading(false);

        if (refreshUsers) {
          await refreshUsers();
        }

        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        toast.dismiss(toastId);
        setLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      console.error("Excel upload error:", error);
      toast.dismiss(toastId);
      setLoading(false);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          accept=".xlsx, .xlsm, .xlsb, .xls"
          onChange={handleFileChange}
          disabled={loading}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-600 file:text-white hover:file:from-purple-600 hover:file:to-pink-700 file:cursor-pointer file:transition-all file:duration-300 cursor-pointer bg-white/5 border border-white/10 rounded-lg p-2"
        />
        {file && (
          <p className="text-xs text-gray-400">Selected: {file.name}</p>
        )}
      </div>
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full rounded-xl px-4 py-3 font-semibold transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Importing...</span>
          </>
        ) : (
          <>
            <span>📊</span>
            <span>Import Companies from Excel</span>
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 italic">
        Required columns (in order): companyName, companyProductGroup, companyEmail, contactPersonName
      </p>
    </div>
  );
};

export default ExcelUpload;