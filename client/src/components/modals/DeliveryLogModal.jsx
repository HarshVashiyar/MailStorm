import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import {
    MdClose,
    MdBarChart,
    MdSearch,
    MdSchedule,
    MdRefresh,
    MdSend,
    MdCheckCircle,
    MdCancel,
    MdHourglassEmpty,
    MdDelete,
} from 'react-icons/md';
import InlinePagination from '../common/InlinePagination';

// ─── Status badge ─────────────────────────────────────────────────────────────

const SCHEDULED_STATUS = {
    Pending: { bg: 'bg-yellow-500/20 border-yellow-500/30', text: 'text-yellow-400' },
    Processing: { bg: 'bg-blue-500/20   border-blue-500/30', text: 'text-blue-400' },
    Sent: { bg: 'bg-green-500/20  border-green-500/30', text: 'text-green-400' },
    'Partially Sent': { bg: 'bg-orange-500/20 border-orange-500/30', text: 'text-orange-400' },
    Failed: { bg: 'bg-red-500/20    border-red-500/30', text: 'text-red-400' },
};
const BULK_STATUS = {
    queued: { bg: 'bg-gray-500/20   border-gray-500/30', text: 'text-gray-400' },
    processing: { bg: 'bg-blue-500/20   border-blue-500/30', text: 'text-blue-400' },
    sent: { bg: 'bg-green-500/20  border-green-500/30', text: 'text-green-400' },
    partially_sent: { bg: 'bg-orange-500/20 border-orange-500/30', text: 'text-orange-400' },
    failed: { bg: 'bg-red-500/20    border-red-500/30', text: 'text-red-400' },
};

