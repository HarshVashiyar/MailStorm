import { useState, useEffect, useRef } from 'react';
import NotesModal from '../modals/NotesModal';

const DataTable = ({
  filteredUsers,
  show,
  selectedUsers,
  toggleUserSelection,
  selectAllUsers,
  updateUserNote,
  openAddCompanyModal,
  searchTerm,
}) => {
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState('');
  const [viewNote, setViewNote] = useState(false);
  const userSelectAllRef = useRef(null);
  const companySelectAllRef = useRef(null);

  // Handle indeterminate state for select all checkboxes
  useEffect(() => {
    const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
    const currentRef = show ? userSelectAllRef.current : companySelectAllRef.current;
    
    if (currentRef) {
      currentRef.indeterminate = isIndeterminate;
    }
  }, [selectedUsers.length, filteredUsers.length, show]);

  const handleNote = (id, companyNote) => {
    setNoteId(id);
    setNote(companyNote || '');
    setViewNote(true);
  };

  const closeNote = () => {
    setViewNote(false);
    setNoteId('');
    setNote('');
  };

  const UsersTableHeader = () => (
    <tr>
      <th className="py-2 px-4 text-center w-1/5">Full Name</th>
      {/* <th className="py-2 px-4 text-center w-1/5">Username</th> */}
      <th className="py-2 px-4 text-center w-1/4">Email</th>
      <th className="py-2 px-4 text-center w-1/5">Created</th>
      <th className="py-2 px-4 text-center w-1/5">Updated</th>
      <th className="py-2 px-4 text-center w-16">
        <input
          ref={userSelectAllRef}
          type="checkbox"
          className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
            selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
              ? 'bg-primary-500 border-primary-500 text-white' 
              : selectedUsers.length > 0
              ? 'bg-primary-300 border-primary-300'
              : 'border-primary-400 hover:border-primary-500'
          }`}
          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
          onChange={() => {
            if (selectedUsers.length === filteredUsers.length) {
              selectAllUsers([]);
            } else {
              selectAllUsers(filteredUsers);
            }
          }}
          title={selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
        />
      </th>
    </tr>
  );

  const CompaniesTableHeader = () => (
    <tr>
      <th className="py-2 px-2 text-center w-1/6">Company</th>
      <th className="py-2 px-2 text-center w-1/6">Address</th>
      <th className="py-2 px-2 text-center w-1/6">Email</th>
      <th className="py-2 px-2 text-center w-1/6">Contact</th>
      <th className="py-2 px-2 text-center w-1/6">Products</th>
      <th className="py-2 px-1 text-center w-12">Notes</th>
      <th className="py-2 px-1 text-center w-16">
        <input
          ref={companySelectAllRef}
          type="checkbox"
          className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
            selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
              ? 'bg-primary-500 border-primary-500 text-white' 
              : selectedUsers.length > 0
              ? 'bg-primary-300 border-primary-300'
              : 'border-primary-400 hover:border-primary-500'
          }`}
          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
          onChange={() => {
            if (selectedUsers.length === filteredUsers.length) {
              selectAllUsers([]);
            } else {
              selectAllUsers(filteredUsers);
            }
          }}
          title={selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
        />
      </th>
    </tr>
  );

  const UserRow = ({ user, index, isSelected }) => (
    <tr 
      key={user._id} 
      className={`group transition-all duration-300 hover:bg-primary-500/10 ${
        isSelected 
          ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-l-4 border-primary-400' 
          : index % 2 === 0 ? 'bg-glass-dark/20' : 'bg-transparent'
      }`}
    >
      <td className="py-4 px-4 text-center">
        <div className="truncate font-medium text-white" title={user.fullName}>{user.fullName}</div>
      </td>
      {/* <td className="py-4 px-4 text-center">
        <div className="truncate text-accent-300" title={user.userName}>@{user.userName}</div>
      </td> */}
      <td className="py-4 px-4 text-center">
        <div className="truncate text-gray-300" title={user.email}>{user.email}</div>
      </td>
      <td className="py-4 px-4 text-center text-xs text-gray-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="py-4 px-4 text-center text-xs text-gray-400">
        {new Date(user.updatedAt).toLocaleDateString()}
      </td>
      <td className="py-4 px-4 text-center">
        <input
          type="checkbox"
          className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
            isSelected 
              ? 'bg-primary-500 border-primary-500 text-white' 
              : 'border-gray-400 hover:border-primary-400'
          }`}
          checked={isSelected}
          onChange={() => toggleUserSelection(user._id)}
        />
      </td>
    </tr>
  );

  const CompanyRow = ({ user, index, isSelected }) => (
    <tr 
      key={user._id} 
      className={`group transition-all duration-300 hover:bg-primary-500/10 ${
        isSelected 
          ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-l-4 border-primary-400' 
          : index % 2 === 0 ? 'bg-glass-dark/20' : 'bg-transparent'
      }`}
    >
      <td className="py-4 px-3 text-center">
        <div className="space-y-1">
          <div className="truncate font-semibold text-white" title={user.companyName}>
            {user.companyName}
          </div>
          <div className="truncate text-xs text-accent-300" title={user.companyContactPersonName}>
            👤 {user.companyContactPersonName}
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-center">
        <div className="space-y-1">
          <div className="truncate text-gray-300" title={user.companyAddress}>
            {user.companyAddress}
          </div>
          <div className="truncate text-xs text-gray-400" title={user.companyCountry}>
            🌍 {user.companyCountry}
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-center">
        <div className="truncate text-accent-300 hover:text-accent-200 transition-colors" title={user.companyEmail}>
          {user.companyEmail}
        </div>
      </td>
      <td className="py-4 px-3 text-center">
        <div className="space-y-1">
          <div className="truncate text-gray-300" title={user.companyPhone}>
            📞 {user.companyPhone}
          </div>
          <div className="truncate text-xs text-gray-400" title={user.companyContactPersonPhone}>
            📱 {user.companyContactPersonPhone}
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-center">
        <div className="space-y-1">
          <div className="truncate text-gray-300" title={user.companyProductGroup?.join(', ')}>
            {user.companyProductGroup?.slice(0, 2).join(', ')}
            {user.companyProductGroup?.length > 2 && '...'}
          </div>
          <div>
            <a
              href={user.companyWebsite?.startsWith('http') ? user.companyWebsite : `https://${user.companyWebsite}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-accent-400 hover:text-accent-300 transition-colors hover:underline"
              title={user.companyWebsite}
            >
              <span>🌐</span>
              <span>Visit</span>
            </a>
          </div>
        </div>
      </td>
      <td className="py-4 px-2 text-center">
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleNote(user._id, user.companyNotes)}
            className={`relative w-8 h-8 rounded-lg text-sm transition-all duration-300 transform hover:scale-110 shadow-lg border border-primary-400/30 ${
              user.companyNotes && user.companyNotes.trim() 
                ? 'bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-600 hover:to-primary-700 text-white animate-glow'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
            }`}
            title={user.companyNotes && user.companyNotes.trim() ? 'Edit Notes (Has Content)' : 'Add Notes (Empty)'}
          >
            {user.companyNotes && user.companyNotes.trim() ? (
              <span className="relative">
                📝
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white/50 animate-pulse"></span>
              </span>
            ) : (
              '✏️'
            )}
          </button>
        </div>
      </td>
      <td className="py-4 px-2 text-center">
        <div className="flex justify-center">
          <input
            type="checkbox"
            className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
              isSelected 
                ? 'bg-primary-500 border-primary-500 text-white' 
                : 'border-gray-400 hover:border-primary-400'
            }`}
            checked={isSelected}
            onChange={() => toggleUserSelection(user._id)}
          />
        </div>
      </td>
    </tr>
  );

  const EmptyState = () => (
    <tr>
      <td colSpan={show ? "5" : "7"} className="py-16 px-6 text-center text-gray-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-3xl opacity-50">{show ? '👥' : '🏢'}</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No {show ? 'Users' : 'Companies'} Found
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm 
                ? `No results match "${searchTerm}" - try a different search term`
                : `Your ${show ? 'users' : 'companies'} will appear here once they're added`
              }
            </p>
            {!searchTerm && (
              <button
                onClick={show ? null : openAddCompanyModal}
                className={`bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  show ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={show}
              >
                <span className="flex items-center space-x-2">
                  <span>➕</span>
                  <span>{show ? 'Users auto-register' : 'Add First Company'}</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="bg-glass-dark backdrop-blur-lg rounded-3xl shadow-2xl border border-primary-500/30 overflow-hidden animate-glow">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-4 border-b border-primary-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{show ? '👥' : '🏢'}</span>
              <span>{show ? 'Users' : 'Companies'} Database</span>
            </h3>
            <div className="text-sm text-gray-300">
              {filteredUsers.length} records found
            </div>
          </div>
        </div>
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed bg-transparent text-gray-100">
            <thead className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 backdrop-blur-sm">
              {show ? <UsersTableHeader /> : <CompaniesTableHeader />}
            </thead>
            <tbody className="divide-y divide-primary-500/20">
              {filteredUsers.length === 0 ? (
                <EmptyState />
              ) : (
                filteredUsers.map((user, index) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return show ? (
                    <UserRow key={user._id} user={user} index={index} isSelected={isSelected} />
                  ) : (
                    <CompanyRow key={user._id} user={user} index={index} isSelected={isSelected} />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-3 border-t border-primary-500/20">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Total: {filteredUsers.length} {show ? 'users' : 'companies'}</span>
            <span>Selected: {selectedUsers.length}</span>
          </div>
        </div>
      </div>

      {viewNote && (
        <NotesModal
          user={filteredUsers.find((u) => u._id === noteId)}
          show={show}
          note={note}
          setNote={setNote}
          noteId={noteId}
          closeForm={closeNote}
          updatedNoteInList={updateUserNote}
        />
      )}
    </>
  );
};

export default DataTable;
