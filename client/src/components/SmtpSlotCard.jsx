import { FaTrash } from "react-icons/fa";

const SmtpSlotCard = ({ slot, onToggleStatus, onDelete, getProviderIcon, getStatusIcon }) => {
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
        <span className={`px-2 py-1 rounded ${
          slot.status === 'active' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {slot.status}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onToggleStatus(slot.slotNumber, slot.status)}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
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