import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useSavedTemplates = () => {
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedSavedTemplates, setSelectedSavedTemplates] = useState([]);
  const [showSavedTemplatesTable, setShowSavedTemplatesTable] = useState(false);
  const [showManualTemplateForm, setShowManualTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Fetch templates from API
  const fetchSavedTemplates = async () => {
    // Always show the table, even if empty
    setShowSavedTemplatesTable(true);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_TEMPLATES_ROUTE}`,
        { withCredentials: true }
      );
      const data = response.data.data || [];
      setSavedTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Set empty array so the modal shows "no templates found" message
      setSavedTemplates([]);
      toast.error('Failed to load templates');
    }
  };

  // Toggle template selection
  const toggleSavedTemplateSelection = (templateName) => {
    setSelectedSavedTemplates(prev =>
      prev.includes(templateName)
        ? prev.filter(name => name !== templateName)
        : [...prev, templateName]
    );
  };

  // Close templates table
  const closeSavedTemplatesTable = () => {
    setShowSavedTemplatesTable(false);
    setSelectedSavedTemplates([]);
  };

  // Open form for adding new template
  const toggleManualTemplateForm = () => {
    setEditingTemplate(null);
    setShowManualTemplateForm(true);
  };

  // Open form for editing existing template
  const editSavedTemplate = async () => {
    if (selectedSavedTemplates.length !== 1) {
      toast.error('⚠️ Select exactly one template to edit!');
      return;
    }
    
    const templateName = selectedSavedTemplates[0];
    
    try {
      // Fetch full template content from API
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_GET_TEMPLATE_ROUTE}?templateName=${encodeURIComponent(templateName)}`,
        { withCredentials: true }
      );
      const template = response.data.data;
      
      if (template) {
        setEditingTemplate(template);
        setShowManualTemplateForm(true);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template for editing');
    }
  };

  // Save template (create or update)
  const saveTemplate = async (templateName, templateSubject, templateContent) => {
    if (!templateName.trim() || !templateSubject.trim() || !templateContent.trim()) {
      toast.error('⚠️ All fields are required!');
      return false;
    }

    const templateData = {
      templateName: templateName.trim(),
      templateSubject: templateSubject.trim(),
      templateContent: templateContent.trim(),
    };

    try {
      if (editingTemplate) {
        // Update existing template
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_TEMPLATE_ROUTE}`,
          templateData,
          { withCredentials: true }
        );
        
        // Update local state
        setSavedTemplates(prev =>
          prev.map(t =>
            t.templateName === editingTemplate.templateName ? { ...t, ...templateData } : t
          )
        );
        toast.success('✅ Template updated successfully!');
      } else {
        // Create new template
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_TEMPLATE_ROUTE}`,
          templateData,
          { withCredentials: true }
        );
        
        // Add to local state
        setSavedTemplates(prev => [...prev, templateData]);
        toast.success('✅ Template created successfully!');
      }

      setShowManualTemplateForm(false);
      setEditingTemplate(null);
      setSelectedSavedTemplates([]);
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Failed to save template');
      return false;
    }
  };

  // Delete selected templates
  const deleteSavedTemplate = async () => {
    if (selectedSavedTemplates.length === 0) {
      toast.error('⚠️ No templates selected!');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedSavedTemplates.length} template(s)?`
    );
    
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_TEMPLATES_ROUTE}`,
        {
          data: { templateNames: selectedSavedTemplates },
          withCredentials: true
        }
      );

      // Update local state
      setSavedTemplates(prev =>
        prev.filter(t => !selectedSavedTemplates.includes(t.templateName))
      );
      setSelectedSavedTemplates([]);
      toast.success('🗑️ Templates deleted successfully!');
    } catch (error) {
      console.error('Error deleting templates:', error);
      toast.error(error.response?.data?.message || 'Failed to delete templates');
    }
  };

  const closeManualTemplateForm = () => {
    setShowManualTemplateForm(false);
    setEditingTemplate(null);
  };

  return {
    savedTemplates,
    selectedSavedTemplates,
    showSavedTemplatesTable,
    showManualTemplateForm,
    editingTemplate,
    fetchSavedTemplates,
    toggleSavedTemplateSelection,
    closeSavedTemplatesTable,
    toggleManualTemplateForm,
    editSavedTemplate,
    saveTemplate,
    deleteSavedTemplate,
    closeManualTemplateForm,
  };
};
