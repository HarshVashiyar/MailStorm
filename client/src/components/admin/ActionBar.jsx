import { useState, useEffect } from 'react';
import { exportCompaniesToExcel } from '../../utils/exportCompanies';

const ActionBar = ({
  show,
  toggleView,
  fetchSavedLists,
  onScheduledClick,
  fetchSavedTemplates,
  searchTerm,
  setSearchTerm,
  filterProcurement,
  setFilterProcurement,
  users,
}) => {
  const parseKeywords = (str) =>
    String(str || '')
      .split(/\s+/)
      .map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : String(s).trim().toLowerCase()))
      .filter(Boolean)
      .join(' ');

  const displayValue = Array.isArray(searchTerm) ? searchTerm.join(' ') : (searchTerm ?? '');

  // Local input state preserves spaces/typing while we still update the normalized parent state
  const [localSearch, setLocalSearch] = useState(displayValue);

  useEffect(() => {
    setLocalSearch(displayValue);
  }, [displayValue]);

  const handleSearchChange = (e) => {
    const raw = e.target.value;
    setLocalSearch(raw); // preserve what user types (including spaces)
    const keywords = parseKeywords(raw); // normalize for parent
    setSearchTerm(keywords.length ? keywords : '');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2">
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

        <button
          onClick={fetchSavedLists}
          className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-accent-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">📁</div>
            <div className="text-xs font-medium whitespace-nowrap">Lists</div>
          </div>
        </button>

        <button
          onClick={onScheduledClick}
          className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">⏰</div>
            <div className="text-xs font-medium whitespace-nowrap">Scheduled</div>
          </div>
        </button>

        <button
          onClick={fetchSavedTemplates}
          className="group bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex-1 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-orange-400/30"
        >
          <div className="text-center">
            <div className="text-lg mb-0.5">📝</div>
            <div className="text-xs font-medium whitespace-nowrap">Templates</div>
          </div>
        </button>

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

      <div className="w-1/4">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search... (separate keywords with space)"
            className="flex-1 pl-3 pr-3 py-2 bg-gray-900 backdrop-blur-sm border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm"
          />

          <button
            onClick={() => setFilterProcurement && setFilterProcurement((v) => !v)}
            title={filterProcurement ? 'Filter: Procurement only' : 'Show all companies'}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 text-xl ${filterProcurement ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-amber-300'} border border-amber-400/20`}
          >
            {filterProcurement ? '★' : '☆'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
