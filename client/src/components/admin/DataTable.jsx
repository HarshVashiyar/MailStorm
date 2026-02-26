import { useState, useEffect, useRef, useCallback, memo } from 'react';
import NotesModal from '../modals/NotesModal';
import HistoryModal from '../modals/HistoryModal';
import InlinePagination from '../common/InlinePagination';

const ROW_HEIGHT = 64;

const UserRow = memo(({ user, index, isSelected, onToggleSelection }) => {
  const fullName = user?.fullName || user?.full_name || user?.name || 'N/A';
  const email = user?.email || 'N/A';
  const createdAt = user?.createdAt || user?.created_at || new Date().toISOString();
  const updatedAt = user?.updatedAt || user?.updated_at || new Date().toISOString();
  const isSuspended = user?.suspended || false;

  return (
    <tr className={`group transition-all duration-300 hover:bg-primary-500/10 ${isSelected ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-l-4 border-primary-400' : index % 2 === 0 ? 'bg-glass-dark/20' : 'bg-transparent'}`}>
      <td className="py-4 px-4 text-center"><div className="truncate font-medium text-white" title={fullName}>{fullName}</div></td>
      <td className="py-4 px-4 text-center"><div className="truncate text-gray-300" title={email}>{email}</div></td>
      <td className="py-4 px-4 text-center text-xs text-gray-400">{new Date(createdAt).toLocaleDateString()}</td>
      <td className="py-4 px-4 text-center text-xs text-gray-400">{new Date(updatedAt).toLocaleDateString()}</td>
      <td className="py-4 px-4 text-center">
        {isSuspended ? (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">Suspended</span>
        ) : (
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">Active</span>
        )}
      </td>
      <td className="py-4 px-4 text-center">
        <input type="checkbox" className={`w-5 h-5 rounded border-2 transition-all duration-300 ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-400 hover:border-primary-400'}`} checked={isSelected} onChange={() => onToggleSelection(user._id)} title={isSelected ? 'Deselect' : 'Select'} />
      </td>
    </tr>
  );
});

