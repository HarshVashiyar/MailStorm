import { useState, useMemo, useRef, useCallback, lazy, Suspense, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

// 🚀 PERFORMANCE: Lazy load modals to reduce initial bundle size
const AddCompanyModal = lazy(() => import('../components/modals/AddCompanyModal'));
const EmailModal = lazy(() => import('../components/modals/EmailModal'));
const DeliveryLogModal = lazy(() => import('../components/modals/DeliveryLogModal'));
const ManualListFormModal = lazy(() => import('../components/admin/modals/ManualListFormModal'));
const SavedListsModal = lazy(() => import('../components/admin/modals/SavedListsModal'));
const SavedTemplatesModal = lazy(() => import('../components/admin/modals/SavedTemplatesModal'));
const ManualTemplateFormModal = lazy(() => import('../components/admin/modals/ManualTemplateFormModal'));
const ScheduledEmailsModal = lazy(() => import('../components/admin/modals/ScheduledEmailsModal').then(module => ({ default: module.default })));

// Eager load components used immediately
import ActionBar from '../components/admin/ActionBar';
import SelectedItemsActionBar from '../components/admin/SelectedItemsActionBar';
import DataTable from '../components/admin/DataTable';
import { DataTableSkeleton } from '../components/SkeletonLoaders';

// ✅ Context providers - mount locally in this component
import { UserProvider, useUserContext } from '../context/UserContext';
import { ListsProvider, useLists } from '../context/ListsContext';
import { useTemplates } from '../context/TemplatesContext';

// Lazy load hook
import { useScheduledEmailsModal } from '../components/admin/modals/ScheduledEmailsModal';

// ✅ Inner component that uses the contexts
const AdminContent = () => {
  // 🎯 Use contexts
  const {
    users: contextUsers,
    companies: contextCompanies,
    allUsers,
    allCompanies,
    currentView,
    setCurrentView,
    loading,
    refresh,
    fetchCompanies,
    fetchUsers,
    currentPagination,
    goToPage,
    deleteCompanies,
    suspendUsers,
    unsuspendUsers,
    toggleSkipUnsubscribed,
  } = useUserContext();

  // ✅ Fetch companies on mount
  useEffect(() => {
    // console.log('AdminRefactored: Fetching initial data...');
    fetchCompanies();
  }, [fetchCompanies]);

  // Local UI state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProcurement, setFilterProcurement] = useState(false);


  // Derived state
  const show = currentView === 'users';
  // Paged slice from context — used for display and individual row lookups
  const users = show ? contextUsers : contextCompanies;
  // Full dataset — used for cross-page search so filtering isn't constrained to the current page
  const allCurrentData = show ? allUsers : allCompanies;

  // Memoized filtered dataset — searches across ALL records regardless of current page
  const filteredUsers = useMemo(() => {
    return (allCurrentData || []).filter((user) => {
      if (!user) return false;

      const searchFields = show
        ? [
          user.fullName,
          user.email,
          user.name,
          user.userName,
          user.username,
          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        ]
        : [
          user.companyName,
          user.companyContactPersonName,
          user.companyAddress,
          user.companyCountry,
          user.companyEmail,
          user.companyPhone,
          user.companyContactPersonPhone,
          user.companyWebsite,
          ...(user.companyProductGroup || []),
        ];

      const keywords = Array.isArray(searchTerm)
        ? searchTerm.map(k => String(k).trim().toLowerCase()).filter(Boolean)
        : String(searchTerm || '').split(/\s+/).map(k => k.trim().toLowerCase()).filter(Boolean);

      if (!searchTerm && !filterProcurement) return true;

      if (!show && filterProcurement) {
        const hasProcurement = Boolean(
          user.hasProcurementTeam ?? user.procurementTeam ?? user.procurement ?? user.hasProcurement
        );
        if (!hasProcurement) return false;
      }

      if (show && filterProcurement) {
        if (user.role !== 'Admin') return false;
      }

      const haystack = searchFields
        .filter(Boolean)
        .map(f => String(f).toLowerCase())
        .join(' ');

      return keywords.every(k => haystack.includes(k));
    });
  }, [allCurrentData, searchTerm, show, filterProcurement]);

  // Compute search-aware pagination from filtered total
  // (currentPagination from context is based on raw total; this respects search results)
  const filteredPagination = useMemo(() => {
    const limit = currentPagination?.limit || 20;
    const page = currentPagination?.page || 1;
    const totalItems = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    return {
      page: safePage,
      limit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    };
  }, [filteredUsers.length, currentPagination]);

  // Slice filteredUsers to the current page — this is what DataTable actually renders
  const pagedFilteredUsers = useMemo(() => {
    const { page, limit } = filteredPagination;
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, filteredPagination]);

  // Actions
  // Track if we've fetched users at least once (local to this component)
  const hasFetchedUsersRef = useRef(false);

  const toggleView = useCallback(() => {
    const newView = currentView === 'users' ? 'companies' : 'users';
    setCurrentView(newView);
    setSelectedUsers([]);
    // Only fetch users the first time we switch to that view
    if (newView === 'users' && !hasFetchedUsersRef.current) {
      hasFetchedUsersRef.current = true;
      fetchUsers();
    }
  }, [currentView, setCurrentView, fetchUsers]);

  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback((userList) => {
    if (Array.isArray(userList)) {
      setSelectedUsers(userList.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const deleteSelectedUsers = useCallback(async () => {
    if (show) {
      try {
        const response = await api.users.delete(selectedUsers);
        if (response.data?.success === true) {
          await refresh();
          setSelectedUsers([]);
          toast.success(response.data.message);
        } else {
          toast.error(response.data?.message || "Update failed.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    } else {
      const result = await deleteCompanies(selectedUsers);
      if (result?.success) {
        setSelectedUsers([]);
        toast.success(result.message);
      } else {
        toast.error(result?.message || 'Failed to delete companies');
      }
    }
  }, [show, selectedUsers, refresh, deleteCompanies]);

  const suspendSelectedUsers = useCallback(async () => {
    if (!show) {
      toast.error("Suspend is only available for users, not companies.");
      return;
    }

    const reason = "Violation of Terms of Services or Privacy Policy";
    const result = await suspendUsers(selectedUsers, reason);

    if (result.success) {
      setSelectedUsers([]);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }, [show, selectedUsers, suspendUsers]);

  const unsuspendSelectedUsers = useCallback(async () => {
    if (!show) {
      return;
    }

    const result = await unsuspendUsers(selectedUsers);

    if (result.success) {
      setSelectedUsers([]);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }, [show, selectedUsers, unsuspendUsers]);

  const updateUserNote = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const { isOpen: isScheduledModalOpen, openModal: openScheduledModal, closeModal: closeScheduledModal } = useScheduledEmailsModal();

  // Lists Context
  const {
    savedLists,
    allLists: allSavedLists,       // Full dataset for cross-page lookups
    selectedLists: selectedSavedLists,
    showListsTable: showSavedListsTable,
    fetchLists: fetchSavedLists,
    toggleListSelection: toggleSavedListSelection,
    closeListsTable: closeSavedListsTable,
    deleteList: deleteSavedList,
    addToList: addToExistingList,
    removeFromList: removeItemsFromList,
    createList: createNewList,
    openListsTable: openSavedListsTable,
    pagination: listsPagination,
    goToPage: listsGoToPage,
    searchTerm: listsSearchTerm,
    setSearchTerm: setListsSearchTerm,
  } = useLists();

  // Templates Context
  const {
    templates: savedTemplates,
    allTemplates: allSavedTemplates,  // Full dataset for cross-page lookups
    selectedTemplates: selectedSavedTemplates,
    showTemplatesTable: showSavedTemplatesTable,
    fetchTemplates: fetchSavedTemplates,
    toggleTemplateSelection: toggleSavedTemplateSelection,
    closeTemplatesTable: closeSavedTemplatesTable,
    deleteTemplate: deleteSavedTemplate,
    createTemplate,
    updateTemplate,
    pagination: templatesPagination,
    goToPage: templatesGoToPage,
    searchTerm: templatesSearchTerm,
    setSearchTerm: setTemplatesSearchTerm,
  } = useTemplates();

  // Modal states
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [updateCompany, setUpdateCompany] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [mState, setMState] = useState(true);
  const [showManualListForm, setShowManualListForm] = useState(false);
  const [showManualTemplateForm, setShowManualTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDeliveryLog, setShowDeliveryLog] = useState(false);

  const [prefilledEmails, setPrefilledEmails] = useState('');
  const [prefilledListName, setPrefilledListName] = useState('');
  const [prefilledContactNames, setPrefilledContactNames] = useState('');

  // Re-implement mailSavedList locally since it was in the hook
  const mailSavedList = useCallback(() => {
    if (selectedSavedLists.length !== 1) {
      toast.error('⚠️ Select exactly one list to mail!');
      return null;
    }

    // Search across ALL lists (not just current page's slice)
    const list = allSavedLists.find(l => l._id === selectedSavedLists[0]);
    if (!list) return null;

    if (!list.listItems || list.listItems.length === 0) {
      toast.error('⚠️ The selected list is empty!');
      return null;
    }

    return list;
  }, [selectedSavedLists, savedLists]);

  // Template handlers
  const toggleManualTemplateForm = useCallback(() => {
    setEditingTemplate(null);
    setShowManualTemplateForm(true);
  }, []);

  const closeManualTemplateForm = useCallback(() => {
    setShowManualTemplateForm(false);
    setEditingTemplate(null);
  }, []);

  const editSavedTemplate = useCallback(async () => {
    if (selectedSavedTemplates.length !== 1) {
      toast.error('⚠️ Select exactly one template to edit!');
      return;
    }

    const templateName = selectedSavedTemplates[0];
    const template = savedTemplates.find(t => t.templateName === templateName);

    if (template) {
      console.log('Editing template:', template);
      setEditingTemplate(template);
      setShowManualTemplateForm(true);
    } else {
      toast.error("Template not found");
    }
  }, [selectedSavedTemplates, savedTemplates]);

  const saveTemplateHandler = useCallback(async (name, subject, content) => {
    const data = {
      templateName: name,
      templateSubject: subject,
      templateContent: content
    };

    let success;
    if (editingTemplate) {
      success = await updateTemplate(editingTemplate.templateName, data);
    } else {
      success = await createTemplate(data);
    }

    if (success) {
      closeManualTemplateForm();
    }
  }, [editingTemplate, updateTemplate, createTemplate, closeManualTemplateForm]);

  // Wrap deleteSavedList to refresh users after deletion
  const handleDeleteSavedList = async (listIds) => {
    const success = await deleteSavedList(listIds);
    if (success) {
      await refresh();
    }
    return success;
  };

  // Wrap removeItemsFromList to refresh users after editing
  const handleRemoveItemsFromList = async (listId, itemIds) => {
    const success = await removeItemsFromList(listId, itemIds);
    if (success) {
      await refresh();
    }
    return success;
  };

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

    const emailString = listItems.map((item) => item.email).join(', ');
    const contactNamesString = listItems.map((item) => item.contactName || '').join(', ');
    const suggestedListName = `${show ? 'Users' : 'Companies'} List - ${new Date().toLocaleDateString()}`;

    setPrefilledEmails(emailString);
    setPrefilledContactNames(contactNamesString);
    setPrefilledListName(suggestedListName);
    setShowManualListForm(true);
  };

  const handleAddToExistingList = async (listId) => {
    if (!listId) {
      toast.error('⚠️ No list selected!');
      return;
    }

    // Search across ALL lists (not just current page's slice)
    const targetList = allSavedLists.find(list => list._id === listId);
    if (!targetList) {
      toast.error('⚠️ List not found!');
      return;
    }

    const existingCompanyIds = new Set(
      targetList.listItems?.map(item => item.company?._id || item.company) || []
    );

    const items = selectedUsers.map((userId) => {
      const user = users.find((u) => u._id === userId);
      if (!user) return null;

      return {
        company: user._id,
        contactEmail: show ? user.email : user.companyEmail,
        contactName: show ? user.fullName : user.companyContactPersonName,
      };
    }).filter(Boolean);

    const newItems = items.filter(item => !existingCompanyIds.has(item.company));
    const skippedCount = items.length - newItems.length;

    if (skippedCount > 0) {
      toast.info(`ℹ️ ${skippedCount} item(s) already in list, skipped!`);
    }

    if (newItems.length === 0) {
      toast.error('⚠️ All selected items are already in the list!');
      return;
    }

    const success = await addToExistingList(listId, newItems);
    if (success) {
      await refresh();
      setSelectedUsers([]);
    }
  };

  const handleCreateNewList = async (listName, typedEmail, contactNames = '') => {
    const emails = typedEmail.split(',').map(email => email.trim()).filter(email => email);
    const names = contactNames.split(',').map(name => name.trim());

    const listItems = [];
    const missingEmails = [];

    emails.forEach((email, index) => {
      let contactName = names[index] || '';

      const user = users.find(
        (user) => (show ? user.email : user.companyEmail) === email
      );

      if (user) {
        if (!contactName) {
          contactName = show ? user.fullName : user.companyContactPersonName;
        }

        listItems.push({
          company: user._id,
          contactEmail: email,
          contactName: contactName || '',
        });
      } else {
        missingEmails.push(email);
      }
    });

    if (missingEmails.length > 0) {
      toast.warn(`Skipped ${missingEmails.length} emails not found in database: ${missingEmails.slice(0, 2).join(', ')}...`);
    }

    if (listItems.length === 0) {
      toast.error('⚠️ No valid items found to save!');
      return;
    }

    console.log('Creating List with items:', listItems);

    const success = await createNewList(listName, listItems, []);
    if (success) {
      await refresh();
      clearSelection();
      setShowManualListForm(false);
      setPrefilledEmails('');
      setPrefilledListName('');
      setPrefilledContactNames('');
      setSelectedUsers([]);
    }
  };

  // ✅ Show skeleton while loading initial data
  if (loading && users.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="absolute inset-0 top-20 overflow-auto">
          <div className="px-6 py-3 bg-glass-dark/50 backdrop-blur-lg border-b border-primary-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
                  ⚡ Dashboard
                </h1>
                <p className="text-gray-300 text-xs">
                  Loading your data...
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 pb-20">
            <DataTableSkeleton show={show} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 z-10">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Scrollable Content */}
      <div className="absolute inset-0 top-20 overflow-auto">
        {/* Compact Header */}
        <div className="px-6 py-3 bg-glass-dark/50 backdrop-blur-lg border-b border-primary-500/20">
          {/* Dashboard Title - Compact */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
                ⚡ Dashboard
              </h1>
              <p className="text-gray-300 text-xs">
                Manage your {show ? 'users' : 'companies'} with powerful tools
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-glow animate-glow">
                {pagedFilteredUsers.length === filteredUsers.length
                  ? `${filteredUsers.length} ${show ? 'Users' : 'Companies'}`
                  : `${pagedFilteredUsers.length} of ${filteredUsers.length} ${show ? 'Users' : 'Companies'}`}
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
              onScheduledClick={openScheduledModal}
              onDeliveryLogClick={() => setShowDeliveryLog(true)}
              fetchSavedTemplates={fetchSavedTemplates}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterProcurement={filterProcurement}
              setFilterProcurement={setFilterProcurement}
              users={users}
            />
          </div>

          {/* Add Button & Selected Items Action Bar - Compact Container */}
          <div className="h-10 mt-1">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Add Button - Only visible for companies (when show is false) */}
              {!show && (
                <button
                  onClick={openAddCompanyModal}
                  aria-label="Add Company"
                  title="Add Company"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-9 w-20 rounded-md font-medium transition-colors duration-150 transform hover:scale-105 shadow-sm border border-emerald-400/20 flex items-center justify-center gap-1 text-xs ml-2"
                >
                  <span className="text-sm">➕</span>
                  <span className="font-semibold">Add</span>
                </button>
              )}

              {/* Action buttons - Only visible when items are selected */}
              {selectedUsers.length > 0 && (
                <SelectedItemsActionBar
                  selectedUsers={selectedUsers}
                  show={show}
                  handleUpdateCompany={handleUpdateCompany}
                  deleteSelectedUsers={deleteSelectedUsers}
                  suspendSelectedUsers={suspendSelectedUsers}
                  unsuspendSelectedUsers={unsuspendSelectedUsers}
                  mailSelectedUsers={mailSelectedUsers}
                  handleScheduleEmail={handleScheduleEmail}
                  handleSaveList={handleSaveList}
                  users={contextUsers}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Enhanced Table */}
        <div className="p-4 pb-20">
          <DataTable
            filteredUsers={pagedFilteredUsers}
            allFilteredUsers={filteredUsers}
            show={show}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
            selectAllUsers={selectAllUsers}
            updateUserNote={updateUserNote}
            openAddCompanyModal={openAddCompanyModal}
            searchTerm={searchTerm}
            pagination={filteredPagination}
            onPageChange={goToPage}
            onToggleSkipUnsubscribed={toggleSkipUnsubscribed}
          />
        </div>
      </div>

      {/* Modals */}
      {showAddCompanyModal && (
        <Suspense fallback={<div />}>
          <AddCompanyModal
            closeModal={closeAddCompanyModal}
            upd={updateCompany}
            setUpdateCompany={setUpdateCompany}
            refreshUsers={refresh}
            users={users}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
          />
        </Suspense>
      )}

      {(showEmailForm || schedule) && (
        <Suspense fallback={<div />}>
          <EmailModal
            closeForm={closeEmailForm}
            show={show}
            users={users}
            selectedUsers={selectedUsers}
            savedLists={savedLists}
            selectedSavedLists={selectedSavedLists}
            schedule={schedule}
            mState={mState}
          />
        </Suspense>
      )}

      {/* 🚀 PERFORMANCE: Suspense boundary for lazy-loaded modals */}
      <Suspense fallback={<div />}>
        <SavedListsModal
          refetchUsers={refresh}
          showSavedListsTable={showSavedListsTable}
          savedLists={savedLists}
          selectedSavedLists={selectedSavedLists}
          toggleSavedListSelection={toggleSavedListSelection}
          toggleManualListForm={() => setShowManualListForm(true)}
          deleteSavedList={handleDeleteSavedList}
          mailSavedList={handleMailSavedList}
          handleScheduleEmail={handleScheduleEmail}
          addToExistingList={handleAddToExistingList}
          removeItemsFromList={handleRemoveItemsFromList}
          closeSavedListsTable={closeSavedListsTable}
          selectedUsersCount={selectedUsers.length}
          pagination={listsPagination}
          onPageChange={listsGoToPage}
          searchTerm={listsSearchTerm}
          setSearchTerm={setListsSearchTerm}
          allListsCount={allSavedLists.length}
        />

        <ManualListFormModal
          showManualListForm={showManualListForm}
          initialListName={prefilledListName}
          initialTypedEmail={prefilledEmails}
          companyIds={selectedUsers}
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
          pagination={templatesPagination}
          onPageChange={templatesGoToPage}
          searchTerm={templatesSearchTerm}
          setSearchTerm={setTemplatesSearchTerm}
          allTemplatesCount={allSavedTemplates.length}
        />

        <ManualTemplateFormModal
          showManualTemplateForm={showManualTemplateForm}
          initialTemplateName={editingTemplate?.templateName || ''}
          initialTemplateSubject={editingTemplate?.templateSubject || ''}
          initialTemplateContent={editingTemplate?.templateContent || ''}
          onSave={saveTemplateHandler}
          onClose={closeManualTemplateForm}
        />

        <ScheduledEmailsModal
          isOpen={isScheduledModalOpen}
          onClose={closeScheduledModal}
        />

        {showDeliveryLog && (
          <DeliveryLogModal onClose={() => setShowDeliveryLog(false)} />
        )}
      </Suspense>
    </div>
  );
};

// ✅ Wrapper component that provides UserProvider and ListsProvider locally
const AdminRefactored = () => {
  return (
    <UserProvider>
      <ListsProvider>
        <AdminContent />
      </ListsProvider>
    </UserProvider>
  );
};

export default AdminRefactored;