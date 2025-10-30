import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewPost from "../components/NewPost";
import {
  FaEnvelope,
  FaCalendarAlt,
  FaEdit,
  FaPaperclip,
  FaClock,
  FaGlobeAmericas,
  FaUsers,
  FaPaperPlane,
  FaTimes,
  FaTrashAlt,
  // FaSparkles
} from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';

const EmailForm = ({
  setTypedEmail,
  closeForm,
  show,
  users,
  selectedUsers,
  savedLists,
  selectedSavedLists,
  schedule,
  mState,
}) => {
  const [manualEmails, setManualEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");
  const [signature, setSignature] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [loading, setLoading] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Fetch available templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      const toastId = toast.loading("Fetching email templates...");
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ALL_TEMPLATES_ROUTE}`,
          { withCredentials: true }
        );
        if (response.data?.success === true) {
          toast.dismiss(toastId);
          setLoading(false);
          const data = response.data.data || [];
          setAvailableTemplates(Array.isArray(data) ? data : []);
        } else {
          toast.error(response.data?.message || "Update failed.");
        }
      } catch (error) {
        toast.dismiss(toastId);
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
    fetchTemplates();
  }, []);

  // Handle template selection
  const handleTemplateSelect = async (templateName) => {
    if (!templateName) {
      setSelectedTemplate("");
      return;
    }

    const toastId = toast.loading("Loading email template...");
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_GET_TEMPLATE_ROUTE}?templateName=${encodeURIComponent(templateName)}`,
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        const template = response.data.data;
        toast.dismiss(toastId);
        setLoading(false);
        if (template) {
          setSubject(template.templateSubject);
          setHtml(template.templateContent);
          setSelectedTemplate(templateName);
          toast.success(`✅ Template "${templateName}" loaded!`);
        }
      } else {
        toast.dismiss(toastId);
        setLoading(false);
        toast.error(response.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.dismiss(toastId);
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

  const handleChange = (e) => {
    setManualEmails(e.target.value);
    setTypedEmail(e.target.value);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setAttachments((prevAttachments) => [...prevAttachments, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setAttachments((prevAttachments) => {
      const updatedAttachments = [...prevAttachments];
      updatedAttachments.splice(index, 1);
      return updatedAttachments;
    });
  };

  const getRecipientPeople = () => {
    let recipientPeople = [];

    if (selectedSavedLists.length === 1) {
      const selectedList = savedLists.find(
        (list) => list._id === selectedSavedLists[0]
      );
      if (selectedList) {
        recipientPeople = selectedList.listItems
          .map((item) => item.contactName)
          .filter(Boolean);
      }
    } else {
      recipientPeople = selectedUsers
        .map((id) => {
          const user = users.find((user) => user._id === id);
          return show ? user?.fullName : user?.companyContactPersonName;
        })
        .filter(Boolean);
    }
    return recipientPeople;
  };

  const getRecipientEmails = () => {
    let recipientEmails = [];

    if (selectedSavedLists.length === 1) {
      const selectedList = savedLists.find(
        (list) => list._id === selectedSavedLists[0]
      );
      if (selectedList) {
        recipientEmails = selectedList.listItems
          .map((item) => item.email)
          .filter(Boolean);
      }
    } else {
      recipientEmails = [
        ...selectedUsers.map((id) => {
          const user = users.find((user) => user._id === id);
          return show ? user?.email : user?.companyEmail;
        }),
        ...manualEmails.split(",").map((email) => email.trim()),
      ].filter(Boolean);
    }
    return recipientEmails;
  };

  const handleSendMail = async () => {
    const toastID = toast.loading(
      "Please wait while the email(s) are being sent..."
    );
    setLoading(true);
    const recipientPeople = getRecipientPeople();
    const recipientEmails = getRecipientEmails();

    if (recipientEmails.length === 0) {
      toast.dismiss(toastID);
      toast.error("No recipients specified.");
      return;
    }

    const formData = new FormData();
    formData.append("to", recipientEmails.join(","));
    formData.append("subject", subject);
    formData.append("recipientPeople", JSON.stringify(recipientPeople));
    formData.append("text", text);
    formData.append("html", html);
    formData.append("signature", signature);
    formData.append("mState", mState);

    attachments.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_SEND_MAIL_ROUTE}`,
        formData,
        {
          withCredentials: true
        }
      );
      if (response.data.success === true) {
        toast.dismiss(toastID);
        setLoading(false);
        toast.success(response.data.message);
        resetEmailForm();
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

  const postScheduledEmail = async () => {
    const toastID = toast.loading(
      "Please wait while the email is being scheduled..."
    );
    setLoading(true);
    const recipientPeople = getRecipientPeople();
    const recipientEmails = getRecipientEmails();

    if (recipientEmails.length === 0) {
      toast.dismiss(toastID);
      toast.error("No recipients specified.");
      return;
    }

    const formData = new FormData();
    formData.append("to", recipientEmails.join(","));
    formData.append("subject", subject);
    formData.append("recipientPeople", JSON.stringify(recipientPeople));
    formData.append("text", text);
    formData.append("html", html);
    formData.append("signature", signature);
    formData.append("sendAt", scheduledDateTime);
    formData.append("status", "Pending");
    formData.append("mState", mState);
    formData.append("timeZone", timeZone);

    attachments.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ADD_SCHEDULED_EMAIL_ROUTE}`,
        formData,
        {
          withCredentials: true
        }
      );
      if (response.data.success === true) {
        toast.dismiss(toastID);
        setLoading(false);
        toast.success(response.data.message);
        resetEmailForm();
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

  const resetEmailForm = () => {
    setManualEmails("");
    setSubject("");
    setText("");
    setHtml("");
    setSignature("");
    setAttachments([]);
    setScheduledDateTime("");
    closeForm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24"
      style={{ zIndex: 1100 }}
    >
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden border border-white/20 flex flex-col mt-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
                <span className="text-white">{schedule ? <FaCalendarAlt /> : <FaEnvelope />}</span>
                <span>{schedule ? 'Schedule Email' : 'Compose Email'}</span>
              </h3>
              <p className="text-gray-300 text-sm">
                {schedule ? 'Schedule your email to be sent at a specific time' : 'Create and send your email to selected recipients'}
              </p>
            </div>

            {/* Template Selector - Compact */}
            <div className="w-80">
              <label className="block text-white text-xs font-medium mb-2 flex items-center space-x-1">
                <MdDescription className="text-orange-400" />
                <span>Load Template:</span>
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                disabled={availableTemplates.length === 0}
              >
                {availableTemplates.length === 0 ? (
                  <option value="" className="bg-gray-800">No Templates Found</option>
                ) : (
                  <>
                    <option value="" className="bg-gray-800">Select a template...</option>
                    {availableTemplates.map((template) => (
                      <option key={template.templateName} value={template.templateName} className="bg-gray-800">
                        {template.templateName} - {template.templateSubject}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-4 text-sm text-blue-300">
            <span className="flex items-center space-x-1">
              <FaUsers />
              <span>{getRecipientEmails().length} recipients</span>
            </span>
            <span className="flex items-center space-x-1">
              <FaPaperclip />
              <span>{getRecipientPeople().length} contacts</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Subject Input */}
          <div>
            <label className="block text-white font-medium mb-3 flex items-center space-x-2">
              <FaEdit className="text-blue-400" />
              <span>Subject Line:</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter your email subject..."
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Email Content Editor */}
          <div>
            <label className="block text-white font-medium mb-3 flex items-center space-x-2">
              <FaEdit className="text-green-400" />
              <span>Email Content:</span>
            </label>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <NewPost setHtml={setHtml} initialContent={html} />
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-white font-medium mb-3 flex items-center space-x-2">
              <FaPaperclip className="text-orange-400" />
              <span>Attachments:</span>
            </label>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer flex items-center space-x-2">
                  <FaPaperclip />
                  <span>Choose Files</span>
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-gray-400 text-sm flex items-center space-x-1">
                  <FaPaperclip />
                  <span>{attachments.length} file(s) selected</span>
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attachments.map((file, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-white/10">
                      <div className="flex items-center space-x-3">
                        <FaPaperclip className="text-blue-300" />
                        <span className="text-white font-medium truncate">{file.name}</span>
                        <span className="text-gray-400 text-sm">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-1"
                      >
                        <FaTrashAlt />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          {schedule && (
            <div>
              <label className="block text-white font-medium mb-3 flex items-center space-x-2">
                <FaClock className="text-purple-400" />
                <span>Schedule Settings:</span>
              </label>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 flex items-center space-x-2">
                      <FaGlobeAmericas className="text-cyan-400" />
                      <span>Time Zone:</span>
                    </label>
                    <input
                      type="text"
                      value={timeZone}
                      disabled
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-gray-300 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 flex items-center space-x-2">
                      <FaCalendarAlt className="text-pink-400" />
                      <span>Schedule Date & Time:</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-6 border-t border-white/10">
          <button
            onClick={resetEmailForm}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center justify-center space-x-2"
          >
            <FaTimes />
            <span>Cancel</span>
          </button>

          {schedule ? (
            <button
              onClick={postScheduledEmail}
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <FaCalendarAlt />
              <span>Schedule Email</span>
            </button>
          ) : (
            <button
              onClick={handleSendMail}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              {/* <FaSparkles /> */}
              <span>Send Email</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailForm;
