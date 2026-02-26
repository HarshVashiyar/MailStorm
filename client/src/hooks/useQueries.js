import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../lib/queryClient';

// NOTE: These hooks are kept for reference / optional use.
// The primary data fetching is done via Contexts (UserContext, ListsContext, TemplatesContext)
// which also handle client-side pagination. These hooks no longer pass page/limit params
// since the backend returns all records at once.

export const useCompanies = () => {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => {
      const response = await api.companies.getAll();
      return response.data;
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const response = await api.users.getAll();
      return response.data;
    },
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: async () => {
      const response = await api.templates.getAll();
      return response.data;
    },
  });
};

export const useLists = () => {
  return useQuery({
    queryKey: queryKeys.lists,
    queryFn: async () => {
      const response = await api.lists.getAll();
      return response.data;
    },
  });
};

export const useSmtpSlots = () => {
  return useQuery({
    queryKey: queryKeys.smtpSlots,
    queryFn: async () => {
      const response = await api.smtp.getSlots();
      return response.data;
    },
  });
};

export const useScheduledEmails = () => {
  return useQuery({
    queryKey: queryKeys.scheduledEmails,
    queryFn: async () => {
      const response = await api.scheduledEmails.getAll();
      return response.data;
    },
  });
};

export const useDeleteCompanies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => api.companies.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => api.users.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.companies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.companies.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useDeleteSmtpSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotNumber) => api.smtp.deleteSlot(slotNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smtpSlots });
    },
  });
};
