import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    companyNotes: 'Interested in enterprise solutions. Follow up monthly.',
    history: [
      {
        lastSent: new Date('2024-05-01').toISOString(),
        subject: 'Introducing Our New AI Platform'
      },
      {
        lastSent: new Date('2024-03-15').toISOString(),
        subject: 'Cloud Services Discount Offer'
      }
    ],
    hasProcurementTeam: true,
    lists: []
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
    companyNotes: '',
    history: [
      {
        lastSent: new Date('2024-05-01').toISOString(),
        subject: 'Introducing Our New AI Platform'
      },
      {
        lastSent: new Date('2024-03-15').toISOString(),
        subject: 'Cloud Services Discount Offer'
      }
    ],
    hasProcurementTeam: false,
    lists: []
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
    companyNotes: 'Large scale projects only. Quarterly reviews.',
    history: [
      {
        lastSent: new Date('2024-05-01').toISOString(),
        subject: 'Introducing Our New AI Platform'
      },
      {
        lastSent: new Date('2024-03-15').toISOString(),
        subject: 'Cloud Services Discount Offer'
      }
    ],
    hasProcurementTeam: true,
    lists: []
  },
];

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProcurement, setFilterProcurement] = useState(false);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUsers = async () => {
    if (isFetching) {
      return;
    }
    
    setIsFetching(true);
    try {
      const response = await axios.get(
        show
          ? `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_USERS_ROUTE}`
          : `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_COMPANIES_ROUTE}`,
        {
          withCredentials: true
        }
      );
      
      const responseData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      if (responseData.length > 0 && responseData[0] && Object.keys(responseData[0]).length < 3) {
        setIsFetching(false);
        // toast.error('⚠️ Received incomplete data from server');
        return;
      }

      const normalizedData = responseData.map((item, index) => {
        return {
          ...item,
          _id: item._id || `generated-${Date.now()}-${index}`,
          lists: Array.isArray(item.lists) 
            ? item.lists 
            : Array.isArray(item.includedLists) 
              ? item.includedLists 
              : []
        };
      });

      setUsers(normalizedData);
      setIsUsingDummyData(false);
      setIsFetching(false);
    } catch (error) {
      const fallback = show ? dummyUsers : dummyCompanies;
      setUsers(fallback);
      setIsUsingDummyData(true);
      setIsFetching(false);
      toast.info('📄 Using demo data - API unavailable', {
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

  const toggleView = () => {
    setShow(prev => !prev);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const selectAllUsers = (userList) => {
    if (Array.isArray(userList)) {
      setSelectedUsers(userList.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const deleteSelectedUsers = async () => {
    if (isUsingDummyData) {
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

  const updateUserNote = (id, updatedNote) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === id ? { ...user, companyNotes: updatedNote } : user
      )
    );
  };

  const filteredUsers = (users || []).filter((user) => {
    if (!user) return false;

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

    const keywords = Array.isArray(searchTerm)
      ? searchTerm.map(k => String(k).trim().toLowerCase()).filter(Boolean)
      : String(searchTerm || '').split(/\s+/).map(k => k.trim().toLowerCase()).filter(Boolean);

    if (!searchTerm && !filterProcurement) return true;

    if (!show && filterProcurement) {
      const hasProcurement = Boolean(
        user.hasProcurementTeam ?? user.procurementTeam ?? user.procurement ?? user.hasProcurement
      );
      if (!hasProcurement) return false;
    }

    const haystack = searchFields
      .filter(Boolean)
      .map(f => String(f).toLowerCase())
      .join(' ');

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