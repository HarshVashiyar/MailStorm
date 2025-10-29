import ExcelJS from "exceljs";

export const exportCompaniesToExcel = async (companies) => {
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