const CompanyRow = memo(({ user, index, isSelected, onToggleSelection, onNote, onHistory }) => {
  const companyName = user?.companyName || user?.company_name || user?.name || 'N/A';
  const companyContactPersonName = user?.companyContactPersonName || user?.contactPersonName || 'N/A';
  const companyAddress = user?.companyAddress || user?.address || 'N/A';
  const companyCountry = user?.companyCountry || user?.country || 'N/A';
  const companyEmail = user?.companyEmail || user?.email || 'N/A';
  const companyPhone = user?.companyPhone || user?.phone || 'N/A';
  const companyProductGroup = user?.companyProductGroup || user?.productGroup || user?.products || [];
  const companyWebsite = user?.companyWebsite || user?.website || '';
  const hasProcurementTeam = user?.hasProcurementTeam || user?.procurementTeam || user?.procurement || false;
  const lists = user?.lists || user?.includedLists || [];
  const companyNotes = user?.companyNotes || user?.notes || '';

  return (
    <tr className={`group transition-all duration-300 hover:bg-primary-500/10 ${isSelected ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-l-4 border-primary-400' : index % 2 === 0 ? 'bg-glass-dark/20' : 'bg-transparent'}`}>
      <td className="py-4 px-3 text-center"><div className="space-y-1"><div className="truncate font-semibold text-white">{companyName}</div><div className="truncate text-xs text-accent-300">👤 {companyContactPersonName}</div></div></td>
      <td className="py-4 px-3 text-center"><div className="space-y-1"><div className="truncate text-gray-300">{companyAddress}</div><div className="truncate text-xs text-gray-400">🌍 {companyCountry}</div></div></td>
      <td className="py-4 px-3 text-center"><div className="truncate text-accent-300">{companyEmail}</div></td>
      <td className="py-4 px-3 text-center"><div className="space-y-1"><div className="truncate text-gray-300">📞 {companyPhone}</div></div></td>
      <td className="py-4 px-3 text-center"><div className="space-y-1"><div className="truncate text-gray-300">{companyProductGroup.slice(0, 2).join(', ')}{companyProductGroup.length > 2 && '...'}</div><div>{companyWebsite && <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-400 hover:underline">🌐 Visit</a>}</div></div></td>
      <td className="py-4 px-3 text-center">{hasProcurementTeam ? '⭐️' : '☆'}</td>
      <td className="py-4 px-3 text-center">{lists.length > 0 ? <span className="cursor-pointer">{lists.length}</span> : <span className="opacity-50">0</span>}</td>
      <td className="py-4 px-2 text-center">
        <button onClick={() => onNote(user._id, companyNotes)} className={`w-8 h-8 rounded-lg text-sm ${companyNotes && companyNotes.trim() ? 'bg-gradient-to-r from-accent-500 to-primary-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} text-white`}>{companyNotes && companyNotes.trim() ? '📝' : '✏️'}</button>
      </td>
      <td className="py-4 px-2 text-center">
        <button onClick={() => onHistory(user._id)} className="w-8 h-8 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white">📧</button>
      </td>
      <td className="py-4 px-2 text-center">
        <input type="checkbox" className={`w-5 h-5 rounded border-2 ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-400 hover:border-primary-400'}`} checked={isSelected} onChange={() => onToggleSelection(user._id)} />
      </td>
    </tr>
  );
});

UserRow.displayName = 'UserRow';
CompanyRow.displayName = 'CompanyRow';

const DataTable = ({ filteredUsers = [], allFilteredUsers = [], show, selectedUsers = [], toggleUserSelection, selectAllUsers, updateUserNote, openAddCompanyModal, searchTerm, pagination, onPageChange }) => {
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState('');
  const [viewNote, setViewNote] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [historyUserId, setHistoryUserId] = useState('');
  const userSelectAllRef = useRef(null);
  const companySelectAllRef = useRef(null);

  useEffect(() => {
    if (!filteredUsers || filteredUsers.length === 0) return;
    // Indeterminate: some (but not all) records across all pages are selected
    const allIds = allFilteredUsers.length > 0 ? allFilteredUsers : filteredUsers;
    const isAllSelected = selectedUsers.length === allIds.length && allIds.length > 0;
    const isIndeterminate = selectedUsers.length > 0 && !isAllSelected;
    const currentRef = show ? userSelectAllRef.current : companySelectAllRef.current;
    if (currentRef) {
      currentRef.indeterminate = isIndeterminate;
      currentRef.checked = isAllSelected;
    }
  }, [selectedUsers.length, filteredUsers?.length, allFilteredUsers?.length, show]);

  const handleNote = useCallback((id, companyNote) => { setNoteId(id); setNote(companyNote || ''); setViewNote(true); }, []);
  const closeNote = useCallback(() => { setViewNote(false); setNoteId(''); setNote(''); }, []);
  const handleHistory = useCallback((userId) => { setHistoryUserId(userId); setViewHistory(true); }, []);
  const closeHistory = useCallback(() => { setViewHistory(false); setHistoryUserId(''); }, []);

  const usersList = filteredUsers || [];
  const itemCount = usersList.length;

  const UsersTableHeader = () => (
    <tr>
      <th className="py-2 px-4 text-center w-1/6">Full Name</th>
      <th className="py-2 px-4 text-center w-1/5">Email</th>
      <th className="py-2 px-4 text-center w-1/6">Created</th>
      <th className="py-2 px-4 text-center w-1/6">Updated</th>
      <th className="py-2 px-4 text-center w-1/6">Status</th>
      <th className="py-2 px-4 text-center w-16"><input ref={userSelectAllRef} type="checkbox" className="w-5 h-5" onChange={() => selectedUsers.length > 0 ? selectAllUsers([]) : selectAllUsers(usersList)} /></th>
    </tr>
  );

  const CompaniesTableHeader = () => (
    <tr>
      <th className="py-3 px-2 text-center w-[12%]">Company</th>
      <th className="py-3 px-2 text-center w-[12%]">Address</th>
      <th className="py-3 px-2 text-center w-[16%]">Email</th>
      <th className="py-3 px-2 text-center w-[14%]">Contact</th>
      <th className="py-3 px-2 text-center w-[16%]">Products</th>
      <th className="py-3 px-2 text-center w-[6%]">Proc</th>
      <th className="py-3 px-2 text-center w-[6%]">Lists</th>
      <th className="py-3 px-1 text-center w-[6%]">Notes</th>
      <th className="py-3 px-2 text-center w-[6%]">History</th>
      <th className="py-3 px-1 text-center w-[6%]"><input ref={companySelectAllRef} type="checkbox" className="w-5 h-5" onChange={() => selectedUsers.length > 0 ? selectAllUsers([]) : selectAllUsers(usersList)} /></th>
    </tr>
  );

  const EmptyState = () => (
    <tr>
      <td colSpan={show ? "6" : "10"} className="py-16 px-6 text-center text-gray-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full flex items-center justify-center"><span className="text-3xl opacity-50">{show ? '👥' : '🏢'}</span></div>
          <div><h3 className="text-lg font-medium text-gray-300 mb-2">No {show ? 'Users' : 'Companies'} Found</h3><p className="text-sm text-gray-400">{searchTerm ? `No results match "${searchTerm}"` : `Your ${show ? 'users' : 'companies'} will appear here`}</p></div>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="bg-glass-dark backdrop-blur-lg rounded-3xl shadow-2xl border border-primary-500/30 overflow-hidden">
        <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-4 border-b border-primary-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{show ? '👥' : '🏢'}</span>
              <span>{show ? 'Users' : 'Companies'} Database</span>
              <InlinePagination pagination={pagination} onPageChange={onPageChange} />
            </h3>
            <div className="text-sm text-gray-300">
              {pagination?.totalItems > 0
                ? `Showing ${itemCount} of ${pagination.totalItems} ${show ? 'users' : 'companies'}`
                : `${itemCount} ${show ? 'users' : 'companies'}`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="w-full table-fixed bg-transparent text-gray-100">
            <thead className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 backdrop-blur-sm sticky top-0 z-10">
              {show ? <UsersTableHeader /> : <CompaniesTableHeader />}
            </thead>
            <tbody className="divide-y divide-primary-500/20">
              {itemCount === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Cross-page select-all banner (Gmail pattern) */}
                  {selectedUsers.length === itemCount && itemCount > 0 && allFilteredUsers.length > itemCount && (
                    <tr className="bg-primary-500/10 border-b border-primary-500/20">
                      <td colSpan={show ? 6 : 10} className="py-2 px-4 text-center text-sm">
                        {selectedUsers.length === allFilteredUsers.length ? (
                          <span className="text-green-400">
                            All {allFilteredUsers.length} {show ? 'users' : 'companies'} are selected.{' '}
                            <button onClick={() => selectAllUsers([])} className="underline text-primary-300 hover:text-white ml-1 cursor-pointer">Clear selection</button>
                          </span>
                        ) : (
                          <span className="text-gray-300">
                            All {itemCount} {show ? 'users' : 'companies'} on this page are selected.{' '}
                            <button
                              onClick={() => selectAllUsers(allFilteredUsers)}
                              className="underline text-primary-300 hover:text-white ml-1 cursor-pointer"
                            >
                              Select all {allFilteredUsers.length} {show ? 'users' : 'companies'}
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                  {usersList.map((user, index) => {
                    if (!user?._id) return null;
                    const isSelected = selectedUsers.includes(user._id);
                    return show ? (
                      <UserRow key={user._id} user={user} index={index} isSelected={isSelected} onToggleSelection={toggleUserSelection} />
                    ) : (
                      <CompanyRow key={user._id} user={user} index={index} isSelected={isSelected} onToggleSelection={toggleUserSelection} onNote={handleNote} onHistory={handleHistory} />
                    );
                  })
                  }
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-3 border-t border-primary-500/20">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>
              {pagination?.totalItems > 0
                ? `Showing ${itemCount} of ${pagination.totalItems} ${show ? 'users' : 'companies'}`
                : `${itemCount} ${show ? 'users' : 'companies'} total`}
              {selectedUsers.length > 0 && ` · ${selectedUsers.length} selected`}
            </span>
            <InlinePagination pagination={pagination} onPageChange={onPageChange} />
          </div>
        </div>
      </div>

      {viewNote && <NotesModal user={usersList.find(u => u._id === noteId)} show={show} note={note} setNote={setNote} noteId={noteId} closeForm={closeNote} updatedNoteInList={updateUserNote} />}
      {viewHistory && <HistoryModal user={usersList.find(u => u._id === historyUserId)} show={viewHistory} close={closeHistory} id={historyUserId} />}
    </>
  );
};

export default DataTable;
