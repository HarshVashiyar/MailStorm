import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
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
    const reader = new FileReader();

    reader.onload = (evt) => {
      let workbook;
      if (ext === "csv") {
        workbook = XLSX.read(evt.target.result, { type: "string" });
      } else {
        const data = new Uint8Array(evt.target.result);
        workbook = XLSX.read(data, { type: "array" });
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = XLSX.utils.sheet_to_json(worksheet);

      const filteredData = jsonData.map((row) => {
        let filteredRow = {};
        allowedFields.forEach((field) => {
          if (row.hasOwnProperty(field)) {
            filteredRow[field] = row[field];
          }
        });
        return filteredRow;
      });

      axios
        .post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_BACKEND_IMPORT_EXCEL_ROUTE}`,
          filteredData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 201) {
            toast.success("Companies imported successfully!");
          } else {
            toast.error("Import failed.");
          }
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message ||
              "An error occurred while importing companies."
          );
        });
    };

    if (ext === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
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
