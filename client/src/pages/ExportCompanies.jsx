import ExcelJS from "exceljs";

const ExportCompanies = ({ companies }) => {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Companies');

    // Format product group array to string
    const dataForExport = companies.map((company) => ({
      ...company,
      companyProductGroup: Array.isArray(company.companyProductGroup)
        ? company.companyProductGroup.join(", ")
        : company.companyProductGroup,
    }));

    // Add headers
    const headers = Object.keys(dataForExport[0] || {});
    worksheet.addRow(headers);

    // Add data rows
    dataForExport.forEach(company => {
      worksheet.addRow(Object.values(company));
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
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