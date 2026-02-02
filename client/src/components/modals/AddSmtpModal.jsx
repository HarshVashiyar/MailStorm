import { useState } from "react";
import { FaGoogle, FaMicrosoft, FaServer } from "react-icons/fa";
import { toast } from "react-toastify";
import AddCustomSmtp from "./AddCustomSmtp";

const AddSmtpModal = ({ show, onClose, selectedSlot, onConnectOAuth, onSmtpAdded }) => {
  const [showCustomSmtpModal, setShowCustomSmtpModal] = useState(false);

  if (!show) return null;

  const handleCustomSmtp = () => {
    setShowCustomSmtpModal(true);
  };

  const handleCustomSmtpClose = () => {
    setShowCustomSmtpModal(false);
  };

  const handleCustomSmtpAdded = (data) => {
    setShowCustomSmtpModal(false);
    if (onSmtpAdded) {
      onSmtpAdded(data);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-2">
            Add Email Account
          </h3>
          <p className="text-gray-400 text-sm mb-6">Slot {selectedSlot}</p>

          <div className="space-y-3">
            <button
              onClick={() => {
                onConnectOAuth('google');
              }}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-white hover:bg-gray-100 transition-all text-gray-800 font-medium"
            >
              <FaGoogle className="text-xl text-red-500" />
              Connect Gmail
            </button>

            <button
              // onClick={() => onConnectOAuth('microsoft')}
              onClick={() => {
                onConnectOAuth('microsoft');
              }}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all text-white font-medium"
            >
              <FaMicrosoft className="text-xl" />
              Connect Outlook
            </button>

            {/* <button
              // onClick={() => onConnectOAuth('yahoo')}
              onClick={() => {
                toast.info("Yahoo OAuth coming soon!");
              }}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all text-white font-medium"
            >
              <FaYahoo className="text-xl" />
              Connect Yahoo
            </button> */}

            <button
              onClick={handleCustomSmtp}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-green-600 hover:bg-green-700 transition-all text-white font-medium"
            >
              <FaServer className="text-xl" />
              Custom SMTP
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all text-white font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Custom SMTP Modal */}
      <AddCustomSmtp
        show={showCustomSmtpModal}
        onClose={handleCustomSmtpClose}
        selectedSlot={selectedSlot}
        onSmtpAdded={handleCustomSmtpAdded}
      />
    </>
  );
};

export default AddSmtpModal;