import { useState } from "react";
import { createPortal } from "react-dom";
import { FaTrash, FaCheckCircle, FaSignature, FaEdit, FaTimes, FaSave } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import NewPost from "./NewPost";

const SmtpSlotCard = ({ slot, onToggleStatus, onDelete, onVerify, getProviderIcon, getStatusIcon, onRefresh }) => {
  const [verifying, setVerifying] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signatureHtml, setSignatureHtml] = useState(slot.signature || '');

  const handleVerify = async () => {
    setVerifying(true);
    await onVerify(slot.slotNumber);
    setVerifying(false);
  };

  const handleSaveSignature = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/smtp/slot/${slot.slotNumber}/signature`,
        { signature: signatureHtml },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Signature saved!");
        setShowSignatureModal(false);
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data.message || "Failed to save signature");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save signature");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSignature = async () => {
    if (!confirm("Delete this signature?")) return;
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/smtp/slot/${slot.slotNumber}/signature`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Signature deleted");
        setSignatureHtml('');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      toast.error("Failed to delete signature");
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on backdrop, not its children
    if (e.target === e.currentTarget) {
      setShowSignatureModal(false);
    }
  };

  const showVerifyButton = slot.provider === 'custom' && !slot.isVerified && slot.status !== 'active';
  const canEditSignature = slot.isVerified && slot.status === 'active';
  const hasSignature = slot.signature && slot.signature.trim() !== '';

  // Signature Modal - rendered via portal to document.body
  const signatureModal = showSignatureModal ? createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-900 border border-orange-500/30 rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Compact */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50 bg-gray-800">
          <div className="flex items-center gap-2">
            <FaSignature className="text-orange-400 text-sm" />
            <div>
              <h2 className="text-sm font-semibold text-white">
                {hasSignature ? 'Edit' : 'Add'} Signature for Slot {slot.slotNumber}
              </h2>
              <p className="text-xs text-gray-400 truncate max-w-[300px]">{slot.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSignatureModal(false)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-all"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Modal Body - TipTap Editor */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="rounded-lg border border-gray-600/30 overflow-hidden">
            <NewPost setHtml={setSignatureHtml} initialContent={slot.signature || ''} />
          </div>
        </div>

        {/* Modal Footer - Compact */}
        <div className="flex gap-2 px-3 py-2 border-t border-gray-700/50 bg-gray-800">
          <button
            onClick={() => setShowSignatureModal(false)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 transition-all flex items-center justify-center gap-1"
          >
            <FaTimes className="text-xs" />
            Cancel
          </button>
          <button
            onClick={handleSaveSignature}
            disabled={saving}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <FaSave className="text-xs" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="bg-dark-900/40 border border-white/5 rounded-xl p-4 hover:border-primary-500/30 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getProviderIcon(slot.provider)}</span>
            <div>
              <p className="text-white font-medium text-sm">Slot {slot.slotNumber}</p>
              <p className="text-xs text-gray-400 capitalize">{slot.provider}</p>
            </div>
          </div>
          <span className="text-xl">{getStatusIcon(slot.status, slot.isVerified)}</span>
        </div>

        <p className="text-gray-300 text-sm mb-2 truncate" title={slot.email}>
          {slot.email}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>{slot.emailsSentToday}/{slot.dailyLimit}</span>
          <span className={`px-2 py-1 rounded ${slot.status === 'active'
            ? 'bg-green-500/20 text-green-400'
            : slot.status === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-gray-500/20 text-gray-400'
            }`}>
            {slot.status}
          </span>
        </div>

        {/* Show error message if exists */}
        {slot.errorLog?.lastError && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {slot.errorLog.lastError}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          {showVerifyButton && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <FaCheckCircle />
              {verifying ? 'Verifying...' : 'Verify SMTP'}
            </button>
          )}
          <button
            onClick={() => onToggleStatus(slot.slotNumber, slot.status)}
            disabled={showVerifyButton}
            className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-all ${showVerifyButton
              ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
          >
            {slot.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(slot.slotNumber)}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
          >
            <FaTrash />
          </button>
        </div>

        {/* Signature Buttons - After Activate/Deactivate, only for verified accounts */}
        {canEditSignature && (
          <div className="mt-2">
            {!hasSignature ? (
              <button
                onClick={() => setShowSignatureModal(true)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all flex items-center justify-center gap-1"
              >
                <FaSignature />
                Add Signature
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <FaEdit />
                  Edit Signature
                </button>
                <button
                  onClick={handleDeleteSignature}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <FaTrash />
                  Delete Signature
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal rendered via portal */}
      {signatureModal}
    </>
  );
};

export default SmtpSlotCard;