import { exportCompaniesToExcel } from '../../utils/exportCompanies';

const ActionBar = ({
  show,
  toggleView,
  fetchSavedLists,
  onScheduledClick,
  fetchSavedTemplates,
  searchTerm,
  setSearchTerm,
  users,
}) => {

  return (
    <div className="flex items-center gap-2">
      {/* Buttons Container - 75% */}
      <div className="flex-1 flex items-center gap-2">
        {/* Toggle View */}
        <button
          onClick={toggleView}
          className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-primary-400/30 animate-glow"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">{show ? '🏢' : '👥'}</div>
            <div className="text-xs font-medium whitespace-nowrap">
              Switch to {show ? 'Companies' : 'Users'}
            </div>
          </div>
        </button>
        
        {/* Saved Lists */}
        <button
          onClick={fetchSavedLists}
          className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-accent-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">📁</div>
            <div className="text-xs font-medium whitespace-nowrap">Lists</div>
          </div>
        </button>
        
        {/* Schedule */}
        <button
          onClick={onScheduledClick}
          className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">⏰</div>
            <div className="text-xs font-medium whitespace-nowrap">Scheduled</div>
          </div>
        </button>

        {/* Templates */}
        <button
          onClick={fetchSavedTemplates}
          className="group bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-orange-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">📝</div>
            <div className="text-xs font-medium whitespace-nowrap">Templates</div>
          </div>
        </button>
        
        {/* Export */}
        <button
          onClick={() => exportCompaniesToExcel(users)}
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-emerald-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">📊</div>
            <div className="text-xs font-medium whitespace-nowrap">Export</div>
          </div>
        </button>
      </div>
      
      {/* Search Input - 25% */}
      <div className="w-1/4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full pl-3 pr-3 py-2 bg-gray-900 backdrop-blur-sm border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
