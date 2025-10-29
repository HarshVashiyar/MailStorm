import { useState } from "react";
import ExcelJS from "exceljs";
import axios from "axios";
import { toast } from "react-toastify";

const ExcelUpload = () => {
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

    const allowedFields = [
      "companyName",
      "companyWebsite",
      "companyCountry",
      "companyAddress",
      "companyEmail",
      "companyPhone",
      "companyProductGroup",
      "companyContactPersonName",
      "companyContactPersonPhone",
      "companyNotes"
    ];

    const workbook = new ExcelJS.Workbook();
    
    try {
      
      // Read the file as ArrayBuffer and load it into ExcelJS
      const arrayBuffer = await file.arrayBuffer();
      
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheet found in the file");
      }
      
      const jsonData = [];

      // Get headers
      const headers = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value);
      });

      // Get data
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (allowedFields.includes(header)) {
              // Handle product group as comma-separated string or array
              if (header === "companyProductGroup" && cell.value) {
                rowData[header] = typeof cell.value === 'string' 
                  ? cell.value.split(',').map(item => item.trim())
                  : [String(cell.value)];
              } else {
                rowData[header] = cell.value;
              }
            }
          });
          // Only add rows that have at least a company name
          if (rowData.companyName) {
            jsonData.push(rowData);
          }
        }
      });
      
      if (jsonData.length === 0) {
        return toast.error("No valid company data found in the file. Make sure the headers match the required fields.");
      }

      const url = `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_IMPORT_EXCEL_ROUTE}`;
      
      const response = await axios.post(
        url,
        jsonData,
        {
          withCredentials: true
        }
      );

      if (response.status === 201 || response.status === 207) {
        toast.success(response.data?.message || "Companies imported successfully!");
        setFile(null); // Reset file input
        // Reset the file input element
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(response.data?.message || "Import failed.");
      }
    } catch (error) {
      console.error("Import error:", error);
      console.error("Error details:", error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "An error occurred while importing companies.";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
        Required columns: companyName, companyEmail (others optional)
      </p>
    </div>
  );
};

export default ExcelUpload;