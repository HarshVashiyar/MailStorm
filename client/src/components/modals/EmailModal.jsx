import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewPost from "../NewPost";
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
  FaMagic
} from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';

const EmailModal = ({
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
  const [formalityLevel, setFormalityLevel] = useState("neutral");
  const [formalityLevelForContent, setFormalityLevelForContent] = useState("neutral");
  const [enhancingSubject, setEnhancingSubject] = useState(false);
  const [generatingHTML, setGeneratingHTML] = useState(false);

  // Resizer refs/state for left/right columns
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startRightWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const [rightWidth, setRightWidth] = useState(280); // px default
  const MIN_RIGHT = 200; // px
  const MIN_LEFT = 320; // px

  const [smtpSlots, setSmtpSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch available SMTP slots on mount
  useEffect(() => {
    const fetchSmtpSlots = async () => {
      setLoadingSlots(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}smtp/slots`,
          { withCredentials: true }
        );
        if (response.data?.success === true) {
          setSmtpSlots(response.data.data.slots || []);
          // Auto-select first active slot
          const activeSlot = response.data.data.slots.find(
            slot => slot.status === 'active' && slot.isVerified
          );
          if (activeSlot) setSelectedSlot(activeSlot.slotNumber);
        }
      } catch (error) {
        console.error("Error fetching SMTP slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSmtpSlots();
  }, []);

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

  const handleEnhanceSubject = async () => {
    if (!subject || subject.trim().split(/\s+/).length < 2) {
      toast.error("Please enter at least two words in the subject.");
      return;
    }

    const toastId = toast.loading("Enhancing subject with AI...");
    setEnhancingSubject(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_ENHANCE_SUBJECT_ROUTE}`,
        {
          subject: subject,
          formalityLevel: formalityLevel
        },
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastId);
        setEnhancingSubject(false);
        setSubject(response.data.enhancedSubject);
        toast.success("✨ Subject enhanced successfully!");
      } else {
        toast.dismiss(toastId);
        setEnhancingSubject(false);
        toast.error(response.data?.message || "Enhancement failed.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      setEnhancingSubject(false);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : "An error occurred.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleGenerateHTML = async () => {
    if (!subject || subject.trim().split(/\s+/).length < 2) {
      toast.error("Please enter at least two words in the subject.");
      return;
    }

    const toastId = toast.loading("Generating email content with AI...");
    setGeneratingHTML(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_GENERATE_HTML_ROUTE}`,
        {
          enhancedSubject: subject,
          formalityLevel: formalityLevelForContent
        },
        { withCredentials: true }
      );
      if (response.data?.success === true) {
        toast.dismiss(toastId);
        setGeneratingHTML(false);
        
        // Clean up the HTML content by removing any markdown code blocks
        let cleanHTML = response.data.HTMLContent;
        cleanHTML = cleanHTML.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/g, '').trim();
        
        setHtml(cleanHTML);
        toast.success("✨ Email content generated successfully!");
      } else {
        toast.dismiss(toastId);
        setGeneratingHTML(false);
        toast.error(response.data?.message || "Generation failed.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      setGeneratingHTML(false);
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

  // Resizer handlers
  const onPointerMove = (clientX) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // new right width based on distance from mouse to right edge
    let newRight = Math.round(rect.right - clientX);
    const maxRight = rect.width - MIN_LEFT;
    if (newRight < MIN_RIGHT) newRight = MIN_RIGHT;
    if (newRight > maxRight) newRight = Math.max(MIN_RIGHT, maxRight);
    setRightWidth(newRight);
  };

  const handleMouseMove = (e) => {
    if (!draggingRef.current) return;
    onPointerMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!draggingRef.current) return;
    if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX);
  };

  const stopDrag = () => {
    draggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', stopDrag);
  };

  const startDrag = (clientX) => {
    const container = containerRef.current;
    if (!container) return;
    draggingRef.current = true;
    startXRef.current = clientX;
    startRightWidthRef.current = rightWidth;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stopDrag);
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
          .map((item) => item.contactEmail)
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

    if (selectedSlot) {
      const slot = smtpSlots.find(s => s.slotNumber === selectedSlot);
      if (slot) formData.append("smtpSlotId", slot._id);
    }

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

    if (selectedSlot) {
      const slot = smtpSlots.find(s => s.slotNumber === selectedSlot);
      if (slot) formData.append("smtpSlotId", slot._id);
    }

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 pt-20"
      style={{ zIndex: 1100 }}
    >
      <div className="bg-white/10 backdrop-blur-lg p-3 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/20 flex flex-col mt-3">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2 mb-1">
                <span className="text-white">{schedule ? <FaCalendarAlt /> : <FaEnvelope />}</span>
                <span className="text-sm md:text-base">{schedule ? 'Schedule Email' : 'Compose Email'}</span>
              </h3>
              <p className="text-gray-300 text-xs">
                {schedule ? 'Schedule your email to be sent at a specific time' : 'Create and send your email to selected recipients'}
              </p>
            </div>

            {/* Template Selector - Compact */}
            <div className="w-64">
              <label className="text-white text-xs font-medium mb-1 flex items-center space-x-1">
                <MdDescription className="text-orange-400" />
                <span className="text-xs">Load Template:</span>
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
          <div className="mt-2 flex items-center space-x-3 text-xs text-blue-300">
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

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-3" ref={containerRef}>
            {/* Left column: Subject + Content */}
            <div className="flex-1 space-y-3 min-w-0">
              {/* Subject Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-white font-medium text-sm">
                    <FaEdit className="text-blue-400" />
                    <span>Subject:</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formalityLevel}
                      onChange={(e) => setFormalityLevel(e.target.value)}
                      disabled={!subject || subject.trim().split(/\s+/).length < 2 || enhancingSubject}
                      className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Informal- e.g., friend or close peer">Informal</option>
                      <option value="Neutral - e.g., colleague or vendor">Neutral</option>
                      <option value="Formal - e.g., boss or client">Formal</option>
                    </select>
                    <button
                      onClick={handleEnhanceSubject}
                      disabled={!subject || subject.trim().split(/\s+/).length < 2 || enhancingSubject}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaMagic className={enhancingSubject ? "animate-spin" : ""} />
                      <span className="text-xs">{enhancingSubject ? "Enhancing" : "Enhance"}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter your email subject..."
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>

              {/* Email Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-white font-medium text-sm">
                    <FaEdit className="text-green-400" />
                    <span>Content:</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formalityLevelForContent}
                      onChange={(e) => setFormalityLevelForContent(e.target.value)}
                      disabled={!subject || subject.trim().split(/\s+/).length < 2 || generatingHTML}
                      className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Informal- e.g., friend or close peer">Informal</option>
                      <option value="Neutral - e.g., colleague or vendor">Neutral</option>
                      <option value="Formal - e.g., boss or client">Formal</option>
                    </select>
                    <button
                      onClick={handleGenerateHTML}
                      disabled={!subject || subject.trim().split(/\s+/).length < 2 || generatingHTML}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaMagic className={generatingHTML ? "animate-spin" : ""} />
                      <span className="text-xs">{generatingHTML ? "Generating" : "Generate"}</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                  <NewPost setHtml={setHtml} initialContent={html} />
                </div>
              </div>
            </div>

            {/* Divider (draggable) - visible on md and up */}
            <div
              className="hidden md:flex items-stretch"
              style={{ alignItems: 'stretch' }}
            >
              <div
                onMouseDown={(e) => startDrag(e.clientX)}
                onTouchStart={(e) => startDrag(e.touches[0].clientX)}
                className="w-2 cursor-col-resize hover:bg-white/10 bg-transparent"
                title="Drag to resize"
              />
            </div>

            {/* Right column: Schedule (optional) + Attachments */}
            <div className="w-full flex-shrink-0 flex flex-col gap-3 min-w-0" style={{ width: rightWidth }}>
              {schedule && (
                <div>
                  <label className="text-white font-medium mb-3 flex items-center space-x-2">
                    <FaClock className="text-purple-400" />
                    <span>Schedule Settings:</span>
                  </label>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-white font-medium mb-2 flex items-center space-x-2 text-sm">
                          <FaGlobeAmericas className="text-cyan-400" />
                          <span>Time Zone:</span>
                        </label>
                        <input
                          type="text"
                          value={timeZone}
                          disabled
                          className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 transition-all duration-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-white font-medium mb-2 flex items-center space-x-2 text-sm">
                          <FaCalendarAlt className="text-pink-400" />
                          <span>Schedule Date & Time:</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SMTP Slot Selection */}
              <div>
                <label className="text-white font-medium mb-2 flex items-center space-x-2 text-sm">
                  <FaEnvelope className="text-blue-400" />
                  <span>Slot:</span>
                </label>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((slotNum) => {
                      const slot = smtpSlots.find(s => s.slotNumber === slotNum);
                      const isActive = slot?.status === 'active' && slot?.isVerified;
                      const isDisabled = !slot || !isActive;

                      return (
                        <button
                          key={slotNum}
                          onClick={() => !isDisabled && setSelectedSlot(slotNum)}
                          disabled={isDisabled || loadingSlots}
                          className={`
              px-2 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow text-xs
              ${selectedSlot === slotNum
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white ring-2 ring-white/50'
                              : isDisabled
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                            }
            `}
                          title={slot ? `${slot.email} (${slot.emailsSentToday}/${slot.dailyLimit})` : 'Empty slot'}
                        >
                          {slotNum}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSlot && smtpSlots.find(s => s.slotNumber === selectedSlot) && (
                    <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white text-xs truncate">
                        {smtpSlots.find(s => s.slotNumber === selectedSlot)?.email}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {smtpSlots.find(s => s.slotNumber === selectedSlot)?.emailsSentToday || 0}/
                        {smtpSlots.find(s => s.slotNumber === selectedSlot)?.dailyLimit || 0} sent today
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments Section (always visible in right column) */}
              <div>
                <label className="text-white font-medium mb-2 flex items-center space-x-2 text-sm">
                  <FaPaperclip className="text-orange-400" />
                  <span>Attachments:</span>
                </label>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow cursor-pointer flex items-center space-x-2 text-sm">
                      <FaPaperclip />
                      <span>Choose Files</span>
                      <input type="file" multiple onChange={handleFileChange} className="hidden" />
                    </label>
                    <span className="text-gray-400 text-xs flex items-center space-x-1">
                      <FaPaperclip />
                      <span>{attachments.length} file(s)</span>
                    </span>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {attachments.map((file, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between border border-white/10 min-w-0 overflow-hidden">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FaPaperclip className="text-blue-300 flex-shrink-0" />
                            <span className="text-white font-medium truncate text-sm">{file.name}</span>
                            <span className="text-gray-400 text-xs flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-1 py-0.5 rounded-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-1 text-xs"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-4 border-t border-white/10">
          <button
            onClick={resetEmailForm}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center justify-center space-x-2 text-sm"
          >
            <FaTimes />
            <span>Cancel</span>
          </button>

          {schedule ? (
            <button
              onClick={postScheduledEmail}
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow flex items-center justify-center space-x-2 text-sm"
            >
              <FaCalendarAlt />
              <span>Schedule</span>
            </button>
          ) : (
            <button
              onClick={handleSendMail}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow flex items-center justify-center space-x-2 text-sm"
            >
              <span>Send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
