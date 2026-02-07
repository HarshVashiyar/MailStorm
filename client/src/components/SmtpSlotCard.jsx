import { useState } from "react";
import { FaTrash, FaCheckCircle } from "react-icons/fa";

const SmtpSlotCard = ({ slot, onToggleStatus, onDelete, onVerify, getProviderIcon, getStatusIcon }) => {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await onVerify(slot.slotNumber);
    setVerifying(false);
  };

  const showVerifyButton = slot.provider === 'custom' && !slot.isVerified && slot.status !== 'active';

  return (
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
    </div>
  );
};

export default SmtpSlotCard;