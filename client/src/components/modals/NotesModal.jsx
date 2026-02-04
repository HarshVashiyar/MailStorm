import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdNote, MdInfo } from 'react-icons/md';

const NotesModal = ({ user, show, noteId, note, setNote, closeForm, updatedNoteInList }) => {
  const [originalNote, setOriginalNote] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize note state on mount only
  useEffect(() => {
    const initialNote = user?.companyNotes || '';
    setNote(initialNote);
    setOriginalNote(initialNote);
  }, [user?.companyNotes]);

  // Use refs to track current values for the event listener
  const noteRef = useRef(note);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Keep refs in sync with state
  useEffect(() => {
    noteRef.current = note;
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [note, hasUnsavedChanges]);

  // Save and close function
  const saveAndClose = async () => {
    if (!hasUnsavedChangesRef.current) {
      closeForm();
      return;
    }
    const toastID = toast.loading("Saving note...");
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${import.meta.env.VITE_UPDATE_COMPANY_NOTE_ROUTE}`,
        { id: noteId, companyNote: noteRef.current.trim() },
        { withCredentials: true }
      );
      if (response.data?.success === true && response.status === 200) {
        toast.dismiss(toastID);
        updatedNoteInList(noteId, noteRef.current.trim());
        toast.success(response.data.message || "Note saved!");
        closeForm();
      } else {
        toast.dismiss(toastID);
        toast.error(response.data?.message || "Save failed.");
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent body scroll and handle keyboard shortcuts
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = async (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        await saveAndClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeForm, noteId, updatedNoteInList]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(note !== originalNote);
  }, [note, originalNote]);

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
              <div className="text-gray-500 text-xs flex items-center space-x-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 bg-gray-700/50 border border-gray-600/50 rounded text-gray-400 text-xs font-mono">ESC</kbd>
                <span>to close{hasUnsavedChanges ? ' and save changes' : ''}</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default NotesModal;
