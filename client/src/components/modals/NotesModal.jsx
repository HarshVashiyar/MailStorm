import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdSave, MdClose, MdNote, MdInfo } from 'react-icons/md';

const NotesModal = ({ user, show, noteId, note, setNote, closeForm, updatedNoteInList }) => {
  const [originalNote, setOriginalNote] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialNote = user?.companyNotes || '';
    setNote(initialNote);
    setOriginalNote(initialNote);

    // Prevent background scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [user?.companyNotes, setNote]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(note !== originalNote);
  }, [note, originalNote]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      // Save and close on Escape
      if (hasUnsavedChanges) {
        handleUpdateNote();
      } else {
        closeForm();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleUpdateNote();
    }
  }, [hasUnsavedChanges, note, originalNote, noteId, updatedNoteInList, closeForm]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        closeForm();
      }
    } else {
      closeForm();
    }
  };

  const handleUpdateNote = async () => {
    const toastID = toast.loading("Updating note...");
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_COMPANY_NOTE_ROUTE
        }`,
        { id: noteId, companyNote: note.trim() },
        {
          withCredentials: true
        }
      );
      if (response.data?.success === true && response.status === 200) {
        toast.dismiss(toastID);
        setIsLoading(false);
        updatedNoteInList(noteId, note.trim());
        toast.success(response.data.message || "Note updated successfully!");
        closeForm();
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

  const characterCount = note.length;
  const maxCharacters = 2000;

  return (
    <div className="fixed inset-0 w-full h-screen bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 pt-24">
      <div className="bg-gray-900/80 backdrop-blur-lg border border-orange-500/20 rounded-3xl shadow-2xl shadow-orange-500/20 p-8 w-4/5 max-w-4xl max-h-[85vh] overflow-hidden relative group animate-glow">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-3 mb-2">
              <MdNote className="text-orange-400 text-3xl" />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Notes for {show ? user.fullName : user.companyName}
              </span>
            </h3>
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-300">
                Add notes and comments for this {show ? 'user' : 'company'}
              </p>
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-amber-400">
                  <MdInfo className="text-lg" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
            </div>
          </div>

          {/* Text area container */}
          <div className="flex-1 mb-6">
            <textarea
              className="w-full h-full min-h-[400px] bg-gray-800/60 backdrop-blur-sm text-white placeholder-gray-400 border border-orange-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-inner resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your notes here..."
              maxLength={maxCharacters}
            />

            {/* Character counter */}
            <div className="flex justify-between items-center mt-3 text-sm">
              <div className="text-gray-400">
                <span className={`${characterCount > maxCharacters * 0.9 ? 'text-amber-400' :
                    characterCount > maxCharacters * 0.95 ? 'text-orange-400' : 'text-gray-400'
                  }`}>
                  {characterCount}
                </span>
                <span className="text-gray-500"> / {maxCharacters} characters</span>
              </div>
              {/* <div className="text-gray-500 text-xs">
                Press Ctrl/Cmd + Enter or Escape to save and close
              </div> */}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-700/40 hover:bg-gray-600/40 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 flex items-center justify-center space-x-2"
            >
              <MdClose className="text-lg" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleUpdateNote}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 ${hasUnsavedChanges
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40'
                  : 'bg-gray-600/40 hover:bg-gray-500/40 text-gray-300 shadow-gray-500/10'
                }`}
            >
              <MdSave className="text-lg" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
