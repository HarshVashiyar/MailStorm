import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

    // Fetch all templates
    const fetchTemplates = useCallback(async (force = false, openModal = true) => {
        // Cache for 5 minutes
        if (!force && lastFetch && Date.now() - lastFetch < 300000 && templates.length > 0) {
            if (openModal) setShowTemplatesTable(true); // Still open modal if cached
            return;
        }

        setLoading(true);
        try {
            const response = await api.templates.getAll();
            if (response.data?.success) {
                const data = response.data.data || [];
                setTemplates(Array.isArray(data) ? data : []);
                if (openModal) setShowTemplatesTable(true); // Open modal after fetching
            }
            setLastFetch(Date.now());
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Don't clear templates on error to allow offline viewing if cached
        } finally {
            setLoading(false);
        }
    }, [lastFetch, templates.length]);

    // ❌ REMOVED: Don't auto-fetch templates on mount - only fetch when user clicks "Templates" button
    // This was causing the templates modal to open automatically on page load

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
                await fetchTemplates(true); // Force refresh
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

    // Update template
    const updateTemplate = useCallback(async (id, data) => {
        try {
            // Note: The API route for update might be different or require different params
            // Adjusting to match probable API structure
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_TEMPLATE_ROUTE}`,
                {
                    templateName: id, // API uses name as ID currently
                    ...data
                },
                { withCredentials: true }
            );

            if (response.data?.success) {
                toast.success(response.data.message || 'Template updated successfully!');
                await fetchTemplates(true); // Force refresh
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

    // Delete template(s)
    const deleteTemplate = useCallback(async (templateNames) => {
        // Normalize to array
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
                await fetchTemplates(true); // Ensure sync
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
    }, [fetchTemplates]);

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
        fetchTemplates,
        refresh: () => fetchTemplates(true),
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
        fetchTemplates,
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
