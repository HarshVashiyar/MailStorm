import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const TemplatesContext = createContext(null);

const TEMPLATES_LIMIT = 5;

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

export const TemplatesProvider = ({ children }) => {
    const [allTemplates, setAllTemplates] = useState([]); // Full dataset
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [showTemplatesTable, setShowTemplatesTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTermState] = useState(''); // Lifted for cross-page search

    // Fetch ALL templates from the server at once
    const fetchTemplates = useCallback(async (force = false, openModal = true) => {
        // Cache for 5 minutes
        if (!force && lastFetch && Date.now() - lastFetch < 300000 && allTemplates.length > 0) {
            if (openModal) setShowTemplatesTable(true);
            return;
        }

        setLoading(true);
        try {
            const response = await api.templates.getAll();
            if (response.data?.success) {
                const data = response.data.data || [];
                setAllTemplates(Array.isArray(data) ? data : []);
                setCurrentPage(1);
                if (openModal) setShowTemplatesTable(true);
            }
            setLastFetch(Date.now());
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    }, [lastFetch, allTemplates.length]);

    // Client-side page navigation — no re-fetch
    const goToPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Reset to page 1 when search changes
    const setSearchTerm = useCallback((term) => {
        setSearchTermState(term);
        setCurrentPage(1);
    }, []);

    const createTemplate = useCallback(async (data) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_TEMPLATE_ROUTE}`,
                data,
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Template created successfully!');
                await fetchTemplates(true, true);
                return true;
            } else {
                toast.error(response.data?.message || "Failed to create template");
                return false;
            }
        } catch (error) {
            console.error('Error creating template:', error);
            toast.error(error.response?.data?.message || "Failed to create template");
            return false;
        }
    }, [fetchTemplates]);

    const updateTemplate = useCallback(async (id, data) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_TEMPLATE_ROUTE}`,
                { templateName: id, ...data },
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Template updated successfully!');
                await fetchTemplates(true, true);
                return true;
            } else {
                toast.error(response.data?.message || "Failed to update template");
                return false;
            }
        } catch (error) {
            console.error('Error updating template:', error);
            toast.error(error.response?.data?.message || "Failed to update template");
            return false;
        }
    }, [fetchTemplates]);

    const deleteTemplate = useCallback(async (templateNames) => {
        const names = Array.isArray(templateNames) ? templateNames : [templateNames];

        if (!templateNames || names.length === 0) {
            toast.error('⚠️ No template selected to delete!');
            return false;
        }

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_TEMPLATES_ROUTE}`,
                {
                    data: { templateNames: names },
                    withCredentials: true
                }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Template(s) deleted successfully!');
                setAllTemplates(prev => prev.filter(t => !names.includes(t.templateName)));
                setSelectedTemplates(prev => prev.filter(name => !names.includes(name)));
                return true;
            } else {
                toast.error(response.data?.message || "Failed to delete template");
                return false;
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error(error.response?.data?.message || "Failed to delete template");
            return false;
        }
    }, []);

    const toggleTemplateSelection = useCallback((templateName) => {
        setSelectedTemplates(prev =>
            prev.includes(templateName)
                ? prev.filter(name => name !== templateName)
                : [...prev, templateName]
        );
    }, []);

    const openTemplatesTable = useCallback(() => setShowTemplatesTable(true), []);
    const closeTemplatesTable = useCallback(() => {
        setShowTemplatesTable(false);
        setSelectedTemplates([]);
        setSearchTermState('');
    }, []);

    // ── Search + pagination entirely client-side ──────────────────────────────

    // 1. Filter across ALL templates
    const filteredAllTemplates = useMemo(() => {
        if (!searchTerm) return allTemplates;
        const lower = searchTerm.toLowerCase();
        return allTemplates.filter(t =>
            t.templateName.toLowerCase().includes(lower) ||
            t.templateSubject.toLowerCase().includes(lower)
        );
    }, [allTemplates, searchTerm]);

    // 2. Pagination descriptor reflects filtered count
    const pagination = useMemo(() =>
        buildPagination(filteredAllTemplates.length, currentPage, TEMPLATES_LIMIT),
        [filteredAllTemplates.length, currentPage]
    );

    // 3. Current-page slice of the filtered results
    const templates = useMemo(() => {
        const start = (currentPage - 1) * TEMPLATES_LIMIT;
        return filteredAllTemplates.slice(start, start + TEMPLATES_LIMIT);
    }, [filteredAllTemplates, currentPage]);

    const value = useMemo(() => ({
        templates,          // Current page's slice (already filtered)
        allTemplates,       // Full unfiltered dataset
        selectedTemplates,
        showTemplatesTable,
        loading,
        pagination,
        searchTerm,
        setSearchTerm,
        fetchTemplates,
        goToPage,
        refresh: () => fetchTemplates(true, true),
        createTemplate,
        updateTemplate,
        deleteTemplate,
        toggleTemplateSelection,
        openTemplatesTable,
        closeTemplatesTable,
    }), [
        templates,
        allTemplates,
        selectedTemplates,
        showTemplatesTable,
        loading,
        pagination,
        searchTerm,
        setSearchTerm,
        fetchTemplates,
        goToPage,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        toggleTemplateSelection,
        openTemplatesTable,
        closeTemplatesTable,
    ]);

    return (
        <TemplatesContext.Provider value={value}>
            {children}
        </TemplatesContext.Provider>
    );
};

export const useTemplates = () => {
    const context = useContext(TemplatesContext);
    if (!context) throw new Error('useTemplates must be used within TemplatesProvider');
    return context;
};
