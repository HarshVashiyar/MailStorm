import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notes = ({ user, show, noteId, note, setNote, closeForm, updatedNoteInList }) => {
  useEffect(() => {
    if (user?.companyNotes) {
      setNote(user.companyNotes);
    }

    // Prevent background scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [user?.companyNotes, setNote]);

  const handleUpdateNote = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${
          import.meta.env.VITE_BACKEND_UPDATECOMPANYNOTE_ROUTE
        }`,
        { id: noteId, companyNote: note.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      updatedNoteInList(noteId, note.trim());
      closeForm();
      toast.success(response.data.message || "Note updated successfully!");
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error(
        error.response?.data?.message || "Failed to update the note."
      );
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-gray-800 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-700 mt-20 p-6 rounded-lg shadow-md w-4/5 max-w-7xl overflow-x-auto">
        <div className="mb-4">
          <label className="text-gray-50">
            Notes for {show ? user.fullName : user.companyName}:
          </label>
          <textarea
            className="w-full min-h-[30rem] px-3 text-slate-300 py-2 text-xl rounded mt-2 bg-slate-900"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleUpdateNote}
            className="bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700"
          >
            Done
          </button>
          <button
            onClick={closeForm}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
