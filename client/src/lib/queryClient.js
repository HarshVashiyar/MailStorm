import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  users: ['users'],
  usersList: (page, limit) => ['users', page, limit],
  companies: ['companies'],
  companiesList: (page, limit) => ['companies', page, limit],
  templates: ['templates'],
  templatesList: (page, limit) => ['templates', page, limit],
  lists: ['lists'],
  smtpSlots: ['smtp', 'slots'],
  scheduledEmails: ['scheduled', 'emails'],
  userProfile: ['user', 'profile'],
};
