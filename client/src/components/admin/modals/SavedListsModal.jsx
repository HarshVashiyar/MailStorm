import { useState } from 'react';
import {
  MdClose,
  MdAdd,
  MdDelete,
  MdEmail,
  MdSchedule,
  MdAttachFile,
  MdFolder,
  MdGroup,
  MdCheckCircle
} from 'react-icons/md';
import ManualListFormModal from './ManualListFormModal';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SavedListsModal = ({
  refetchUsers,
  showSavedListsTable,
  savedLists,
  selectedSavedLists,
  toggleSavedListSelection,
  toggleManualListForm,
  deleteSavedList,
  mailSavedList,
  handleScheduleEmail,
  addToExistingList,
  removeItemsFromList,
  closeSavedListsTable,
  selectedUsersCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  if (!showSavedListsTable) return null;

  const handleEditListSave = async (listName, typedEmail, contactNames, removedCompanyIds) => {
    console.log("Editing list with removedCompanyIds:", removedCompanyIds);
    try {
      const selectedListId = selectedSavedLists[0];
      const selectedList = savedLists.find((list) => list._id === selectedListId);

      if (!selectedList) {
        toast.error('List not found');
        return false;
      }

      // Call the removeItemsFromList function
      const success = await removeItemsFromList(selectedListId, removedCompanyIds);

      if (success) {
        setShowEditForm(false);
      }
      return success;
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
      return false;
    }
  };

  // Filter lists based on search term
  const filteredLists = savedLists.filter((list) => {
    const searchLower = searchTerm.toLowerCase();
    const emails = list.listItems?.map((item) => item.email).join(', ').toLowerCase() || '';
    const contacts = list.listItems?.map((item) => item.contactName).join(', ').toLowerCase() || '';
    return (
      list.listName.toLowerCase().includes(searchLower) ||
      emails.includes(searchLower) ||
      contacts.includes(searchLower)
    );
  });

  return (
    <>
      <ManualListFormModal
        showManualListForm={showEditForm}
        initialListName={selectedSavedLists.length === 1 ? savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || '' : ''}
        initialTypedEmail={selectedSavedLists.length === 1 ? savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listItems.map(item => item.contactEmail).join(', ') || '' : ''}
        onSave={handleEditListSave}
        initialContactNames={selectedSavedLists.length === 1 ? savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listItems.map(item => item.contactName).join(', ') || '' : ''}
        initialListItems={
          selectedSavedLists.length === 1
            ? savedLists.find(l => l._id === selectedSavedLists[0])?.listItems || []
            : []
        }
        onClose={() => {
          setShowEditForm(false);
        }}
      />

      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 pt-24"
        style={{ zIndex: 1050 }}
      >
        <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-6xl border border-orange-500/20 max-h-[85vh] overflow-hidden flex flex-col animate-glow">
          {/* Header with Search Bar */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
                <MdFolder className="text-orange-400 text-4xl" />
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Saved Lists
                </span>
              </h3>
              <p className="text-gray-300 text-sm">
                Manage your saved lists and perform bulk actions
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
                  className="w-full pl-3 pr-3 py-2 bg-gray-900 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed Height Container */}
          <div className="h-20 mb-2 flex items-start">
            <div className="flex flex-wrap gap-2">
              {/* <button
                onClick={() => { }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 border border-orange-400/30 flex items-center space-x-2 text-sm"
              >
                <MdAdd className="text-base" />
                <span>Add New List</span>
              </button> */}

              {selectedSavedLists.length === 1 && (
                <>
                  <button
                    onClick={() => deleteSavedList(selectedSavedLists)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 border border-red-400/30 flex items-center space-x-2 text-sm max-w-[140px]"
                    title={`Delete "${savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed'}"`}
                  >
                    <MdDelete className="text-base flex-shrink-0" />
                    <span className="truncate">Delete "{
                      (() => {
                        const listName = savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed';
                        return listName.length > 8 ? listName.slice(0, 8) + '...' : listName;
                      })()
                    }"</span>
                  </button>

                  <button
                    onClick={() => setShowEditForm(true)}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 border border-yellow-400/30 flex items-center space-x-2 text-sm max-w-[140px]"
                    title={`Edit "${savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed'}"`}
                  >
                    <span className="truncate">✏️ Edit "{
                      (() => {
                        const listName = savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed';
                        return listName.length > 6 ? listName.slice(0, 6) + '...' : listName;
                      })()
                    }"</span>
                  </button>

                  <button
                    onClick={mailSavedList}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/30 flex items-center space-x-2 text-sm max-w-[140px]"
                    title={`Mail "${savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed'}"`}
                  >
                    <MdEmail className="text-base flex-shrink-0" />
                    <span className="truncate">Mail "{
                      (() => {
                        const listName = savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed';
                        return listName.length > 8 ? listName.slice(0, 8) + '...' : listName;
                      })()
                    }"</span>
                  </button>

                  <button
                    onClick={handleScheduleEmail}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/30 flex items-center space-x-2 text-sm max-w-[140px]"
                    title={`Schedule "${savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed'}"`}
                  >
                    <MdSchedule className="text-base flex-shrink-0" />
                    <span className="truncate">Schedule "{
                      (() => {
                        const listName = savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed';
                        return listName.length > 6 ? listName.slice(0, 6) + '...' : listName;
                      })()
                    }"</span>
                  </button>
                </>
              )}

              {selectedSavedLists.length === 1 && selectedUsersCount > 0 && (
                <button
                  onClick={() => addToExistingList(selectedSavedLists[0])}
                  className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 border border-teal-400/30 flex items-center space-x-2 text-sm max-w-[140px]"
                  title={`Add ${selectedUsersCount} item(s) to "${savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed'}"`}
                >
                  <MdAttachFile className="text-base flex-shrink-0" />
                  <span className="truncate">Add to "{
                    (() => {
                      const listName = savedLists.find((list) => list._id && list._id === selectedSavedLists[0])?.listName || 'Unnamed';
                      return listName.length > 8 ? listName.slice(0, 8) + '...' : listName;
                    })()
                  }"</span>
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
                        <MdFolder className="text-orange-400" />
                        <span>List Name</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left font-semibold">
                      <div className="flex items-center space-x-2">
                        <MdEmail className="text-orange-400" />
                        <span>Emails</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left font-semibold">
                      <div className="flex items-center space-x-2">
                        <MdGroup className="text-orange-400" />
                        <span>Contacts</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center font-semibold">
                      <div className="flex items-center justify-center space-x-2">
                        <MdCheckCircle className="text-orange-400" />
                        <span>Select</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-500/10">
                  {filteredLists.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 px-6 text-center text-gray-300">
                        <div className="flex flex-col items-center space-y-3">
                          <MdFolder className="text-6xl text-gray-500" />
                          <p className="text-xl font-medium">{savedLists.length === 0 ? 'No saved lists found' : 'No Results Found'}</p>
                          <p className="text-sm">{savedLists.length === 0 ? 'Create your first email list to get started' : 'Try adjusting your search'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLists.map((list, index) => (
                      <tr
                        key={list._id || `list-${index}`}
                        className={`transition-all duration-300 hover:bg-orange-500/5 ${list._id && selectedSavedLists.includes(list._id)
                          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-l-4 border-orange-400 shadow-lg shadow-orange-500/10'
                          : index % 2 === 0 ? 'bg-gray-800/20' : 'bg-transparent'
                          }`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-orange-300 text-lg">{list.listName}</div>
                          <div className="text-sm text-gray-400 flex items-center space-x-1 mt-1">
                            <MdGroup className="text-xs" />
                            <span>{list.listItems?.length || 0} contacts</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div
                            className="max-w-xs truncate text-gray-300 text-sm cursor-help"
                            title={list.listItems?.map((item) => item.contactEmail).join(', ')}
                          >
                            {list.listItems?.slice(0, 2).map((item) => item.contactEmail).join(', ')}
                            {list.listItems?.length > 2 && <span className="text-orange-400 ml-1">+{list.listItems.length - 2} more</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div
                            className="max-w-xs truncate text-gray-300 text-sm cursor-help"
                            title={list.listItems?.map((item) => item.contactName).join(', ')}
                          >
                            {list.listItems?.slice(0, 2).map((item) => item.contactName).join(', ')}
                            {list.listItems?.length > 2 && <span className="text-orange-400 ml-1">+{list.listItems.length - 2} more</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            className={`w-5 h-5 rounded border-2 transition-all duration-300 ${list._id && selectedSavedLists.includes(list._id)
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-orange-400/50 hover:border-orange-400 bg-gray-800/60'
                              }`}
                            checked={list._id ? selectedSavedLists.includes(list._id) : false}
                            onChange={() => list._id && toggleSavedListSelection(list._id)}
                            disabled={!list._id}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <button
              onClick={closeSavedListsTable}
              className="bg-gray-700/40 hover:bg-gray-600/40 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2"
            >
              <MdClose className="text-lg" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedListsModal;