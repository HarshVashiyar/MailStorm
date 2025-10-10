import React, { useState } from "react";
import ExcelJS from "exceljs";
import axios from "axios";
import { toast } from "react-toastify";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a file to import.");
    }

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

    const ext = file.name.split('.').pop().toLowerCase();
    const workbook = new ExcelJS.Workbook();
    
    try {
      if (ext === "csv") {
        await workbook.csv.readFile(file);
      } else {
        await workbook.xlsx.load(await file.arrayBuffer());
      }

      const worksheet = workbook.worksheets[0];
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
              rowData[header] = cell.value;
            }
          });
          jsonData.push(rowData);
        }
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_BACKEND_IMPORT_EXCEL_ROUTE}`,
        jsonData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Companies imported successfully!");
      } else {
        toast.error("Import failed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while importing companies."
      );
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".xlsx, .xlsm, .xlsb, .xls, .csv"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-green-500 text-white py-2 px-4 rounded-md"
      >
        Import Companies from Excel
      </button>
    </div>
  );
};

export default ExcelUpload;