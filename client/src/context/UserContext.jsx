import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

// Helper: compute a pagination descriptor from a full in-memory list
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

export const UserProvider = ({ children }) => {
    // Full datasets (all records from the API)
    const [allUsers, setAllUsers] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
    const [currentView, setCurrentView] = useState('companies');
    const [loading, setLoading] = useState(false);

    // Current page for each view (client-side)
    const [companiesPage, setCompaniesPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);

    const COMPANIES_LIMIT = 20;
    const USERS_LIMIT = 20;

    // ✅ On-demand fetch functions — load ALL data from the server
    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.companies.getAll();
            if (response.data?.success) {
                const data = response.data.data || [];
                setAllCompanies(Array.isArray(data) ? data : []);
                setCompaniesPage(1); // Reset to first page on fresh fetch
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setAllCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.users.getAll();
            if (response.data?.success) {
                const data = response.data.data || [];
                setAllUsers(Array.isArray(data) ? data : []);
                setUsersPage(1); // Reset to first page on fresh fetch
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setAllUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Pagination navigation — just update the page number, no re-fetch
    const goToCompaniesPage = useCallback((page) => {
        setCompaniesPage(page);
    }, []);

    const goToUsersPage = useCallback((page) => {
        setUsersPage(page);
    }, []);

    // Refresh function — re-fetches current view's data
    const refresh = useCallback(async () => {
        setLoading(true);
        if (currentView === 'users') {
            await fetchUsers();
        } else {
            await fetchCompanies();
        }
    }, [currentView, fetchUsers, fetchCompanies]);

    // Helper functions for optimistic updates
    const addCompany = useCallback((company) => {
        setAllCompanies(prev => [company, ...prev]);
    }, []);

    const updateCompany = useCallback((id, updates) => {
        setAllCompanies(prev =>
            prev.map(c => c._id === id ? { ...c, ...updates } : c)
        );
    }, []);

    const deleteCompanies = useCallback(async (ids) => {
        try {
            const response = await api.companies.delete(ids);
            if (response.data?.success) {
                // Optimistically remove from local state after confirmed server deletion
                setAllCompanies(prev => prev.filter(c => !ids.includes(c._id)));
                return { success: true, message: response.data.message || 'Companies deleted successfully' };
            } else {
                return { success: false, message: response.data?.message || 'Failed to delete companies' };
            }
        } catch (error) {
            console.error('Error deleting companies:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to delete companies' };
        }
    }, []);

    const deleteUsers = useCallback((ids) => {
        setAllUsers(prev =>
            prev.filter(u => !ids.includes(u._id))
        );
    }, []);

    const suspendUsers = useCallback(async (userIds, reason) => {
        try {
            const response = await api.users.suspend(userIds, reason);
            if (response.data?.success) {
                await fetchUsers();
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data?.message || 'Suspension failed' };
        } catch (error) {
            console.error('Error suspending users:', error);
            return { success: false, message: error.response?.data?.message || 'Something went wrong' };
        }
    }, [fetchUsers]);

    const unsuspendUsers = useCallback(async (userIds) => {
        try {
            const response = await api.users.unsuspend(userIds);
            if (response.data?.success) {
                await fetchUsers();
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data?.message || 'Unsuspension failed' };
        } catch (error) {
            console.error('Error unsuspending users:', error);
            return { success: false, message: error.response?.data?.message || 'Something went wrong' };
        }
    }, [fetchUsers]);

    // Compute paged slices client-side
    const companiesPagination = useMemo(() =>
        buildPagination(allCompanies.length, companiesPage, COMPANIES_LIMIT),
        [allCompanies.length, companiesPage]
    );

    const usersPagination = useMemo(() =>
        buildPagination(allUsers.length, usersPage, USERS_LIMIT),
        [allUsers.length, usersPage]
    );

    // Only expose the current page's slice to consumers
    const companies = useMemo(() => {
        const start = (companiesPage - 1) * COMPANIES_LIMIT;
        return allCompanies.slice(start, start + COMPANIES_LIMIT);
    }, [allCompanies, companiesPage]);

    const users = useMemo(() => {
        const start = (usersPage - 1) * USERS_LIMIT;
        return allUsers.slice(start, start + USERS_LIMIT);
    }, [allUsers, usersPage]);

    const value = useMemo(() => ({
        users,
        companies,
        // Full datasets — kept for features that need to search across all records
        allUsers,
        allCompanies,
        currentData: currentView === 'users' ? users : companies,
        currentView,
        setCurrentView,
        loading,
        fetchCompanies,
        fetchUsers,
        refresh,
        addCompany,
        updateCompany,
        deleteCompanies,
        deleteUsers,
        suspendUsers,
        unsuspendUsers,
        // Pagination
        companiesPagination,
        usersPagination,
        currentPagination: currentView === 'users' ? usersPagination : companiesPagination,
        goToCompaniesPage,
        goToUsersPage,
        goToPage: currentView === 'users' ? goToUsersPage : goToCompaniesPage,
    }), [
        users,
        companies,
        allUsers,
        allCompanies,
        currentView,
        loading,
        fetchCompanies,
        fetchUsers,
        refresh,
        addCompany,
        updateCompany,
        deleteCompanies,
        deleteUsers,
        suspendUsers,
        unsuspendUsers,
        companiesPagination,
        usersPagination,
        goToCompaniesPage,
        goToUsersPage,
    ]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUserContext must be used within UserProvider');
    return context;
};