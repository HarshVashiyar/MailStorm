import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewPost from "../components/NewPost";

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
    resetEmailForm();
    const toastID = toast.loading(
      "Please wait while the email(s) are being sent..."
    );
    const recipientPeople = getRecipientPeople();
    const recipientEmails = getRecipientEmails();

    if (recipientEmails.length === 0) {
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
        `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_BACKEND_SENDMAIL_ROUTE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.dismiss(toastID);
      toast.success(response.data.message);
    } catch (error) {
      toast.dismiss(toastID);
      console.error("Error sending email:", error);
      toast.error(error.response?.data?.message || "Failed to send email.");
    }
  };

  const postScheduledEmail = async () => {
    console.log(timeZone);
    resetEmailForm();
    const toastID = toast.loading(
      "Please wait while the email is being scheduled..."
    );
    const recipientPeople = getRecipientPeople();
    const recipientEmails = getRecipientEmails();

    if (recipientEmails.length === 0) {
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
    formData.append("status", "pending");
    formData.append("mState", mState);
    formData.append("timeZone", timeZone);

    console.log(scheduledDateTime);

    attachments.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_BACKEND_ADDSCHEDULEDEMAIL_ROUTE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.dismiss(toastID);
      setScheduledDateTime("");
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.dismiss(toastID);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
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
      className="absolute top-0 left-0 w-full min-h-screen bg-gray-800 bg-opacity-80 flex items-start justify-center z-40"
      style={{ zIndex: 1100 }}
    >
      <div className="bg-gray-700 p-6 rounded-lg shadow-md w-4/5 max-w-7xl max-h-[95vh] overflow-y-auto mt-4">
        <div className="mb-4">
          {/* <label className="text-gray-50">Subject:</label> */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="w-full px-3 py-2 rounded mt-2 text-slate-300 bg-slate-900"
          />
        </div>

        <div className="mb-4">
          {/* <label className="text-gray-50">Text Content:</label> */}
          {/* <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter plain text content"
            className="w-full min-h-[20rem] px-3 py-2 rounded mt-2 text-slate-300 bg-slate-900"
          /> */}
          <NewPost setHtml={setHtml} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-gray-50">Attachments:</label>
            <input type="file" multiple onChange={handleFileChange} className="ml-2" />
          </div>

          {schedule && (
            <div className="flex items-center gap-4">
              <div>
                <label className="text-gray-50">Time Zone:</label>
                <input
                  type="text"
                  value={timeZone}
                  disabled
                  className="w-full px-3 py-2 rounded mt-2 bg-slate-900 text-slate-300"
                />
              </div>
              <div>
                <label className="text-gray-50">Schedule Date and Time:</label>
                <input
                  type="datetime-local"
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded mt-2"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {schedule ? (
              <button
                onClick={postScheduledEmail}
                className="bg-green-500 text-white py-2 px-4 rounded ml-3 hover:bg-green-600"
              >
                Schedule Email
              </button>
            ) : (
              <button
                onClick={handleSendMail}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Send Email
              </button>
            )}

            <button
              onClick={resetEmailForm}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>

        <ul className="mt-4 max-h-28 overflow-y-auto text-slate-300 bg-slate-900 px-2 py-1 rounded">
          {attachments.map((file, index) => (
            <li key={index} className="text-gray-50 flex justify-between">
              {file.name}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 ml-4"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmailForm;
