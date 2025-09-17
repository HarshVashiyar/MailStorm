import React, { useState, useEffect } from "react";
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
          `${import.meta.env.VITE_BACKEND_BASE_URL}${
            import.meta.env.VITE_BACKEND_ALLSCHEDULEDEMAILS_ROUTE
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
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

  const deleteSelectedEmails = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_REMOVESCHEDULEDEMAILS_ROUTE
        }`,
        {
          data: { ids: selectedEmails },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
    <div className="relative flex flex-col min-h-screen m-4">
      <div className="h-20 mb-4">
        {selectedEmails.length > 0 && (
          <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4">
            <p className="text-gray-50 mb-2">
              {selectedEmails.length} email(s) selected
            </p>
            <div className="flex gap-4">
              <button
                onClick={deleteSelectedEmails}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete Selected Emails
              </button>
              {/* {selectedEmails.length === 1 && (
                <button
                  onClick={editEmail}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Edit Selected Email
                </button>
              )} */}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-gray-50">
          <thead>
            <tr>
              <th className="py-2 px-4 text-center">Sender</th>
              <th className="py-2 px-4 text-center">Recipient Emails</th>
              <th className="py-2 px-4 text-center">Subject</th>
              <th className="py-2 px-4 text-center">Scheduled Date and Time</th>
              <th className="py-2 px-4 text-center">Status</th>
              <th className="py-2 px-4 text-center">Select</th>
            </tr>
          </thead>
          <tbody>
            {scheduledEmails.map((email) => (
              <tr key={email._id} className="border-t border-gray-700">
                <td className="py-2 px-4 text-center">{email.from}</td>
                <td className="py-2 px-4 text-center">{email.to}</td>
                <td className="py-2 px-4 text-center">{email.subject}</td>
                <td className="py-2 px-4 text-center">
                  {new Date(
                    new Date(email.sendAt).getTime()
                  ).toLocaleString()}
                </td>
                <td className="py-2 px-4 text-center">{email.status}</td>
                <td className="py-2 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(email._id)}
                    onChange={() => toggleEmailSelection(email._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scheduled;
