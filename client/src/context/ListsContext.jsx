import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ListsContext = createContext(null);

const LISTS_LIMIT = 5;

// Compute pagination descriptor from a filtered list
const buildPagination = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

export const ListsProvider = ({ children }) => {
    const [allLists, setAllLists] = useState([]); // Full dataset from server
    const [selectedLists, setSelectedLists] = useState([]);
    const [showListsTable, setShowListsTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // Lifted from modal for cross-page search

    // Fetch ALL lists from the server at once
    const fetchLists = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_LISTS_ROUTE}`,
                { withCredentials: true }
            );

            if (response.data?.success) {
                const data = response.data.data || [];
                setAllLists(Array.isArray(data) ? data : []);
                setCurrentPage(1); // Reset to first page on fresh fetch
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

    // Client-side page navigation — no re-fetch
    const goToPage = useCallback((page) => {
        setCurrentPage(page);
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
                await fetchLists(); // Re-fetch all; page resets to 1
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

    // Delete list(s) — optimistic update on in-memory data
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
                setAllLists(prev => prev.filter(list => !ids.includes(list._id)));
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
                await fetchLists();
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
                await fetchLists();
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

    const toggleListSelection = useCallback((listId) => {
        setSelectedLists(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    }, []);

    const openListsTable = useCallback(() => setShowListsTable(true), []);
    const closeListsTable = useCallback(() => {
        setShowListsTable(false);
        setSelectedLists([]);
        setSearchTerm('');
    }, []);

    // ── Search + pagination entirely client-side ──────────────────────────────

    // 1. Filter across ALL lists (not just the current page slice)
    const filteredAllLists = useMemo(() => {
        if (!searchTerm) return allLists;
        const lower = searchTerm.toLowerCase();
        return allLists.filter(list => {
            const emails = list.listItems?.map(item => item.contactEmail || item.email || '').join(', ').toLowerCase() || '';
            const contacts = list.listItems?.map(item => item.contactName || '').join(', ').toLowerCase() || '';
            return (
                list.listName.toLowerCase().includes(lower) ||
                emails.includes(lower) ||
                contacts.includes(lower)
            );
        });
    }, [allLists, searchTerm]);

    // 2. When search changes, reset to page 1
    const handleSetSearchTerm = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    // 3. Pagination descriptor reflects filtered count
    const pagination = useMemo(() =>
        buildPagination(filteredAllLists.length, currentPage, LISTS_LIMIT),
        [filteredAllLists.length, currentPage]
    );

    // 4. Current-page slice of the filtered results
    const savedLists = useMemo(() => {
        const start = (currentPage - 1) * LISTS_LIMIT;
        return filteredAllLists.slice(start, start + LISTS_LIMIT);
    }, [filteredAllLists, currentPage]);

    const value = useMemo(() => ({
        savedLists,         // Current page's slice (already filtered)
        allLists,           // Full unfiltered dataset (for cross-page lookups)
        selectedLists,
        showListsTable,
        loading,
        pagination,
        searchTerm,
        setSearchTerm: handleSetSearchTerm,
        fetchLists,
        goToPage,
        createList,
        deleteList,
        addToList,
        removeFromList,
        toggleListSelection,
        openListsTable,
        closeListsTable,
    }), [
        savedLists,
        allLists,
        selectedLists,
        showListsTable,
        loading,
        pagination,
        searchTerm,
        handleSetSearchTerm,
        fetchLists,
        goToPage,
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
