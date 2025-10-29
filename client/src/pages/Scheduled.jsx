import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Scheduled = () => {
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);

  useEffect(() => {
    const fetchScheduledEmails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}${
            import.meta.env.VITE_ALL_SCHEDULED_EMAILS_ROUTE
          }`,
          { withCredentials: true }
        );
        setScheduledEmails(response.data);
      } catch (error) {
        console.error("Error fetching scheduled emails:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch scheduled emails."
        );
      }
    };

    fetchScheduledEmails();
  }, []);

  const toggleEmailSelection = (emailId) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(emailId)
        ? prevSelected.filter((id) => id !== emailId)
        : [...prevSelected, emailId]
    );
  };

  const selectAllEmails = () => {
    if (selectedEmails.length === scheduledEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(scheduledEmails.map(email => email._id));
    }
  };

  const deleteSelectedEmails = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${
          import.meta.env.VITE_REMOVE_SCHEDULED_EMAILS_ROUTE
        }`,
        {
          data: { ids: selectedEmails },
          withCredentials: true
        }
      );
      setScheduledEmails((prevEmails) =>
        prevEmails.filter((email) => !selectedEmails.includes(email._id))
      );
      setSelectedEmails([]);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting emails");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent"></div>
      
      {/* Scrollable Content */}
      <div className="absolute inset-0 top-20 overflow-auto">
        <div className="px-6 py-3 bg-glass-dark/50 backdrop-blur-lg border-b border-primary-500/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
                ⏰ Scheduled Emails
              </h1>
              <p className="text-gray-300 text-xs">
                Manage your scheduled email campaigns
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-glow animate-glow">
                {scheduledEmails.length} Scheduled
              </div>
              <div className="bg-gradient-to-r from-accent-500 to-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-glow">
                {selectedEmails.length} Selected
              </div>
            </div>
          </div>

          {/* Reserved Space for Action Bar - Fixed Height */}
          <div className="h-16 mt-2">
            <div className={`transition-all duration-300 ${
              selectedEmails.length > 0 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform -translate-y-2 pointer-events-none'
            }`}>
              <div className="bg-gradient-to-r from-primary-600/90 via-accent-600/90 to-primary-600/90 backdrop-blur-lg p-3 rounded-2xl shadow-2xl border border-white/20">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
                    <span className="text-2xl">⚡</span>
                    <span className="text-white font-semibold text-sm">
                      {selectedEmails.length} selected
                    </span>
                  </div>
                  
                  <button
                    onClick={deleteSelectedEmails}
                    className="group bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-400/30 hover:shadow-red-500/50"
                  >
                    <span className="flex items-center space-x-1.5">
                      <span className="text-base">🗑️</span>
                      <span>Delete</span>
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedEmails([])}
                    className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-400/30 hover:shadow-gray-500/50"
                  >
                    <span className="flex items-center space-x-1.5">
                      <span className="text-base">✖️</span>
                      <span>Clear Selection</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 pb-20">
          <div className="bg-glass-dark backdrop-blur-lg rounded-3xl shadow-2xl border border-primary-500/30 overflow-hidden animate-glow">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-4 border-b border-primary-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>📧</span>
                  <span>Scheduled Emails Database</span>
                </h3>
                <div className="text-sm text-gray-300">
                  {scheduledEmails.length} emails scheduled
                </div>
              </div>
            </div>
            
            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed bg-transparent text-gray-100">
                <thead className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 backdrop-blur-sm">
                  <tr>
                    <th className="py-3 px-4 text-center text-white font-semibold w-1/6">Sender</th>
                    <th className="py-3 px-4 text-center text-white font-semibold w-1/5">Recipients</th>
                    <th className="py-3 px-4 text-center text-white font-semibold w-1/4">Subject</th>
                    <th className="py-3 px-4 text-center text-white font-semibold w-1/5">Scheduled Time</th>
                    <th className="py-3 px-4 text-center text-white font-semibold w-24">Status</th>
                    <th className="py-3 px-4 text-center text-white font-semibold w-16">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-2 border-primary-400 cursor-pointer"
                        checked={selectedEmails.length === scheduledEmails.length && scheduledEmails.length > 0}
                        onChange={selectAllEmails}
                        title="Select/Deselect All"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-500/20">
                  {scheduledEmails.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 px-6 text-center text-gray-400">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-3xl opacity-50">📧</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                              No Scheduled Emails
                            </h3>
                            <p className="text-sm text-gray-400">
                              Your scheduled emails will appear here
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    scheduledEmails.map((email, index) => {
                      const isSelected = selectedEmails.includes(email._id);
                      return (
                        <tr 
                          key={email._id} 
                          className={`group transition-all duration-300 hover:bg-primary-500/10 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-l-4 border-primary-400' 
                              : index % 2 === 0 ? 'bg-glass-dark/20' : 'bg-transparent'
                          }`}
                        >
                          <td className="py-4 px-4 text-center">
                            <div className="truncate text-gray-300" title={email.from}>{email.from}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="truncate text-gray-300" title={email.to}>{email.to}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="truncate font-medium text-white" title={email.subject}>{email.subject}</div>
                          </td>
                          <td className="py-4 px-4 text-center text-sm text-gray-300">
                            {new Date(email.sendAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                              email.status === 'pending' 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                : email.status === 'sent' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              className={`w-5 h-5 rounded border-2 transition-all duration-300 cursor-pointer ${
                                isSelected 
                                  ? 'bg-primary-500 border-primary-500 text-white' 
                                  : 'border-gray-400 hover:border-primary-400'
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
            
            {/* Table Footer */}
            <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-3 border-t border-primary-500/20">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Total: {scheduledEmails.length} scheduled email(s)</span>
                <span>Selected: {selectedEmails.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduled;
