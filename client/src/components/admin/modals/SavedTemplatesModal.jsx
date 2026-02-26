import {
  MdClose,
  MdAdd,
  MdDelete,
  MdEdit,
  MdDescription,
  MdCheckCircle
} from 'react-icons/md';
import InlinePagination from '../../common/InlinePagination';

const SavedTemplatesModal = ({
  showSavedTemplatesTable,
  savedTemplates,
  selectedSavedTemplates,
  toggleSavedTemplateSelection,
  selectAllTemplates,     // fn(templateArray) — selects all given; fn([]) clears
  allTemplatesData = [], // full unfiltered template array for cross-page select
  toggleManualTemplateForm,
  editSavedTemplate,
  deleteSavedTemplate,
  closeSavedTemplatesTable,
  pagination,
  onPageChange,
  // Cross-page search — managed by TemplatesContext
  searchTerm,
  setSearchTerm,
  allTemplatesCount = 0,
}) => {
  if (!showSavedTemplatesTable) return null;

  const allPageSelected = savedTemplates.length > 0 && savedTemplates.every(t => selectedSavedTemplates.includes(t.templateName));
  const allAcrossPagesSelected = allTemplatesData.length > 0 && selectedSavedTemplates.length === allTemplatesData.length;

  const handleSelectAllOnPage = () => {
    if (allPageSelected) {
      const pageNames = savedTemplates.map(t => t.templateName);
      selectAllTemplates(allTemplatesData.filter(t => !pageNames.includes(t.templateName)));
    } else {
      const existing = allTemplatesData.filter(t => selectedSavedTemplates.includes(t.templateName));
      const newOnes = savedTemplates.filter(t => !selectedSavedTemplates.includes(t.templateName));
      selectAllTemplates([...existing, ...newOnes]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 pt-24"
      style={{ zIndex: 1050 }}
    >
      <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-6xl border border-orange-500/20 max-h-[85vh] overflow-hidden flex flex-col animate-glow">
        {/* Header with Search Bar */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
              <MdDescription className="text-orange-400 text-4xl" />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Saved Email Templates
              </span>
              <InlinePagination pagination={pagination} onPageChange={onPageChange} />
            </h3>
            <p className="text-gray-300 text-sm">
              {pagination?.totalItems > 0
                ? `Showing ${savedTemplates.length} of ${pagination.totalItems} templates`
                : 'Manage your saved email templates and perform actions'}
            </p>
          </div>
          {/* Search Bar - Top Right */}
          <div className="w-80">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-3 pr-10 py-2 bg-gray-900 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 text-xl z-10 cursor-pointer"
                  title="Clear search"
                >
                  <MdClose />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed Height Container */}
        <div className="h-20 mb-2 flex items-start">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleManualTemplateForm}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 border border-orange-400/30 flex items-center space-x-2 text-sm"
            >
              <MdAdd className="text-base" />
              <span>Add New Template</span>
            </button>

            {selectedSavedTemplates.length === 1 && (
              <>
                <button
                  onClick={editSavedTemplate}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/30 flex items-center space-x-2 text-sm max-w-[140px]"
                  title={`Edit "${savedTemplates.find((template) => template.templateName === selectedSavedTemplates[0])?.templateName}"`}
                >
                  <MdEdit className="text-base flex-shrink-0" />
                  <span className="truncate">Edit "{
                    (savedTemplates.find((template) => template.templateName === selectedSavedTemplates[0])?.templateName?.length > 8)
                      ? savedTemplates.find((template) => template.templateName === selectedSavedTemplates[0])?.templateName?.slice(0, 8) + '...'
                      : savedTemplates.find((template) => template.templateName === selectedSavedTemplates[0])?.templateName
                  }"</span>
                </button>
              </>
            )}

            {selectedSavedTemplates.length >= 1 && (
              <button
                onClick={() => deleteSavedTemplate(selectedSavedTemplates)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 border border-red-400/30 flex items-center space-x-2 text-sm"
                title={`Delete ${selectedSavedTemplates.length} template(s)`}
              >
                <MdDelete className="text-base flex-shrink-0" />
                <span>Delete {selectedSavedTemplates.length > 1 ? `${selectedSavedTemplates.length} templates` : `"${savedTemplates.find((template) => template.templateName === selectedSavedTemplates[0])?.templateName?.slice(0, 8)}..."`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-auto mb-4">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-orange-500/20 overflow-hidden">
            <table className="w-full text-white">
              <thead className="bg-gradient-to-r from-orange-600/30 to-amber-600/30 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold">
                    <div className="flex items-center space-x-2">
                      <MdDescription className="text-orange-400" />
                      <span>Template Name</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-semibold">
                    <div className="flex items-center space-x-2">
                      <MdEdit className="text-orange-400" />
                      <span>Subject</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center font-semibold">
                    <div className="flex items-center justify-center space-x-2">
                      <MdCheckCircle className="text-orange-400" />
                      <span>Select</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-2 border-orange-400/70 cursor-pointer ml-1"
                        checked={allPageSelected}
                        onChange={handleSelectAllOnPage}
                        title="Select / deselect this page"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-500/10">
                {savedTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 px-6 text-center text-gray-300">
                      <div className="flex flex-col items-center space-y-3">
                        <MdDescription className="text-6xl text-gray-500" />
                        <p className="text-xl font-medium">{allTemplatesCount === 0 ? 'No saved templates found' : 'No Results Found'}</p>
                        <p className="text-sm">{allTemplatesCount === 0 ? 'Create your first email template to get started' : 'Try adjusting your search'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Cross-page select-all banner */}
                    {allPageSelected && allTemplatesData.length > savedTemplates.length && (
                      <tr className="bg-orange-500/10 border-b border-orange-500/20">
                        <td colSpan="3" className="py-2 px-4 text-center text-sm">
                          {allAcrossPagesSelected ? (
                            <span className="text-green-400">
                              All {allTemplatesData.length} templates are selected.{' '}
                              <button onClick={() => selectAllTemplates([])} className="underline text-orange-300 hover:text-white ml-1 cursor-pointer">Clear selection</button>
                            </span>
                          ) : (
                            <span className="text-gray-300">
                              All {savedTemplates.length} templates on this page are selected.{' '}
                              <button onClick={() => selectAllTemplates(allTemplatesData)} className="underline text-orange-300 hover:text-white ml-1 cursor-pointer">
                                Select all {allTemplatesData.length} templates
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                    {savedTemplates.map((template, index) => (
                      <tr
                        key={template.templateName}
                        className={`transition-all duration-300 hover:bg-orange-500/5 ${selectedSavedTemplates.includes(template.templateName)
                          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-l-4 border-orange-400 shadow-lg shadow-orange-500/10'
                          : index % 2 === 0 ? 'bg-gray-800/20' : 'bg-transparent'
                          }`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-orange-300 text-lg">{template.templateName}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-md truncate text-gray-300 text-sm">
                            {template.templateSubject}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            className={`w-5 h-5 rounded border-2 transition-all duration-300 ${selectedSavedTemplates.includes(template.templateName)
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-orange-400/50 hover:border-orange-400 bg-gray-800/60'
                              }`}
                            checked={selectedSavedTemplates.includes(template.templateName)}
                            onChange={() => toggleSavedTemplateSelection(template.templateName)}
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom bar: record count + close */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-400 text-sm">
            {pagination?.totalItems > 0
              ? `Showing ${savedTemplates.length} of ${pagination.totalItems} templates`
              : `${allTemplatesCount} template${allTemplatesCount !== 1 ? 's' : ''} total`}
          </span>
          <button
            onClick={closeSavedTemplatesTable}
            className="bg-gray-700/40 hover:bg-gray-600/40 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2"
          >
            <MdClose className="text-lg" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedTemplatesModal;