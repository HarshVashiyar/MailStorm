import { FaPlus } from "react-icons/fa";

const EmptySlotCard = ({ slotNumber, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-dark-900/20 border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary-500/50 transition-all cursor-pointer group"
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
        <FaPlus className="text-3xl text-gray-600 group-hover:text-primary-500 mb-2 transition-colors" />
        <p className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors">
          Add Account
        </p>
        <p className="text-gray-600 text-xs">Slot {slotNumber}</p>
      </div>
    </div>
  );
};

export default EmptySlotCard;