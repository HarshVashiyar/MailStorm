import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Dummy saved lists data
const dummySavedLists = [
  {
    _id: 'list1',
    listName: 'Tech Prospects',
    listItems: [
      {
        contactEmail: 'info@techcorp.com',
        contactName: 'Michael Johnson',
      },
      {
        contactEmail: 'contact@greenenergy.com',
        contactName: 'David Chen',
      },
    ],
  },
  {
    _id: 'list2',
    listName: 'Marketing Contacts',
    listItems: [
      {
        contactEmail: 'hello@digitalmarketingpro.com',
        contactName: 'Sarah Williams',
      },
    ],
  },
];

export const useSavedLists = (refetchUsers) => {
  const [savedLists, setSavedLists] = useState([]);
  const [selectedSavedLists, setSelectedSavedLists] = useState([]);
  const [showSavedListsTable, setShowSavedListsTable] = useState(false);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  // Fetch saved lists from API or use dummy data
  const fetchSavedLists = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_LISTS_ROUTE}`,
        {
          withCredentials: true
        }
      );
      if (response.data?.success === true) {
        const data = response.data.data || [];
        setSavedLists(Array.isArray(data) ? data : []);
        setShowSavedListsTable(true);
        setIsUsingDummyData(false);
      } else {
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // Toggle saved list selection
  const toggleSavedListSelection = (listId) => {
    setSelectedSavedLists(prevSelected =>
      prevSelected.includes(listId)
        ? prevSelected.filter(id => id !== listId)
        : [...prevSelected, listId]
    );
  };

  // Close saved lists table
  const closeSavedListsTable = () => {
    setShowSavedListsTable(false);
    setSelectedSavedLists([]);
  };

  // Delete saved list
  const deleteSavedList = async () => {
    if (selectedSavedLists.length !== 1) {
      toast.error('⚠️ Select exactly one list to delete!');
      return;
    }

    if (isUsingDummyData) {
      // Handle locally for demo mode
      setSavedLists(prevLists =>
        prevLists.filter(list => list._id !== selectedSavedLists[0])
      );
      setSelectedSavedLists([]);
      toast.success('🗑️ Demo: List deleted locally', {
        style: {
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          color: '#fff'
        }
      });
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_LISTS_ROUTE}`,
        {
          data: { listIds: selectedSavedLists[0] },
          withCredentials: true
        }
      );
      if (response.data?.success === true) {
        setSavedLists(prevLists =>
          prevLists.filter(list => list._id !== selectedSavedLists[0])
        );
        setSelectedSavedLists([]);
        toast.success(response.data.message || 'List deleted successfully!');
        refetchUsers();
      } else {
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // Add to existing list
  const addToExistingList = async (users, selectedUsers, show) => {
    if (selectedSavedLists.length !== 1) {
      toast.error('⚠️ Select exactly one list to add items to!');
      return false;
    }

    if (selectedUsers.length === 0) {
      toast.error('⚠️ No items selected from the table!');
      return false;
    }

    const listId = selectedSavedLists[0];

    // Build companies array with IDs and contact info
    const companies = selectedUsers.map(userId => {
      const user = users.find(user => user._id === userId);
      return {
        company: userId, // Company ID
        contactEmail: show ? user.email : user.companyEmail,
        contactName: show ? user.fullName : user.companyContactPersonName,
      };
    });

    if (isUsingDummyData) {
      setSavedLists(prevLists =>
        prevLists.map(list =>
          list._id === listId
            ? { ...list, listItems: [...list.listItems, ...companies] }
            : list
        )
      );
      toast.success('➕ Demo: Items added to list locally');
      return true;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_ITEMS_TO_LIST_ROUTE}`,
        { id: listId, listItems: companies }, // Send company objects with IDs
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        setSavedLists(prevLists =>
          prevLists.map(list =>
            list._id === listId ? response.data.data : list
          )
        );
        toast.success(response.data.message || 'Items added to the list successfully!');
        refetchUsers();
        return true;
      } else {
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const removeItemsFromList = async (listId, itemIds) => {
    if (!listId || !itemIds || itemIds.length === 0) {
      toast.error('⚠️ No items selected to remove!');
      return false;
    }
    
    if (isUsingDummyData) {
      setSavedLists(prevLists =>
        prevLists.map(list =>
          list._id === listId
            ? {
              ...list,
              listItems: list.listItems.filter(item => {
                // Match by _id, company, or contactEmail
                const itemIdentifier = item._id || item.company;
                return !itemIds.includes(itemIdentifier) && !itemIds.includes(item.contactEmail);
              }),
            }
            : list
        )
      );
      toast.success('🗑️ Demo: Items removed from list locally');
      return true;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_ITEMS_FROM_LIST_ROUTE}`,
        { listId, itemIds },
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        setSavedLists(prevLists =>
          prevLists.map(list =>
            list._id === listId ? response.data.data : list
          )
        );
        toast.success(response.data.message || 'Items removed from list successfully!');
        refetchUsers();
        return true;
      } else {
        toast.error(response.data?.message || "Update failed.");
        return false;
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return false;
    }
  };

  // Create new list
  const createNewList = async (listName, listItems, companyIds) => {
    if (!listName.trim()) {
      toast.error('⚠️ List name cannot be empty!');
      return false;
    }

    if (listItems.length === 0) {
      toast.error('⚠️ No valid emails to save in the list!');
      return false;
    }

    const listItemsWithCompanyIds = listItems.map((item, index) => ({
      company: companyIds[index], // Add company ID
      contactEmail: item.email,
      contactName: item.contactName,
    }));

    const listData = {
      listName: listName.trim(),
      listItems: listItemsWithCompanyIds,
    };

    if (isUsingDummyData) {
      // Handle locally for demo mode
      const newList = {
        _id: `demo-list-${Date.now()}`,
        ...listData,
      };
      setSavedLists(prevLists => [...prevLists, newList]);
      toast.success('✨ Demo: List created locally', {
        style: {
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          color: '#fff'
        }
      });
      refetchUsers();
      return true;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_LIST_ROUTE}`,
        listData,
        {
          withCredentials: true
        }
      );
      if (response.data?.success === true) {
        const newList = response.data.data;
        setSavedLists(prevLists => [...prevLists, newList]);

        toast.success(response.data.message || 'List added successfully!');
        return true;
      } else {
        toast.error(response.data?.message || "Update failed.");
        return false;
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return false;
    }
  };

  // Mail saved list
  const mailSavedList = () => {
    if (selectedSavedLists.length !== 1) {
      toast.error('⚠️ Select exactly one list to mail!');
      return null;
    }

    const list = savedLists.find(list => list._id === selectedSavedLists[0]);
    if (!list) {
      toast.error('❌ Selected list not found.');
      return null;
    }

    return list;
  };

  return {
    savedLists,
    setSavedLists,
    selectedSavedLists,
    setSelectedSavedLists,
    showSavedListsTable,
    setShowSavedListsTable,
    isUsingDummyData,
    fetchSavedLists,
    toggleSavedListSelection,
    closeSavedListsTable,
    deleteSavedList,
    addToExistingList,
    removeItemsFromList,
    createNewList,
    mailSavedList,
  };
};