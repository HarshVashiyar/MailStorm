import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const TemplatesContext = createContext(null);

export const TemplatesProvider = ({ children }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [showTemplatesTable, setShowTemplatesTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastFetch, setLastFetch] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1, limit: 5, totalItems: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false
    });

    // Fetch all templates with pagination
    const fetchTemplates = useCallback(async (force = false, openModal = true, page = null, limit = 5) => {
        const targetPage = page || pagination.page;

        // Cache for 5 minutes (but still respect pagination)
        if (!force && !page && lastFetch && Date.now() - lastFetch < 300000 && templates.length > 0) {
            if (openModal) setShowTemplatesTable(true);
            return;
        }

        setLoading(true);
        try {
            const response = await api.templates.getAll(targetPage, limit);
            if (response.data?.success) {
                const data = response.data.data || [];
                setTemplates(Array.isArray(data) ? data : []);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                }
                if (openModal) setShowTemplatesTable(true);
            }
            setLastFetch(Date.now());
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    }, [lastFetch, templates.length, pagination.page]);

    // Navigate to specific page
    const goToPage = useCallback((page) => {
        fetchTemplates(true, true, page, pagination.limit);
    }, [fetchTemplates, pagination.limit]);

    // Create template
    const createTemplate = useCallback(async (data) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_TEMPLATE_ROUTE}`,
                data,
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Template created successfully!');
                await fetchTemplates(true, true, 1, pagination.limit); // Go to first page
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
    }, [fetchTemplates, pagination.limit]);

    // Update template
    const updateTemplate = useCallback(async (id, data) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_TEMPLATE_ROUTE}`,
                {
                    templateName: id,
                    ...data
                },
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Template updated successfully!');
                await fetchTemplates(true, true, pagination.page, pagination.limit);
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
    }, [fetchTemplates, pagination]);

    // Delete template(s)
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
                setTemplates(prev => prev.filter(t => !names.includes(t.templateName)));
                setSelectedTemplates(prev => prev.filter(name => !names.includes(name)));
                setPagination(prev => ({ ...prev, totalItems: Math.max(0, prev.totalItems - names.length) }));
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

    // Selection logic
    const toggleTemplateSelection = useCallback((templateName) => {
        setSelectedTemplates(prev =>
            prev.includes(templateName)
                ? prev.filter(name => name !== templateName)
                : [...prev, templateName]
        );
    }, []);

    // UI state management
    const openTemplatesTable = useCallback(() => setShowTemplatesTable(true), []);
    const closeTemplatesTable = useCallback(() => {
        setShowTemplatesTable(false);
        setSelectedTemplates([]);
    }, []);

    const value = useMemo(() => ({
        templates,
        selectedTemplates,
        showTemplatesTable,
        loading,
        pagination,
        fetchTemplates,
        goToPage,
        refresh: () => fetchTemplates(true, true, pagination.page, pagination.limit),
        createTemplate,
        updateTemplate,
        deleteTemplate,
        toggleTemplateSelection,
        openTemplatesTable,
        closeTemplatesTable,
    }), [
        templates,
        selectedTemplates,
        showTemplatesTable,
        loading,
        pagination,
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
