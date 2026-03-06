import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Centralized API calls with consistent error handling
export const api = {
    smtp: {
        getSlots: () => axios.get(`${BASE_URL}smtp/slots`, { withCredentials: true }),
        deleteSlot: (slotNumber) => axios.delete(`${BASE_URL}smtp/slots/${slotNumber}`, { withCredentials: true }),
    },

    users: {
        // Returns all users at once; frontend handles client-side pagination
        getAll: () => axios.get(`${BASE_URL}${import.meta.env.VITE_ALL_USERS_ROUTE}`, { withCredentials: true }),
        delete: (ids) => axios.delete(`${BASE_URL}${import.meta.env.VITE_REMOVE_USERS_ROUTE}`, {
            data: { userIds: ids },
            withCredentials: true
        }),
        suspend: (userIds, reason) => axios.post(`${BASE_URL}user/suspend`, { userIds, reason }, { withCredentials: true }),
        unsuspend: (userIds) => axios.post(`${BASE_URL}user/unsuspend`, { userIds }, { withCredentials: true }),
        toggleSkipUnsubscribed: (userId, skipUnsubscribed) => axios.put(`${BASE_URL}user/skip-unsubscribed`, { userId, skipUnsubscribed }, { withCredentials: true }),
    },

    companies: {
        // Returns all companies at once; frontend handles client-side pagination
        getAll: () => axios.get(`${BASE_URL}${import.meta.env.VITE_ALL_COMPANIES_ROUTE}`, { withCredentials: true }),
        create: (data) => axios.post(`${BASE_URL}${import.meta.env.VITE_ADD_COMPANY_ROUTE}`, data, { withCredentials: true }),
        update: (data) => axios.put(`${BASE_URL}${import.meta.env.VITE_UPDATE_COMPANY_ROUTE}`, data, { withCredentials: true }),
        delete: (ids) => axios.delete(`${BASE_URL}${import.meta.env.VITE_REMOVE_COMPANIES_ROUTE}`, {
            data: { companyIds: ids },
            withCredentials: true
        }),
    },

    templates: {
        // Returns all templates at once; frontend handles client-side pagination
        getAll: () => axios.get(`${BASE_URL}${import.meta.env.VITE_ALL_TEMPLATES_ROUTE}`, { withCredentials: true }),
        get: (id) => axios.get(`${BASE_URL}${import.meta.env.VITE_GET_TEMPLATE_ROUTE}?templateName=${encodeURIComponent(id)}`, { withCredentials: true }),
        create: (data) => axios.post(`${BASE_URL}${import.meta.env.VITE_ADD_TEMPLATE_ROUTE}`, data, { withCredentials: true }),
        update: (data) => axios.put(`${BASE_URL}${import.meta.env.VITE_UPDATE_TEMPLATE_ROUTE}`, data, { withCredentials: true }),
        delete: (templateName) => axios.delete(`${BASE_URL}${import.meta.env.VITE_REMOVE_TEMPLATE_ROUTE}`, {
            data: { templateName },
            withCredentials: true
        }),
    },

    lists: {
        // Returns all lists at once; frontend handles client-side pagination
        getAll: () => axios.get(`${BASE_URL}${import.meta.env.VITE_ALL_LISTS_ROUTE}`, { withCredentials: true }),
        create: (data) => axios.post(`${BASE_URL}${import.meta.env.VITE_ADD_LIST_ROUTE}`, data, { withCredentials: true }),
        delete: (ids) => axios.delete(`${BASE_URL}${import.meta.env.VITE_REMOVE_LISTS_ROUTE}`, {
            data: { listIds: ids },
            withCredentials: true
        }),
        addTo: (listId, items) => axios.put(`${BASE_URL}${import.meta.env.VITE_ADD_TO_LIST_ROUTE}`, { listId, items }, { withCredentials: true }),
        removeFrom: (listId, itemIds) => axios.put(`${BASE_URL}${import.meta.env.VITE_REMOVE_FROM_LIST_ROUTE}`, { listId, itemIds }, { withCredentials: true }),
    },

    scheduledEmails: {
        // Returns all scheduled emails at once; frontend handles client-side pagination
        getAll: () => axios.get(`${BASE_URL}${import.meta.env.VITE_ALL_SCHEDULED_EMAILS_ROUTE}`, { withCredentials: true }),
        getLog: (id) => axios.get(`${BASE_URL}scheduled/${id}/log`, { withCredentials: true }),
        delete: (ids) => axios.delete(`${BASE_URL}${import.meta.env.VITE_REMOVE_SCHEDULED_EMAILS_ROUTE}`, {
            data: { ids },
            withCredentials: true
        })
    },
    bulkJobs: {
        getAll: () => axios.get(`${BASE_URL}mail/bulk/jobs`, { withCredentials: true }),
        getLog: (id) => axios.get(`${BASE_URL}mail/bulk/jobs/${id}/log`, { withCredentials: true }),
    },
};