const SelectedItemsActionBar = ({
  selectedUsers,
  show,
  handleUpdateCompany,
  deleteSelectedUsers,
  mailSelectedUsers,
  handleScheduleEmail,
  handleSaveList,
}) => {
  return (
    <div className="bg-gradient-to-r from-primary-600/90 via-accent-600/90 to-primary-600/90 backdrop-blur-lg p-3 rounded-2xl shadow-2xl border border-white/20">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
          <span className="text-2xl">⚡</span>
          <span className="text-white font-semibold text-sm">
            {selectedUsers.length} selected
          </span>
        </div>
        
        {!show && selectedUsers.length === 1 && (
          <button
            onClick={handleUpdateCompany}
            className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-yellow-400/30 hover:shadow-yellow-500/50"
          >
            <span className="flex items-center space-x-1.5">
              <span className="text-base">✏️</span>
              <span>Edit</span>
            </span>
          </button>
        )}
        
        <button
          onClick={deleteSelectedUsers}
          className="group bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-400/30 hover:shadow-red-500/50"
        >
          <span className="flex items-center space-x-1.5">
            <span className="text-base">🗑️</span>
            <span>Delete</span>
          </span>
        </button>
        
        <button
          onClick={mailSelectedUsers}
          className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 hover:shadow-blue-500/50"
        >
          <span className="flex items-center space-x-1.5">
            <span className="text-base">📧</span>
            <span>Mail</span>
          </span>
        </button>
        
        <button
          onClick={handleScheduleEmail}
          className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-400/30 hover:shadow-purple-500/50"
        >
          <span className="flex items-center space-x-1.5">
            <span className="text-base">📅</span>
            <span>Schedule</span>
          </span>
        </button>
        
        <button
          onClick={handleSaveList}
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-emerald-400/30 hover:shadow-emerald-500/50"
        >
          <span className="flex items-center space-x-1.5">
            <span className="text-base">📋</span>
            <span>Save List</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default SelectedItemsActionBar;
