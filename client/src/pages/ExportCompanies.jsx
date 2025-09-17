import React from "react";
import * as XLSX from "xlsx";

const ExportCompanies = ({ companies }) => {
  const handleExport = () => {
    const dataForExport = companies.map((company) => ({
      ...company,
      companyProductGroup: Array.isArray(company.companyProductGroup)
        ? company.companyProductGroup.join(", ")
        : company.companyProductGroup,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");

    XLSX.writeFile(workbook, "companies.xlsx");
  };

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
    >
      Export Companies to Excel
    </button>
  );
};

export default ExportCompanies;
