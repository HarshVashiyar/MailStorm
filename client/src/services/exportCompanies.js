import ExcelJS from "exceljs";

export const exportCompaniesToExcel = async (companies) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Companies');

  // Define columns with headers and keys exactly as requested
  worksheet.columns = [
    { header: 'companyName', key: 'companyName', width: 20 },
    { header: 'companyProductGroup', key: 'companyProductGroup', width: 20 },
    { header: 'companyEmail', key: 'companyEmail', width: 25 },
    { header: 'contactPersonName', key: 'companyContactPersonName', width: 20 },
    { header: 'website', key: 'companyWebsite', width: 20 },
    { header: 'country', key: 'companyCountry', width: 15 },
    { header: 'address', key: 'companyAddress', width: 30 },
    { header: 'companyPhone', key: 'companyPhone', width: 15 },
    { header: 'contactPersonPhone', key: 'companyContactPersonPhone', width: 15 },
    { header: 'notes', key: 'companyNotes', width: 30 },
    { header: 'procurementTeam', key: 'hasProcurementTeam', width: 15 },
  ];

  // Process data to match the keys
  const dataForExport = companies.map((company) => {
    return {
      companyName: company.companyName,
      companyProductGroup: Array.isArray(company.companyProductGroup)
        ? company.companyProductGroup.join(", ")
        : company.companyProductGroup,
      companyEmail: company.companyEmail,
      companyContactPersonName: company.companyContactPersonName,
      companyWebsite: company.companyWebsite,
      companyCountry: company.companyCountry,
      companyAddress: company.companyAddress,
      companyPhone: company.companyPhone,
      companyContactPersonPhone: company.companyContactPersonPhone,
      companyNotes: company.companyNotes,
      // Format hasProcurementTeam as TRUE/FALSE
      hasProcurementTeam: company.hasProcurementTeam ? "TRUE" : "FALSE",
    };
  });

  // Add rows
  worksheet.addRows(dataForExport);

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
