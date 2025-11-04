import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useSavedTemplates = () => {
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedSavedTemplates, setSelectedSavedTemplates] = useState([]);
  const [showSavedTemplatesTable, setShowSavedTemplatesTable] = useState(false);
  const [showManualTemplateForm, setShowManualTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSavedTemplates = async () => {
    setShowSavedTemplatesTable(true);
    const toastID = toast.loading("Fetching templates...");
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_TEMPLATES_ROUTE}`,
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastID);
        setLoading(false);
        const data = response.data.data || [];
        setSavedTemplates(Array.isArray(data) ? data : []);
      } else {
        toast.dismiss(toastID);
        setLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      setLoading(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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
    const toastID = toast.loading("Fetching template...");
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_GET_TEMPLATE_ROUTE}?templateName=${encodeURIComponent(templateName)}`,
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastID);
        setLoading(false);
        const template = response.data.data;
        if (template) {
          setEditingTemplate(template);
          setShowManualTemplateForm(true);
        }
      } else {
        toast.dismiss(toastID);
        setLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      setLoading(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

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

    if (editingTemplate) {
      const toastID = toast.loading("Updating template...");
      setLoading(true);
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_TEMPLATE_ROUTE}`,
          templateData,
          { withCredentials: true }
        );
        if (response.data?.success === true) {
          toast.dismiss(toastID);
          setLoading(false);
          setSavedTemplates(prev =>
            prev.map(t =>
              t.templateName === editingTemplate.templateName ? { ...t, ...templateData } : t
            )
          );
          setShowManualTemplateForm(false);
          setEditingTemplate(null);
          setSelectedSavedTemplates([]);
          toast.success('✅ Template updated successfully!');
          return true;
        } else {
          toast.dismiss(toastID);
          setLoading(false);
          toast.error(response.data?.message || "Update failed.");
          return false;
        }
      } catch (error) {
        toast.dismiss(toastID);
        setLoading(false);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.data) {
          toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        return false;
      }
    } else {
      const toastID = toast.loading("Creating template...");
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_TEMPLATE_ROUTE}`,
          templateData,
          { withCredentials: true }
        );
        if (response.data?.success === true) {
          toast.dismiss(toastID);
          setLoading(false);
          setSavedTemplates(prev => [...prev, templateData]);
          setShowManualTemplateForm(false);
          setEditingTemplate(null);
          setSelectedSavedTemplates([]);
          toast.success('✅ Template created successfully!');
          return true;
        } else {
          toast.dismiss(toastID);
          setLoading(false);
          toast.error(response.data?.message || "Update failed.");
          return false;
        }
      } catch (error) {
        toast.dismiss(toastID);
        setLoading(false);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.data) {
          toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        return false;
      }
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

    const toastID = toast.loading("Deleting template(s)...");
    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_TEMPLATES_ROUTE}`,
        {
          data: { templateNames: selectedSavedTemplates },
          withCredentials: true
        }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastID);
        setLoading(false);
        setSavedTemplates(prev =>
          prev.filter(t => !selectedSavedTemplates.includes(t.templateName))
        );
        setSelectedSavedTemplates([]);
        toast.success('🗑️ Templates deleted successfully!');
      } else {
        toast.dismiss(toastID);
        setLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      setLoading(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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
