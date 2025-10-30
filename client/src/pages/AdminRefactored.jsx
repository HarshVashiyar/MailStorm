import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import AddCompany from './AddCompany';
import Email from './Email';
import DummyDataBanner from '../components/admin/DummyDataBanner';
import ActionBar from '../components/admin/ActionBar';
import SelectedItemsActionBar from '../components/admin/SelectedItemsActionBar';
import DataTable from '../components/admin/DataTable';
import ManualListFormModal from '../components/admin/modals/ManualListFormModal';
import SavedListsModal from '../components/admin/modals/SavedListsModal';
import SavedTemplatesModal from '../components/admin/modals/SavedTemplatesModal';
import ManualTemplateFormModal from '../components/admin/modals/ManualTemplateFormModal';

// Hooks
import { useUsers } from '../hooks/useUsers';
import { useSavedLists } from '../hooks/useSavedLists';
import { useSavedTemplates } from '../hooks/useSavedTemplates';

const AdminRefactored = () => {
  const navigate = useNavigate();

  // Custom hooks for state management
  const {
    users,
    setUsers,
    selectedUsers,
    setSelectedUsers,
    show,
    searchTerm,
    setSearchTerm,
    filteredUsers,
    isUsingDummyData,
    toggleView,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    deleteSelectedUsers,
    updateUserNote,
    fetchUsers,
  } = useUsers();

  const {
    savedLists,
    selectedSavedLists,
    showSavedListsTable,
    fetchSavedLists,
    toggleSavedListSelection,
    closeSavedListsTable,
    deleteSavedList,
    addToExistingList,
    createNewList,
    mailSavedList,
  } = useSavedLists();

  const {
    savedTemplates,
    selectedSavedTemplates,
    showSavedTemplatesTable,
    showManualTemplateForm,
    editingTemplate,
    fetchSavedTemplates,
    toggleSavedTemplateSelection,
    closeSavedTemplatesTable,
    toggleManualTemplateForm,
    editSavedTemplate,
    saveTemplate,
    deleteSavedTemplate,
    closeManualTemplateForm,
  } = useSavedTemplates();

  // Modal states
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [updateCompany, setUpdateCompany] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [mState, setMState] = useState(true);
  const [showManualListForm, setShowManualListForm] = useState(false);
  const [prefilledEmails, setPrefilledEmails] = useState('');
  const [prefilledListName, setPrefilledListName] = useState('');
  const [prefilledContactNames, setPrefilledContactNames] = useState('');

  // Modal handlers
  const toggleMState = () => {
    setMState((prev) => !prev);
  };

  const openAddCompanyModal = () => {
    setShowAddCompanyModal(true);
  };

  const closeAddCompanyModal = () => {
    setShowAddCompanyModal(false);
    setUpdateCompany(false);
  };

  const handleUpdateCompany = () => {
    setUpdateCompany(true);
    openAddCompanyModal();
  };

  const closeEmailForm = () => {
    setShowEmailForm(false);
    setSchedule(false);
  };

  // Email handlers
  const mailSelectedUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error('⚠️ No users selected!');
      return;
    }
    setShowEmailForm(true);
  };

  const handleScheduleEmail = async () => {
    setSchedule(true);
    setShowEmailForm(true);
  };

  const handleMailSavedList = () => {
    const list = mailSavedList();
    if (list) {
      setShowEmailForm(true);
    }
  };

  // List management handlers
  const handleSaveList = () => {
    const listItems = selectedUsers.map((userId) => {
      const user = users.find((user) => user._id === userId);
      return {
        email: show ? user.email : user.companyEmail,
        contactName: show ? user.fullName : user.companyContactPersonName,
      };
    });

    // Pre-fill the modal with selected emails and contact names
    const emailString = listItems.map((item) => item.email).join(', ');
    const contactNamesString = listItems.map((item) => item.contactName || '').join(', ');
    const suggestedListName = `${show ? 'Users' : 'Companies'} List - ${new Date().toLocaleDateString()}`;
    
    setPrefilledEmails(emailString);
    setPrefilledContactNames(contactNamesString);
    setPrefilledListName(suggestedListName);
    setShowManualListForm(true);
  };

  const handleAddToExistingList = async () => {
    const success = await addToExistingList(users, selectedUsers, show);
    if (success) {
      setSelectedUsers([]);
    }
  };

  const handleCreateNewList = async (listName, typedEmail, contactNames = '') => {
    const emails = typedEmail.split(',').map(email => email.trim()).filter(email => email);
    const names = contactNames.split(',').map(name => name.trim());
    
    const listItems = emails.map((email, index) => {
      // First try to get contact name from the provided names array
      let contactName = names[index] || '';
      
      // If no name provided, try to find from existing users
      if (!contactName) {
        const user = users.find(
          (user) => (show ? user.email : user.companyEmail) === email
        );
        contactName = user ? (show ? user.fullName : user.companyContactPersonName) : '';
      }
      
      return {
        email: email,
        contactName: contactName,
      };
    });

    const success = await createNewList(listName, listItems);
    if (success) {
      setShowManualListForm(false);
      setPrefilledEmails('');
      setPrefilledListName('');
      setPrefilledContactNames('');
      setSelectedUsers([]);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const goToScheduled = () => {
    navigate('/Scheduled');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent"></div>
      
      {/* Scrollable Content */}
      <div className="absolute inset-0 top-20 overflow-auto">
        {/* Dummy Data Banner */}
        <DummyDataBanner isVisible={isUsingDummyData} onRefresh={handleRefresh} />

        {/* Compact Header */}
        <div className="px-6 py-3 bg-glass-dark/50 backdrop-blur-lg border-b border-primary-500/20">
          {/* Dashboard Title - Compact */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
                ⚡ Admin Dashboard
              </h1>
              <p className="text-gray-300 text-xs">
                Manage your {show ? 'users' : 'companies'} with powerful tools
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-glow animate-glow">
                {filteredUsers.length} {show ? 'Users' : 'Companies'}
              </div>
              <div className="bg-gradient-to-r from-accent-500 to-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-glow">
                {selectedUsers.length} Selected
              </div>
            </div>
          </div>

          {/* Action Buttons - Dark Glow Theme */}
          <div className="bg-glass-dark backdrop-blur-lg rounded-2xl border border-primary-500/30 p-3 shadow-glow">
            <ActionBar
              show={show}
              toggleView={toggleView}
              fetchSavedLists={fetchSavedLists}
              goToScheduled={goToScheduled}
              fetchSavedTemplates={fetchSavedTemplates}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              users={users}
            />
          </div>

          {/* Add Button & Selected Items Action Bar - Fixed Height Container */}
          <div className="h-20 mt-2">
            <div className="flex flex-wrap gap-2 items-start">
              {/* Add Button - Always visible, matches wrapper height */}
              <button
                onClick={openAddCompanyModal}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-400/30 flex items-center justify-center space-x-2 text-sm min-h-[52px]"
              >
                <span className="text-lg">➕</span>
                <span className="font-semibold">Add {show ? 'User' : 'Company'}</span>
              </button>
              
              {/* Action buttons - Only visible when items are selected */}
              {selectedUsers.length > 0 && (
                <SelectedItemsActionBar
                  selectedUsers={selectedUsers}
                  show={show}
                  handleUpdateCompany={handleUpdateCompany}
                  deleteSelectedUsers={deleteSelectedUsers}
                  mailSelectedUsers={mailSelectedUsers}
                  handleScheduleEmail={handleScheduleEmail}
                  handleSaveList={handleSaveList}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Enhanced Table */}
        <div className="p-6 pb-20">
          <DataTable
            filteredUsers={filteredUsers}
            show={show}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
            selectAllUsers={selectAllUsers}
            updateUserNote={updateUserNote}
            openAddCompanyModal={openAddCompanyModal}
            searchTerm={searchTerm}
          />
        </div>
      </div>

      {/* Modals */}
      {showAddCompanyModal && (
        <AddCompany
          upd={updateCompany}
          users={users}
          setUsers={setUsers}
          selectedUsers={selectedUsers[0]}
          setSelectedUsers={setSelectedUsers}
          closeForm={closeAddCompanyModal}
        />
      )}

      {(showEmailForm || schedule) && (
        <Email
          closeForm={closeEmailForm}
          show={show}
          users={users}
          selectedUsers={selectedUsers}
          savedLists={savedLists}
          selectedSavedLists={selectedSavedLists}
          schedule={schedule}
          mState={mState}
        />
      )}

      <SavedListsModal
        showSavedListsTable={showSavedListsTable}
        savedLists={savedLists}
        selectedSavedLists={selectedSavedLists}
        toggleSavedListSelection={toggleSavedListSelection}
        toggleManualListForm={() => setShowManualListForm(true)}
        deleteSavedList={deleteSavedList}
        mailSavedList={handleMailSavedList}
        handleScheduleEmail={handleScheduleEmail}
        addToExistingList={handleAddToExistingList}
        closeSavedListsTable={closeSavedListsTable}
        selectedUsersCount={selectedUsers.length}
      />

      <ManualListFormModal
        showManualListForm={showManualListForm}
        initialListName={prefilledListName}
        initialTypedEmail={prefilledEmails}
        onSave={handleCreateNewList}
        initialContactNames={prefilledContactNames}
        onClose={() => {
          setShowManualListForm(false);
          setPrefilledEmails('');
          setPrefilledListName('');
          setPrefilledContactNames('');
        }}
      />

      <SavedTemplatesModal
        showSavedTemplatesTable={showSavedTemplatesTable}
        savedTemplates={savedTemplates}
        selectedSavedTemplates={selectedSavedTemplates}
        toggleSavedTemplateSelection={toggleSavedTemplateSelection}
        toggleManualTemplateForm={toggleManualTemplateForm}
        editSavedTemplate={editSavedTemplate}
        deleteSavedTemplate={deleteSavedTemplate}
        closeSavedTemplatesTable={closeSavedTemplatesTable}
      />

      <ManualTemplateFormModal
        showManualTemplateForm={showManualTemplateForm}
        initialTemplateName={editingTemplate?.templateName || ''}
        initialTemplateSubject={editingTemplate?.templateSubject || ''}
        initialTemplateContent={editingTemplate?.templateContent || ''}
        onSave={saveTemplate}
        onClose={closeManualTemplateForm}
      />
    </div>
  );
};

export default AdminRefactored;