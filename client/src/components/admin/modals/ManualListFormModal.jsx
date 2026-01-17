import { useState, useEffect } from 'react';
import { MdClose, MdSave, MdLabel, MdEmail, MdPerson } from 'react-icons/md';

const ManualListFormModal = ({
  showManualListForm,
  initialListName = '',
  initialTypedEmail = '',
  initialContactNames = '',
  initialListItems = [],
  onSave,
  onClose,
}) => {
  const [listName, setListName] = useState(initialListName);
  const [typedEmail, setTypedEmail] = useState(initialTypedEmail);
  const [contactNames, setContactNames] = useState(initialContactNames);
  const [listItems, setListItems] = useState([]);
  const [removedCompanyIds, setRemovedCompanyIds] = useState([]);

  // Update state when initial values change
  useEffect(() => {
    if (!showManualListForm) return;

    setListName(initialListName);
    setTypedEmail(initialTypedEmail);
    setContactNames(initialContactNames);
    setListItems(initialListItems);
    setRemovedCompanyIds([]);
  }, [showManualListForm]);
  if (!showManualListForm) return null;

  const handleSave = async () => {
    const success = await onSave(
      listName,
      typedEmail,
      contactNames,
      removedCompanyIds
    );
    // Only clear form if save was successful
    if (success) {
      setListName('');
      setTypedEmail('');
      setContactNames('');
    }
  };

  const handleClose = () => {
    onClose();
    setListName('');
    setTypedEmail('');
    setContactNames('');
  };

  const emailArray = typedEmail.split(',').map(email => email.trim()).filter(email => email);
  const contactNamesArray = contactNames.split(',').map(name => name.trim()).filter(name => name);

  const handleRemoveEmail = (indexToRemove) => {
    const removedItem = listItems[indexToRemove];
    if (removedItem?.company?._id) {
      setRemovedCompanyIds(prev => [...prev, removedItem.company._id]);
    }

    const updatedItems = listItems.filter((_, i) => i !== indexToRemove);
    setListItems(updatedItems);

    setTypedEmail(updatedItems.map(i => i.contactEmail).join(', '));
    setContactNames(updatedItems.map(i => i.contactName).join(', '));
  };

  const handleRemoveContactName = (indexToRemove) => {
    const updatedEmails = emailArray.filter((_, index) => index !== indexToRemove);
    const updatedContacts = contactNamesArray.filter((_, index) => index !== indexToRemove);

    setTypedEmail(updatedEmails.join(', '));
    setContactNames(updatedContacts.join(', '));
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24 pb-4 overflow-y-auto"
      style={{ zIndex: 1200 }}
    >
      <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-2xl border border-orange-500/20 animate-glow my-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3 mb-2">
            <MdLabel className="text-orange-400 text-3xl" />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Create New List
            </span>
          </h3>
          <p className="text-gray-300 text-sm">
            Save your selected items as a reusable email list
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {/* List Name Input */}
          <div className="mb-6">
            <label className="text-white font-medium mb-3 flex items-center space-x-2">
              <MdLabel className="text-orange-400" />
              <span>List Name:</span>
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter a name for your list..."
              className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Emails Input */}
          <div className="mb-6">
            <label className="text-white font-medium mb-3 flex items-center space-x-2">
              <MdEmail className="text-orange-400" />
              <span>Emails:</span>
            </label>
            {/* <textarea
            value={typedEmail}
            onChange={(e) => setTypedEmail(e.target.value)}
            placeholder="Enter email addresses separated by commas..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none shadow-inner"
          /> */}

            {/* Email Chips Display */}
            {emailArray.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {emailArray.map((email, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 rounded-full px-4 py-2 flex items-center gap-3 group hover:border-orange-500 transition-all duration-200"
                  >
                    <span className="text-white text-sm font-medium">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(index)}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-200 ml-1"
                      title="Remove email"
                    >
                      {emailArray.length > 1 && <MdClose className="text-lg" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-orange-300 text-xs mt-2 flex items-center space-x-2">
              <MdEmail className="text-sm" />
              <span>{emailArray.length} email(s) ready to save</span>
            </p>
          </div>

          <div className="mb-8">
            <label className="text-white font-medium mb-3 flex items-center space-x-2">
              <MdPerson className="text-orange-400" />
              <span>Contact Names:</span>
            </label>
            {/* <textarea
            value={contactNames}
            onChange={(e) => setContactNames(e.target.value)}
            placeholder="Enter contact names separated by commas (should match email order)..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none shadow-inner"
          /> */}

            {/* Contact Names Chips Display */}
            {contactNamesArray.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {contactNamesArray.map((name, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-full px-4 py-2 flex items-center gap-3 group hover:border-blue-500 transition-all duration-200"
                  >
                    <span className="text-white text-sm font-medium">{name}</span>
                    <button
                      onClick={() => handleRemoveContactName(index)}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-200 ml-1"
                      title="Remove contact name"
                    >
                      {contactNamesArray.length > 1 && <MdClose className="text-lg" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-gray-400 text-xs mt-2 flex items-center space-x-2">
              <MdPerson className="text-sm" />
              <span>Names should be in the same order as emails above</span>
            </p>
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
            <span>Save List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualListFormModal;