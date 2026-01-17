import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Dummy data with MailStorm styling
const dummyUsers = [
  {
    _id: 'user1',
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2023-06-20').toISOString(),
  },
  {
    _id: 'user2',
    fullName: 'Jane Smith',
    email: 'jane.smith@email.com',
    createdAt: new Date('2023-02-10').toISOString(),
    updatedAt: new Date('2023-07-15').toISOString(),
  },
];

const dummyCompanies = [
  {
    _id: 'company1',
    companyName: 'TechCorp Solutions',
    companyAddress: '123 Tech Street, Silicon Valley',
    companyCountry: 'United States',
    companyEmail: 'info@techcorp.com',
    companyPhone: '+1-555-0123',
    companyContactPersonName: 'Michael Johnson',
    companyContactPersonPhone: '+1-555-0124',
    companyProductGroup: ['Software Development', 'Cloud Services', 'AI Solutions'],
    companyWebsite: 'https://techcorp.com',
    companyNote: 'Interested in enterprise solutions. Follow up monthly.',
    hasProcurementTeam: true,
    includedIn: 'N/A'
  },
  {
    _id: 'company2',
    companyName: 'Digital Marketing Pro',
    companyAddress: '456 Marketing Ave, New York',
    companyCountry: 'United States',
    companyEmail: 'hello@digitalmarketingpro.com',
    companyPhone: '+1-555-0234',
    companyContactPersonName: 'Sarah Williams',
    companyContactPersonPhone: '+1-555-0235',
    companyProductGroup: ['Digital Marketing', 'SEO Services', 'Social Media'],
    companyWebsite: 'https://digitalmarketingpro.com',
    companyNote: '',
    hasProcurementTeam: false,
    includedIn: 'N/A'
  },
  {
    _id: 'company3',
    companyName: 'Green Energy Systems',
    companyAddress: '789 Renewable Way, Austin',
    companyCountry: 'United States',
    companyEmail: 'contact@greenenergy.com',
    companyPhone: '+1-555-0345',
    companyContactPersonName: 'David Chen',
    companyContactPersonPhone: '+1-555-0346',
    companyProductGroup: ['Solar Panels', 'Wind Energy', 'Battery Storage'],
    companyWebsite: 'https://greenenergy.com',
    companyNote: 'Large scale projects only. Quarterly reviews.',
    hasProcurementTeam: true,
    includedIn: 'N/A'
  },
];

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProcurement, setFilterProcurement] = useState(false);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  // Fetch users/companies from API or use dummy data
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        show
          ? `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_USERS_ROUTE}`
          : `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_COMPANIES_ROUTE}`,
        {
          withCredentials: true
        }
      );
      // Handle empty response gracefully - backend returns { success: true, data: [...] }
      const responseData = response.data?.data || response.data || [];
      const normalizedData = (Array.isArray(responseData) ? responseData : []).map(item => ({
        ...item,
        lists: Array.isArray(item.lists) ? item.lists : []
      }));
      setUsers(Array.isArray(normalizedData) ? normalizedData : []);
      setIsUsingDummyData(false);
    } catch (error) {
      console.warn('API call failed, using dummy data:', error);
      setUsers(show ? dummyUsers : dummyCompanies);
      setIsUsingDummyData(true);
      toast.info('🔄 Using demo data - API unavailable', {
        style: {
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          color: '#fff'
        }
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [show]);

  // Toggle between users and companies
  const toggleView = () => {
    setShow(prev => !prev);
    setSelectedUsers([]);
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  // Select all users
  const selectAllUsers = (userList) => {
    if (Array.isArray(userList)) {
      setSelectedUsers(userList.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Delete selected users
  const deleteSelectedUsers = async () => {
    if (isUsingDummyData) {
      // Handle locally for demo mode
      setUsers(prevUsers =>
        prevUsers.filter(user => !selectedUsers.includes(user._id))
      );
      setSelectedUsers([]);
      toast.success('🗑️ Demo: Items deleted locally', {
        style: {
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          color: '#fff'
        }
      });
      return;
    }

    const selectedUsersData = show
      ? { userIds: selectedUsers }
      : { companyIds: selectedUsers };

    try {
      const response = await axios.delete(
        show
          ? `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_USERS_ROUTE}`
          : `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_COMPANIES_ROUTE}`,
        {
          data: selectedUsersData,
          withCredentials: true
        }
      );
      if (response.data?.success === true) {
        setUsers(prevUsers =>
          prevUsers.filter(user => !selectedUsers.includes(user._id))
        );
        setSelectedUsers([]);
        toast.success(response.data.message);
      } else {
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // Update user note
  const updateUserNote = (id, updatedNote) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === id ? { ...user, companyNotes: updatedNote } : user
      )
    );
  };

  // Filter users based on search term
  const filteredUsers = (users || []).filter((user) => {
    if (!user) return false;

    // Build searchable fields with sensible fallbacks so search works even
    // if the API returns slightly different user field names.
    const searchFields = show
      ? [
        user.fullName,
        user.email,
        user.name,
        user.userName,
        user.username,
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      ]
      : [
        user.companyName,
        user.companyContactPersonName,
        user.companyAddress,
        user.companyCountry,
        user.companyEmail,
        user.companyPhone,
        user.companyContactPersonPhone,
        user.companyWebsite,
        ...(user.companyProductGroup || []),
      ];

    // Normalize search input into keywords (support both array and space-separated string)
    const keywords = Array.isArray(searchTerm)
      ? searchTerm.map(k => String(k).trim().toLowerCase()).filter(Boolean)
      : String(searchTerm || '').split(/\s+/).map(k => k.trim().toLowerCase()).filter(Boolean);

    if (keywords.length === 0 && !filterProcurement) return true;

    // If procurement filter is enabled for companies, require procurement=true
    if (!show && filterProcurement) {
      const hasProcurement = Boolean(
        user.hasProcurementTeam ?? user.procurementTeam ?? user.procurement ?? user.hasProcurement
      );
      if (!hasProcurement) return false;
    }

    // Combine all searchable fields into one string to allow matching keywords across fields
    const haystack = searchFields
      .filter(Boolean)
      .map(f => String(f).toLowerCase())
      .join(' ');

    // Require that every keyword appears somewhere in the combined fields
    return keywords.every(k => haystack.includes(k));
  });

  const getCompanyListCount = (company) => {
    return company?.lists?.length || 0;
  };

  const getCompanyListNames = (company) => {
    return (company?.lists || []).map(l => l.listName);
  };

  return {
    users,
    setUsers,
    selectedUsers,
    setSelectedUsers,
    show,
    searchTerm,
    setSearchTerm,
    filterProcurement,
    setFilterProcurement,
    filteredUsers,
    isUsingDummyData,
    toggleView,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    deleteSelectedUsers,
    updateUserNote,
    fetchUsers,
    getCompanyListCount,
    getCompanyListNames
  };
};