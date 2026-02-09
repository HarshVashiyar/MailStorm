import { useState, useEffect, useMemo, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import { exportCompaniesToExcel } from '../../services/exportCompanies';

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
  const debounceTimer = useRef(null);

  useEffect(() => {
    setLocalSearch(displayValue);
  }, [displayValue]);

  const handleSearchChange = (e) => {
    const raw = e.target.value;
    setLocalSearch(raw); // preserve what user types (including spaces) - instant feedback

    // Debounce the parent state update to reduce CPU usage
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const keywords = parseKeywords(raw); // normalize for parent
      setSearchTerm(keywords.length ? keywords : '');
    }, 300); // 300ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <button
          onClick={toggleView}
          className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white inline-flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 border border-primary-400/20 text-sm"
        >
          <span className="text-sm">{show ? '🏢' : '👥'}</span>
          <span className="font-medium whitespace-nowrap">{show ? 'Companies' : 'Users'}</span>
        </button>

        {!show && (
          <button
            onClick={fetchSavedLists}
            className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white inline-flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 border border-accent-400/20 text-sm"
          >
            <span className="text-sm">📁</span>
            <span className="font-medium whitespace-nowrap">Lists</span>
          </button>
        )}

        <button
          onClick={onScheduledClick}
          className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white inline-flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 border border-purple-400/20 text-sm"
        >
          <span className="text-sm">⏰</span>
          <span className="font-medium whitespace-nowrap">Scheduled</span>
        </button>

        <button
          onClick={fetchSavedTemplates}
          className="group bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white inline-flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 border border-orange-400/20 text-sm"
        >
          <span className="text-sm">📝</span>
          <span className="font-medium whitespace-nowrap">Templates</span>
        </button>

        <button
          onClick={() => exportCompaniesToExcel(users)}
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white inline-flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 transform hover:scale-105 border border-emerald-400/20 text-sm"
        >
          <span className="text-sm">📊</span>
          <span className="font-medium whitespace-nowrap">Export</span>
        </button>
      </div>

      <div className="ml-auto w-80 flex-shrink-0">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search (space-separated keywords)"
              className="w-full pl-3 pr-10 py-2 bg-gray-900 backdrop-blur-sm border border-primary-500/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSearchTerm('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 text-xl z-10 cursor-pointer"
                title="Clear search"
              >
                <MdClose />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterProcurement && setFilterProcurement((v) => !v)}
            title={filterProcurement ? 'Filter: Procurement only' : 'Show all companies'}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-200 text-lg ${filterProcurement ? 'bg-amber-400 text-gray-900' : 'bg-gray-800 text-amber-300'} border border-amber-400/20 ml-2`}
          >
            {filterProcurement ? '★' : '☆'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
