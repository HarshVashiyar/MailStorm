import { useState, useEffect } from 'react';
import { MdClose, MdSave, MdLabel, MdEdit, MdDescription } from 'react-icons/md';
import NewPost from '../../NewPost';

const ManualTemplateFormModal = ({
  showManualTemplateForm,
  initialTemplateName = '',
  initialTemplateSubject = '',
  initialTemplateContent = '',
  onSave,
  onClose,
}) => {
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [templateSubject, setTemplateSubject] = useState(initialTemplateSubject);
  const [templateContent, setTemplateContent] = useState(initialTemplateContent);

  // Update state when initial values change
  useEffect(() => {
    setTemplateName(initialTemplateName);
    setTemplateSubject(initialTemplateSubject);
    setTemplateContent(initialTemplateContent);
  }, [initialTemplateName, initialTemplateSubject, initialTemplateContent]);

  if (!showManualTemplateForm) return null;

  const handleSave = async () => {
    const success = await onSave(templateName, templateSubject, templateContent);
    // Only clear form if save was successful
    if (success) {
      setTemplateName('');
      setTemplateSubject('');
      setTemplateContent('');
    }
  };

  const handleClose = () => {
    onClose();
    setTemplateName('');
    setTemplateSubject('');
    setTemplateContent('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24 pb-4 overflow-y-auto"
      style={{ zIndex: 1200 }}
    >
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-5xl border border-orange-500/20 animate-glow my-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3 mb-2">
            <MdLabel className="text-orange-400 text-3xl" />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Create New Template
            </span>
          </h3>
          <p className="text-gray-300 text-sm">
            Create a reusable email template with subject and content
          </p>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {/* Template Name Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3 flex items-center space-x-2">
              <MdLabel className="text-orange-400" />
              <span>Template Name:</span>
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a name for your template..."
              disabled={!!initialTemplateName}
              className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {initialTemplateName && (
              <p className="text-gray-400 text-xs mt-2 flex items-center space-x-1">
                <span>ℹ️</span>
                <span>Template name cannot be changed while editing</span>
              </p>
            )}
          </div>
        
          {/* Template Subject Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3 flex items-center space-x-2">
              <MdEdit className="text-orange-400" />
              <span>Template Subject:</span>
            </label>
            <input
              type="text"
              value={templateSubject}
              onChange={(e) => setTemplateSubject(e.target.value)}
              placeholder="Enter the email subject..."
              className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-inner"
            />
          </div>
        
          {/* Template Content Editor */}
          <div className="mb-8">
            <label className="block text-white font-medium mb-3 flex items-center space-x-2">
              <MdDescription className="text-orange-400" />
              <span>Template Content:</span>
            </label>
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-orange-500/30 overflow-hidden">
              <NewPost setHtml={setTemplateContent} initialContent={templateContent} />
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-6 flex-shrink-0 pt-4 border-t border-orange-500/20">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-700/40 hover:bg-gray-600/40 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 flex items-center justify-center space-x-2"
          >
            <MdClose className="text-lg" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center justify-center space-x-2"
          >
            <MdSave className="text-lg" />
            <span>Save Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualTemplateFormModal;