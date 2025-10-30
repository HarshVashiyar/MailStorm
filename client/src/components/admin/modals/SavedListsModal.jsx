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

const SavedListsModal = ({
  showSavedListsTable,
  savedLists,
  selectedSavedLists,
  toggleSavedListSelection,
  toggleManualListForm,
  deleteSavedList,
  mailSavedList,
  handleScheduleEmail,
  addToExistingList,
  closeSavedListsTable,
  selectedUsersCount = 0,
}) => {
  if (!showSavedListsTable) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 pt-24"
      style={{ zIndex: 1050 }}
    >
      <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-6xl border border-orange-500/20 max-h-[85vh] overflow-hidden flex flex-col animate-glow">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <MdFolder className="text-orange-400 text-4xl" />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Saved Email Lists
            </span>
          </h3>
          <p className="text-gray-300 text-sm">
            Manage your saved email lists and perform bulk actions
          </p>
        </div>

        {/* Action Buttons - Fixed Height Container */}
        <div className="h-20 mb-6 flex items-start">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleManualListForm}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 border border-orange-400/30 flex items-center space-x-2 text-sm"
            >
              <MdAdd className="text-base" />
              <span>Add New List</span>
            </button>

            {selectedSavedLists.length === 1 && (
              <>
                <button
                  onClick={deleteSavedList}
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
                onClick={addToExistingList}
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
        <div className="flex-1 overflow-auto mb-6">
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
                {savedLists.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 px-6 text-center text-gray-300">
                      <div className="flex flex-col items-center space-y-3">
                        <MdFolder className="text-6xl text-gray-500" />
                        <p className="text-xl font-medium">No saved lists found</p>
                        <p className="text-sm">Create your first email list to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  savedLists.map((list, index) => (
                    <tr 
                      key={list._id || `list-${index}`} 
                      className={`transition-all duration-300 hover:bg-orange-500/5 ${ 
                        list._id && selectedSavedLists.includes(list._id)
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
                        <div className="max-w-xs truncate text-gray-300 text-sm">
                          {list.listItems?.map((item) => item.email).join(', ')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs truncate text-gray-300 text-sm">
                          {list.listItems?.map((item) => item.contactName).join(', ')}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          className={`w-5 h-5 rounded border-2 transition-all duration-300 ${ 
                            list._id && selectedSavedLists.includes(list._id)
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
  );
};

export default SavedListsModal;