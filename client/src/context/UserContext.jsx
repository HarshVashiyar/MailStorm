import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [currentView, setCurrentView] = useState('companies');
    const [loading, setLoading] = useState(false);

    // ✅ On-demand fetch functions - NO auto-fetch on mount
    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            // console.log('UserContext: Fetching companies...');
            const response = await api.companies.getAll();
            if (response.data?.success) {
                const data = response.data.data || [];
                setCompanies(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // console.log('UserContext: Fetching users...');
            const response = await api.users.getAll();
            if (response.data?.success) {
                const data = response.data.data || [];
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh function - fetches current view's data
    const refresh = useCallback(async () => {
        setLoading(true);
        if (currentView === 'users') {
            await fetchUsers();
        } else {
            await fetchCompanies();
        }
    }, [currentView, fetchUsers, fetchCompanies]);

    // Helper functions for updating state
    const addCompany = useCallback((company) => {
        setCompanies(prev => [...prev, company]);
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
    }, []);

    const value = useMemo(() => ({
        users,
        companies,
        currentData: currentView === 'users' ? users : companies,
        currentView,
        setCurrentView,
        loading,
        fetchCompanies,  // ✅ Exposed for manual calling
        fetchUsers,      // ✅ Exposed for manual calling
        refresh,
        addCompany,
        updateCompany,
        deleteCompanies,
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
        deleteCompanies
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