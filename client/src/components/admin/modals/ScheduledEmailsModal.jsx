import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MdClose,
  MdDelete,
  MdSchedule,
  MdEmail,
  MdAccessTime,
  MdCheckCircle
} from 'react-icons/md';
import InlinePagination from '../../common/InlinePagination';

const ScheduledEmailsModal = ({ isOpen, onClose }) => {
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1, limit: 5, totalItems: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false
  });

  const fetchScheduledEmails = useCallback(async (page = 1, limit = 5) => {
    setIsLoading(true);
    const toastID = toast.loading("Loading scheduled emails...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_SCHEDULED_EMAILS_ROUTE}?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      if (response.data.success === true) {
        toast.dismiss(toastID);
        setIsLoading(false);
        setScheduledEmails(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        toast.dismiss(toastID);
        setIsLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      setIsLoading(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }, []);

  const goToPage = useCallback((page) => {
    fetchScheduledEmails(page, pagination.limit);
  }, [fetchScheduledEmails, pagination.limit]);

  useEffect(() => {
    if (isOpen) {
      fetchScheduledEmails();
    } else {
      // Reset state when modal closes
      setSelectedEmails([]);
      setSearchTerm('');
    }
  }, [isOpen, fetchScheduledEmails]);

  const toggleEmailSelection = (emailId) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(emailId)
        ? prevSelected.filter((id) => id !== emailId)
        : [...prevSelected, emailId]
    );
  };

  // Sort emails by sendAt date, latest first
  const sortedScheduledEmails = useMemo(() => {
    return [...scheduledEmails].sort((a, b) => {
      const dateA = new Date(a.sendAt);
      const dateB = new Date(b.sendAt);
      return dateB - dateA; // Latest first
    });
  }, [scheduledEmails]);

  // Filter emails based on search term
  const filteredEmails = useMemo(() => {
    return sortedScheduledEmails.filter((email) => {
      const searchLower = searchTerm.toLowerCase();

      // Handle 'to' field - could be string or array
      const toField = Array.isArray(email.to)
        ? email.to.join(', ').toLowerCase()
        : (email.to || '').toLowerCase();

      // Format date/time for searching
      const dateTimeString = email.sendAt
        ? new Date(email.sendAt).toLocaleString().toLowerCase()
        : '';

      return (
        (email.from || '').toLowerCase().includes(searchLower) ||
        toField.includes(searchLower) ||
        (email.subject || '').toLowerCase().includes(searchLower) ||
        (email.status || '').toLowerCase().includes(searchLower) ||
        dateTimeString.includes(searchLower)
      );
    });
  }, [sortedScheduledEmails, searchTerm]);

  const selectAllEmails = () => {
    const filteredEmailIds = filteredEmails.map(email => email._id);
    if (selectedEmails.length === filteredEmailIds.length && filteredEmailIds.length > 0) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmailIds);
    }
  };

  const deleteSelectedEmails = async () => {
    setIsLoading(true);
    const toastID = toast.loading("Deleting scheduled emails...");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_REMOVE_SCHEDULED_EMAILS_ROUTE}`,
        {
          data: { ids: selectedEmails },
          withCredentials: true
        }
      );
      if (response.data.success === true) {
        toast.dismiss(toastID);
        setIsLoading(false);
        setScheduledEmails((prevEmails) =>
          prevEmails.filter((email) => !selectedEmails.includes(email._id))
        );
        setSelectedEmails([]);
        toast.success(response.data.message);
      } else {
        toast.dismiss(toastID);
        setIsLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      setIsLoading(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 pt-24"
      style={{ zIndex: 1050 }}
    >
      <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-6xl border border-orange-500/20 max-h-[85vh] overflow-hidden flex flex-col animate-glow">
        {/* Header with Search Bar */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
              <MdSchedule className="text-orange-400 text-4xl" />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Scheduled Emails
              </span>
              <InlinePagination pagination={pagination} onPageChange={goToPage} />
            </h3>
            <p className="text-gray-300 text-sm">
              Manage your scheduled email campaigns
            </p>
          </div>
          {/* Search Bar - Top Right */}
          <div className="w-80">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-3 pr-10 py-2 bg-gray-900 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 text-xl z-10 cursor-pointer"
                  title="Clear search"
                >
                  <MdClose />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed Height Container */}
        <div className="h-20 mb-2 flex items-start">
          <div className="flex flex-wrap gap-2">
            {selectedEmails.length > 0 && (
              <>
                <button
                  onClick={deleteSelectedEmails}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 border border-red-400/30 flex items-center space-x-2 text-sm"
                  title={`Delete ${selectedEmails.length} email(s)`}
                >
                  <MdDelete className="text-base flex-shrink-0" />
                  <span>Delete {selectedEmails.length > 1 ? `${selectedEmails.length} emails` : 'email'}</span>
                </button>

                <button
                  onClick={() => setSelectedEmails([])}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-400/30 flex items-center space-x-2 text-sm"
                >
                  <MdClose className="text-base flex-shrink-0" />
                  <span>Clear Selection</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-auto mb-4">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-orange-500/20 overflow-hidden">
            <table className="w-full text-white table-fixed">
              <thead className="bg-gradient-to-r from-orange-600/30 to-amber-600/30 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold w-1/6">
                    <div className="flex items-center space-x-2">
                      <MdEmail className="text-orange-400" />
                      <span>Sender</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-semibold w-1/5">
                    <div className="flex items-center space-x-2">
                      <MdEmail className="text-orange-400" />
                      <span>Recipients</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-semibold w-1/4">
                    <div className="flex items-center space-x-2">
                      <MdEmail className="text-orange-400" />
                      <span>Subject</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-semibold w-1/5">
                    <div className="flex items-center space-x-2">
                      <MdAccessTime className="text-orange-400" />
                      <span>Scheduled Time</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center font-semibold w-24">
                    <div className="flex items-center justify-center space-x-2">
                      <MdCheckCircle className="text-orange-400" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center font-semibold w-16">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-2 border-orange-400 cursor-pointer"
                      checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                      onChange={selectAllEmails}
                      title="Select/Deselect All"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-500/10">
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 px-6 text-center text-gray-300">
                      <div className="flex flex-col items-center space-y-3">
                        <MdSchedule className="text-6xl text-gray-500" />
                        <p className="text-xl font-medium">{scheduledEmails.length === 0 ? 'No Scheduled Emails' : 'No Results Found'}</p>
                        <p className="text-sm">{scheduledEmails.length === 0 ? 'Your scheduled emails will appear here' : 'Try adjusting your search'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email, index) => {
                    const isSelected = selectedEmails.includes(email._id);
                    return (
                      <tr
                        key={email._id}
                        className={`transition-all duration-300 hover:bg-orange-500/5 ${isSelected
                          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-l-4 border-orange-400 shadow-lg shadow-orange-500/10'
                          : index % 2 === 0 ? 'bg-gray-800/20' : 'bg-transparent'
                          }`}
                      >
                        <td className="py-4 px-6">
                          <div className="truncate text-gray-300" title={email.from}>
                            {email.from}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="truncate text-gray-300" title={Array.isArray(email.to) ? email.to.join(', ') : email.to}>
                            {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="truncate font-medium text-white" title={email.subject}>
                            {email.subject}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-300">
                          {new Date(email.sendAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${email.status === 'Pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : email.status === 'Sent'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {email.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            className={`w-5 h-5 rounded border-2 transition-all duration-300 cursor-pointer ${isSelected
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-orange-400/50 hover:border-orange-400 bg-gray-800/60'
                              }`}
                            checked={isSelected}
                            onChange={() => toggleEmailSelection(email._id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-700/40 hover:bg-gray-600/40 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2"
          >
            <MdClose className="text-lg" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing modal state
export const useScheduledEmailsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const toggleModal = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

export default ScheduledEmailsModal;