const StatusBadge = ({ status, type }) => {
    const map = type === 'bulk' ? BULK_STATUS : SCHEDULED_STATUS;
    const s = map[status] ?? { bg: 'bg-gray-500/20 border-gray-500/30', text: 'text-gray-400' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap capitalize ${s.bg} ${s.text}`}>
            {(status ?? '').replace(/_/g, ' ')}
        </span>
    );
};

// ─── Mini delivery bar for a single row ──────────────────────────────────────

const DeliveryBar = ({ summary }) => {
    const { total = 0, sent = 0, failed = 0, pending = 0, skipped = 0 } = summary ?? {};
    if (total === 0) return <span className="text-gray-600 text-xs">—</span>;
    const sentPct = Math.round((sent / total) * 100);
    const failedPct = Math.round((failed / total) * 100);
    const skippedPct = Math.round((skipped / total) * 100);
    return (
        <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="w-full h-1 rounded-full bg-gray-700/60 overflow-hidden flex">
                <div className="h-full bg-green-500" style={{ width: `${sentPct}%` }} />
                <div className="h-full bg-red-500" style={{ width: `${failedPct}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${skippedPct}%` }} />
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
                {sent > 0 && <span className="inline-flex items-center gap-0.5 text-green-400"><MdCheckCircle className="text-xs" />{sent}</span>}
                {failed > 0 && <span className="inline-flex items-center gap-0.5 text-red-400"><MdCancel className="text-xs" />{failed}</span>}
                {skipped > 0 && <span className="inline-flex items-center gap-0.5 text-amber-400" title="This recipient has unsubscribed from you">⚠️{skipped}</span>}
                {pending > 0 && <span className="inline-flex items-center gap-0.5 text-yellow-400"><MdHourglassEmpty className="text-xs" />{pending}</span>}
                <span className="text-gray-500">/ {total}</span>
            </div>
        </div>
    );
};

// ─── Job list (shared for both tabs) ─────────────────────────────────────────

const JobListView = ({ type }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const itemsPerPage = 5;
    const isScheduled = type === 'scheduled';

    const deleteSelectedJob = async () => {
        if (!selectedJobId) return;
        const toastID = toast.loading("Deleting scheduled email...");
        try {
            const res = await api.scheduledEmails.delete([selectedJobId]);
            if (res.data.success) {
                toast.dismiss(toastID);
                toast.success(res.data.message || 'Deleted successfully');
                setSelectedJobId(null);
                fetchAll();
            } else {
                toast.dismiss(toastID);
                toast.error(res.data?.message || 'Failed to delete');
            }
        } catch (err) {
            toast.dismiss(toastID);
            toast.error(err.response?.data?.message || err.message || 'Error deleting scheduled email');
        }
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const res = isScheduled
                ? await api.scheduledEmails.getAll()
                : await api.bulkJobs.getAll();
            if (res.data.success) setJobs(res.data.data ?? []);
            else toast.error(res.data.message || 'Failed to load jobs');
        } catch {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [isScheduled]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        if (isScheduled && selectedJobId) {
            const selected = jobs.find(j => j._id === selectedJobId);
            if (!selected || selected.status !== 'Pending') {
                setSelectedJobId(null);
            }
        }
    }, [jobs, isScheduled, selectedJobId]);

    const filtered = jobs.filter(j => {
        const q = search.toLowerCase();
        const dateStr = new Date(isScheduled ? j.sendAt : j.createdAt).toLocaleString().toLowerCase();
        return (
            (j.subject ?? '').toLowerCase().includes(q) ||
            (j.from ?? '').toLowerCase().includes(q) ||
            (j.status ?? '').toLowerCase().includes(q) ||
            dateStr.includes(q)
        );
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedJobs = filtered.slice(startIndex, startIndex + itemsPerPage);

    const pagination = {
        page: currentPage,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-9 w-9 border-2 border-orange-400 border-t-transparent" />
                <span className="text-sm">Loading…</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Search + Refresh */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Search subject, sender, status…"
                        className="w-full pl-9 pr-9 py-2 bg-gray-800/60 border border-orange-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm"
                    />
                    {search && (
                        <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            <MdClose />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
                    {isScheduled && selectedJobId && (
                        <button
                            onClick={deleteSelectedJob}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-xl transition-colors border border-red-500/20 shrink-0 h-[38px] text-sm font-medium"
                            title="Delete selected scheduled email"
                        >
                            <MdDelete className="text-lg" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                    <div className="flex items-center bg-gray-800/60 border border-orange-500/20 rounded-xl px-2 shrink-0 h-[38px]">
                        <InlinePagination pagination={pagination} onPageChange={setCurrentPage} />
                    </div>
                    <button onClick={fetchAll} title="Refresh" className="p-2 rounded-xl text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors border border-orange-500/20 shrink-0 h-[38px] flex items-center justify-center bg-gray-800/60">
                        <MdRefresh className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-2xl border border-orange-500/15">
                <table className="w-full text-white text-sm">
                    <thead className="bg-gradient-to-r from-orange-600/25 to-amber-600/25 sticky top-0">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold">Subject</th>
                            <th className="py-3 px-4 text-left font-semibold hidden sm:table-cell">Sender</th>
                            <th className="py-3 px-4 text-left font-semibold hidden md:table-cell">
                                {isScheduled ? 'Scheduled At' : 'Sent At'}
                            </th>
                            <th className="py-3 px-4 text-center font-semibold w-28">Status</th>
                            <th className="py-3 px-4 text-left font-semibold">Delivery</th>
                            {isScheduled && <th className="py-3 px-4 text-center font-semibold w-12">Select</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-500/10">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={isScheduled ? "6" : "5"} className="py-14 text-center text-gray-400">
                                    {isScheduled
                                        ? <MdSchedule className="text-5xl mx-auto mb-2 text-gray-600" />
                                        : <MdSend className="text-5xl mx-auto mb-2 text-gray-600" />}
                                    <p>{search ? 'No results match your search' : `No ${isScheduled ? 'scheduled emails' : 'direct sends'} found`}</p>
                                </td>
                            </tr>
                        ) : paginatedJobs.map((job, i) => (
                            <tr
                                key={job._id}
                                className={`transition-all duration-200 hover:bg-orange-500/5 ${isScheduled && selectedJobId === job._id ? 'bg-orange-500/10 shadow-[inset_2px_0_0_0_#f97316]' : i % 2 === 0 ? 'bg-gray-800/20' : ''}`}
                                onClick={() => {
                                    if (isScheduled && job.status === 'Pending') {
                                        setSelectedJobId(selectedJobId === job._id ? null : job._id);
                                    }
                                }}
                                style={{ cursor: isScheduled && job.status === 'Pending' ? 'pointer' : 'default' }}
                            >
                                <td className="py-3 px-4">
                                    <div className="font-medium text-white truncate max-w-[200px]" title={job.subject}>
                                        {job.subject || '—'}
                                    </div>
                                </td>
                                <td className="py-3 px-4 hidden sm:table-cell">
                                    <span className="text-gray-300 truncate block max-w-[150px]" title={job.from}>{job.from || '—'}</span>
                                </td>
                                <td className="py-3 px-4 hidden md:table-cell text-gray-300 text-xs">
                                    {new Date(isScheduled ? job.sendAt : job.createdAt).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <StatusBadge status={job.status} type={type} />
                                </td>
                                <td className="py-3 px-4">
                                    <DeliveryBar summary={job.deliverySummary} />
                                </td>
                                {isScheduled && (
                                    <td className="py-3 px-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedJobId === job._id}
                                            disabled={job.status !== 'Pending'}
                                            onChange={() => setSelectedJobId(selectedJobId === job._id ? null : job._id)}
                                            className="w-4 h-4 mt-1 accent-orange-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 px-1">
                <span>
                    Showing {paginatedJobs.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} {search ? 'filtered ' : ''}{isScheduled ? 'scheduled emails' : 'direct sends'}
                </span>
                <span>
                    {jobs.length} total records
                </span>
            </div>
        </>
    );
};

// ─── Main modal ───────────────────────────────────────────────────────────────

const TABS = [
    { id: 'scheduled', label: 'Scheduled', icon: <MdSchedule /> },
    { id: 'bulk', label: 'Direct Sends', icon: <MdSend /> },
];

const DeliveryLogModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('scheduled');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[1050] p-6 pt-24"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl shadow-orange-500/20 w-full max-w-5xl border border-orange-500/20 max-h-[85vh] overflow-hidden flex flex-col animate-glow">

                {/* Header + Tabs */}
                <div className="p-6 pb-0 border-b border-orange-500/15">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2 mb-1">
                                <MdBarChart className="text-orange-400 text-3xl" />
                                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                                    Email Delivery Dashboard
                                </span>
                            </h3>
                            <p className="text-gray-400 text-sm">Overall job statuses for all your email sends</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors mt-1" title="Close">
                            <MdClose className="text-2xl" />
                        </button>
                    </div>

                    <div className="flex gap-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30 border-b-transparent'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4">
                    {activeTab === 'scheduled'
                        ? <JobListView key="scheduled" type="scheduled" />
                        : <JobListView key="bulk" type="bulk" />
                    }
                </div>

                {/* Footer */}
                <div className="p-4 pt-0 flex justify-end border-t border-orange-500/10">
                    <button
                        onClick={onClose}
                        className="bg-gray-700/40 hover:bg-gray-600/50 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-gray-600/30 flex items-center gap-2"
                    >
                        <MdClose /> Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLogModal;
