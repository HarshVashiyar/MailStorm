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
    <div className="bg-gradient-to-r from-primary-600/90 via-accent-600/90 to-primary-600/90 backdrop-blur-lg px-2 rounded-md shadow-sm border border-white/10 h-9 flex items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center justify-center bg-white/8 backdrop-blur-sm w-28 h-full rounded-md border border-white/10 px-2" title={`${selectedUsers.length} selected`} aria-label={`${selectedUsers.length} selected`}>
          <span className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <span className="text-white font-medium text-xs">{selectedUsers.length} Selected</span>
          </span>
        </div>
        
        {!show && selectedUsers.length === 1 && (
          <button
            onClick={handleUpdateCompany}
            className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white w-20 h-full rounded-md text-xs font-medium transition-colors duration-150 shadow-sm border border-yellow-400/20 flex items-center justify-center"
          >
            <span className="inline-flex items-center gap-1">
              <span className="text-sm">✏️</span>
              <span>Edit</span>
            </span>
          </button>
        )}
        
        <button
          onClick={deleteSelectedUsers}
          className="group bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white w-20 h-full rounded-md text-xs font-medium transition-colors duration-150 shadow-sm border border-red-400/20 flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">🗑️</span>
            <span>Delete</span>
          </span>
        </button>
        
        <button
          onClick={mailSelectedUsers}
          className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white w-20 h-full rounded-md text-xs font-medium transition-colors duration-150 shadow-sm border border-blue-400/20 flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">📧</span>
            <span>Mail</span>
          </span>
        </button>
        
        <button
          onClick={handleScheduleEmail}
          className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white w-20 h-full rounded-md text-xs font-medium transition-colors duration-150 shadow-sm border border-purple-400/20 flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">📅</span>
            <span>Schedule</span>
          </span>
        </button>
        
        <button
          onClick={handleSaveList}
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white w-20 h-full rounded-md text-xs font-medium transition-colors duration-150 shadow-sm border border-emerald-400/20 flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1">
            <span className="text-sm">📋</span>
            <span>New List</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default SelectedItemsActionBar;
