import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ListsContext = createContext(null);

export const ListsProvider = ({ children }) => {
    const [savedLists, setSavedLists] = useState([]);
    const [selectedLists, setSelectedLists] = useState([]);
    const [showListsTable, setShowListsTable] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch all saved lists
    const fetchLists = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_LISTS_ROUTE}`,
                { withCredentials: true }
            );

            if (response.data?.success) {
                const data = response.data.data || [];
                setSavedLists(Array.isArray(data) ? data : []);
                setShowListsTable(true);
            } else {
                toast.error(response.data?.message || "Failed to fetch lists");
            }
        } catch (error) {
            console.error('Error fetching lists:', error);
            toast.error(error.response?.data?.message || "Failed to fetch lists");
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new list
    const createList = useCallback(async (listName, listItems, companyIds = []) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_LIST_ROUTE}`,
                { listName, listItems, companyIds },
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'List created successfully!');
                await fetchLists(); // Refresh lists
                return true;
            } else {
                toast.error(response.data?.message || "Failed to create list");
                return false;
            }
        } catch (error) {
            console.error('Error creating list:', error);
            toast.error(error.response?.data?.message || "Failed to create list");
            return false;
        }
    }, [fetchLists]);

    // Delete list(s)
    const deleteList = useCallback(async (listId) => {
        const ids = Array.isArray(listId) ? listId : [listId];

        if (!listId || ids.length === 0) {
            toast.error('⚠️ No list selected to delete!');
            return false;
        }

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_LISTS_ROUTE}`,
                {
                    data: { listIds: ids },
                    withCredentials: true
                }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'List deleted successfully!');
                setSavedLists(prev => prev.filter(list => !ids.includes(list._id)));
                setSelectedLists(prev => prev.filter(id => !ids.includes(id)));
                return true;
            } else {
                toast.error(response.data?.message || "Failed to delete list");
                return false;
            }
        } catch (error) {
            console.error('Error deleting list:', error);
            toast.error(error.response?.data?.message || "Failed to delete list");
            return false;
        }
    }, []);

    // Add items to existing list
    const addToList = useCallback(async (listId, items) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_ITEMS_TO_LIST_ROUTE}`,
                { id: listId, listItems: items },
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Items added to list!');
                await fetchLists(); // Refresh lists
                return true;
            } else {
                toast.error(response.data?.message || "Failed to add items");
                return false;
            }
        } catch (error) {
            console.error('Error adding to list:', error);
            toast.error(error.response?.data?.message || "Failed to add items");
            return false;
        }
    }, [fetchLists]);

    // Remove items from list
    const removeFromList = useCallback(async (listId, itemIds) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_ITEMS_FROM_LIST_ROUTE}`,
                { listId, itemIds },
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Items removed from list!');
                await fetchLists(); // Refresh lists
                return true;
            } else {
                toast.error(response.data?.message || "Failed to remove items");
                return false;
            }
        } catch (error) {
            console.error('Error removing from list:', error);
            toast.error(error.response?.data?.message || "Failed to remove items");
            return false;
        }
    }, [fetchLists]);

    // Toggle list selection
    const toggleListSelection = useCallback((listId) => {
        setSelectedLists(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    }, []);

    // Open/close lists table
    const openListsTable = useCallback(() => setShowListsTable(true), []);
    const closeListsTable = useCallback(() => {
        setShowListsTable(false);
        setSelectedLists([]);
    }, []);

    const value = useMemo(() => ({
        savedLists,
        selectedLists,
        showListsTable,
        loading,
        fetchLists,
        createList,
        deleteList,
        addToList,
        removeFromList,
        toggleListSelection,
        openListsTable,
        closeListsTable,
    }), [
        savedLists,
        selectedLists,
        showListsTable,
        loading,
        fetchLists,
        createList,
        deleteList,
        addToList,
        removeFromList,
        toggleListSelection,
        openListsTable,
        closeListsTable,
    ]);

    return (
        <ListsContext.Provider value={value}>
            {children}
        </ListsContext.Provider>
    );
};

export const useLists = () => {
    const context = useContext(ListsContext);
    if (!context) throw new Error('useLists must be used within ListsProvider');
    return context;
};
