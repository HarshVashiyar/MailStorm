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
        email: 'info@techcorp.com',
        contactName: 'Michael Johnson',
      },
      {
        email: 'contact@greenenergy.com',
        contactName: 'David Chen',
      },
    ],
  },
  {
    _id: 'list2',
    listName: 'Marketing Contacts',
    listItems: [
      {
        email: 'hello@digitalmarketingpro.com',
        contactName: 'Sarah Williams',
      },
    ],
  },
];

export const useSavedLists = () => {
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
      // Handle empty response gracefully
      const data = response.data || [];
      setSavedLists(Array.isArray(data) ? data : []);
      setShowSavedListsTable(true);
      setIsUsingDummyData(false);
    } catch (error) {
      console.warn('API call failed, using dummy saved lists:', error);
      setSavedLists(dummySavedLists);
      setShowSavedListsTable(true);
      setIsUsingDummyData(true);
      toast.info('📝 Using demo lists - API unavailable', {
        style: { 
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          color: '#fff'
        }
      });
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

      setSavedLists(prevLists =>
        prevLists.filter(list => list._id !== selectedSavedLists[0])
      );
      setSelectedSavedLists([]);
      toast.success(response.data.message || 'List deleted successfully!');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete the list.'
      );
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
    const newListItems = selectedUsers.map(userId => {
      const user = users.find(user => user._id === userId);
      return {
        email: show ? user.email : user.companyEmail,
        contactName: show ? user.fullName : user.companyContactPersonName,
      };
    });

    if (isUsingDummyData) {
      // Handle locally for demo mode
      setSavedLists(prevLists =>
        prevLists.map(list =>
          list._id === listId
            ? { ...list, listItems: [...list.listItems, ...newListItems] }
            : list
        )
      );
      toast.success('➕ Demo: Items added to list locally', {
        style: { 
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          color: '#fff'
        }
      });
      return true;
    }

    const existingList = savedLists.find(list => list._id === listId);
    const combinedListItems = existingList 
      ? [...existingList.listItems, ...newListItems]
      : newListItems;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_LIST_ROUTE}`,
        { id: listId, listItems: combinedListItems },
        {
          withCredentials: true
        }
      );

      setSavedLists(prevLists =>
        prevLists.map(list =>
          list._id === listId
            ? { ...list, listItems: combinedListItems }
            : list
        )
      );

      toast.success(
        response.data.message || 'Items added to the list successfully!'
      );
      return true;
    } catch (error) {
      console.error('Error adding items to the list:', error);
      toast.error(
        error.response?.data?.message || 'Failed to add items to the list.'
      );
      return false;
    }
  };

  // Create new list
  const createNewList = async (listName, listItems) => {
    if (!listName.trim()) {
      toast.error('⚠️ List name cannot be empty!');
      return false;
    }

    if (listItems.length === 0) {
      toast.error('⚠️ No valid emails to save in the list!');
      return false;
    }

    const listData = {
      listName: listName.trim(),
      listItems: listItems.filter(item => item.email && item.email.trim()),
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
      const newList = response.data.list;
      setSavedLists(prevLists => [...prevLists, newList]);

      toast.success(response.data.message || 'List added successfully!');
      return true;
    } catch (error) {
      console.error('Error saving the list:', error);
      toast.error(error.response?.data?.message || 'Failed to save the list.');
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
    createNewList,
    mailSavedList,
  };
};