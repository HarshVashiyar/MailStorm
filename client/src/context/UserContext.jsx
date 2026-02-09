import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [currentView, setCurrentView] = useState('companies');
    const [loading, setLoading] = useState(false);

    // Pagination state for companies and users
    const [companiesPagination, setCompaniesPagination] = useState({
        page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false
    });
    const [usersPagination, setUsersPagination] = useState({
        page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false
    });

    // ✅ On-demand fetch functions with pagination
    const fetchCompanies = useCallback(async (page = 1, limit = 20) => {
        setLoading(true);
        try {
            const response = await api.companies.getAll(page, limit);
            if (response.data?.success) {
                const data = response.data.data || [];
                setCompanies(Array.isArray(data) ? data : []);
                if (response.data.pagination) {
                    setCompaniesPagination(response.data.pagination);
                }
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async (page = 1, limit = 20) => {
        setLoading(true);
        try {
            const response = await api.users.getAll(page, limit);
            if (response.data?.success) {
                const data = response.data.data || [];
                setUsers(Array.isArray(data) ? data : []);
                if (response.data.pagination) {
                    setUsersPagination(response.data.pagination);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Pagination navigation helpers
    const goToCompaniesPage = useCallback((page) => {
        fetchCompanies(page, companiesPagination.limit);
    }, [fetchCompanies, companiesPagination.limit]);

    const goToUsersPage = useCallback((page) => {
        fetchUsers(page, usersPagination.limit);
    }, [fetchUsers, usersPagination.limit]);

    // Refresh function - fetches current view's data (current page)
    const refresh = useCallback(async () => {
        setLoading(true);
        if (currentView === 'users') {
            await fetchUsers(usersPagination.page, usersPagination.limit);
        } else {
            await fetchCompanies(companiesPagination.page, companiesPagination.limit);
        }
    }, [currentView, fetchUsers, fetchCompanies, usersPagination, companiesPagination]);

    // Helper functions for updating state
    const addCompany = useCallback((company) => {
        setCompanies(prev => [company, ...prev]);
        setCompaniesPagination(prev => ({ ...prev, totalItems: prev.totalItems + 1 }));
    }, []);

    const updateCompany = useCallback((id, updates) => {
        setCompanies(prev =>
            prev.map(c => c._id === id ? { ...c, ...updates } : c)
        );
    }, []);

    const deleteCompanies = useCallback((ids) => {
        setCompanies(prev =>
            prev.filter(c => !ids.includes(c._id))
        );
        setCompaniesPagination(prev => ({
            ...prev,
            totalItems: Math.max(0, prev.totalItems - ids.length)
        }));
    }, []);

    const value = useMemo(() => ({
        users,
        companies,
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
        currentView,
        loading,
        fetchCompanies,
        fetchUsers,
        refresh,
        addCompany,
        updateCompany,
        deleteCompanies,
        companiesPagination,
        usersPagination,
        goToCompaniesPage,
        goToUsersPage
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