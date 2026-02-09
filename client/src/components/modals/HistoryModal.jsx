import { useEffect, useState } from 'react'
import { MdClose, MdEmail } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HistoryModal = ({ user, show, close, id }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Combined effect for initialization and keyboard handling
    useEffect(() => {
        if (!show) return;

        if (user) {
            setHistory(user.history || []);
        }

        // Prevent background scroll when modal is open
        document.body.style.overflow = "hidden";

        // Keyboard shortcut for Escape
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = "auto";
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, user, close]);

    const handleClose = () => {
        close();
    };

    if (!show) return null;

    // Filter history based on search term
    const filteredHistory = history.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const subject = item.subject?.toLowerCase() || '';
        const date = new Date(item.lastSent);
        const sendDate = date.toLocaleDateString().toLowerCase();
        const sendTime = date.toLocaleTimeString().toLowerCase();
        return subject.includes(searchLower) || sendDate.includes(searchLower) || sendTime.includes(searchLower);
    });

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 pt-24"
            style={{ zIndex: 1050 }}
        >
            <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-4xl border border-orange-500/20 max-h-[85vh] overflow-hidden flex flex-col animate-glow">
                {/* Header with Search Bar */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
                            <MdEmail className="text-orange-400 text-4xl" />
                            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                                Email History
                            </span>
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                            View all sent emails for {user?.companyName || user?.fullName}
                        </p>
                        <p className="text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-2 inline-block">
                            💡 Always refresh the page to see updated history
                        </p>
                    </div>
                    {/* Search Bar - Top Right */}
                    <div className="w-80">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-3 pr-10 py-2 bg-gray-900 backdrop-blur-sm border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 text-xl z-10 cursor-pointer"
                                    title="Clear search"
                                >
                                    <MdClose />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Table Container */}
                <div className="flex-1 overflow-auto mb-4">
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-orange-500/20 overflow-hidden">
                        <table className="w-full text-white">
                            <thead className="bg-gradient-to-r from-orange-600/30 to-amber-600/30 backdrop-blur-sm">
                                <tr>
                                    <th className="py-4 px-6 text-left font-semibold">
                                        <div className="flex items-center space-x-2">
                                            <MdEmail className="text-orange-400" />
                                            <span>Subject</span>
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-left font-semibold">
                                        <div className="flex items-center space-x-2">
                                            <span>Send Time</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-500/10">
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="py-12 px-6 text-center text-gray-300">
                                            <div className="flex flex-col items-center space-y-3">
                                                <MdEmail className="text-6xl text-gray-500" />
                                                <p className="text-xl font-medium">
                                                    {history.length === 0 ? 'No email history found' : 'No Results Found'}
                                                </p>
                                                <p className="text-sm">
                                                    {history.length === 0
                                                        ? 'No emails have been sent yet'
                                                        : 'Try adjusting your search'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((item, index) => (
                                        <tr
                                            key={`${item.lastSent}-${index}`}
                                            className={`transition-all duration-300 hover:bg-orange-500/5 ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-transparent'
                                                }`}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="truncate font-medium text-orange-300" title={item.subject}>
                                                    {item.subject || 'No subject'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-gray-300 text-sm">
                                                    {new Date(item.lastSent).toLocaleDateString()} at{' '}
                                                    {new Date(item.lastSent).toLocaleTimeString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Footer */}
                <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-3 border-t border-orange-500/20 rounded-b-xl mb-4">
                    <div className="text-sm text-gray-300">
                        <span>Total: {history.length} emails</span>
                        {searchTerm && <span className="ml-4">Showing: {filteredHistory.length} results</span>}
                    </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleClose}
                        className="bg-gray-700/40 hover:bg-gray-600/40 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2"
                    >
                        <MdClose className="text-lg" />
                        <span>Close</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HistoryModal