import React from 'react';

// Pure CSS shimmer animation - zero JS overhead
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

// Inject shimmer keyframes into document head (only once)
if (typeof document !== 'undefined' && !document.getElementById('shimmer-keyframes')) {
    const style = document.createElement('style');
    style.id = 'shimmer-keyframes';
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
}

// Base shimmer element with orange/dark theme
const ShimmerBox = ({ className = '', style = {} }) => (
    <div
        className={`animate-pulse bg-gradient-to-r from-gray-800 via-orange-900/20 to-gray-800 ${className}`}
        style={{
            backgroundSize: '1000px 100%',
            animation: 'shimmer 2s infinite linear',
            ...style
        }}
    />
);

// SMTP Slots Skeleton (for Profile.jsx - 5 cards in grid)
export const SmtpSlotsSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <div
                key={i}
                className="bg-dark-900/40 border border-white/5 rounded-2xl p-6 hover:border-primary-500/30 transition-all duration-300"
            >
                {/* Header - Slot number + status */}
                <div className="flex items-center justify-between mb-4">
                    <ShimmerBox className="h-6 w-20 rounded-lg" />
                    <ShimmerBox className="h-6 w-6 rounded-full" />
                </div>

                {/* Email address */}
                <ShimmerBox className="h-4 w-3/4 rounded-md mb-3" />

                {/* Provider info */}
                <div className="flex items-center space-x-2 mb-4">
                    <ShimmerBox className="h-8 w-8 rounded-lg" />
                    <ShimmerBox className="h-4 w-24 rounded-md" />
                </div>

                {/* Stats */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <ShimmerBox className="h-3 w-20 rounded-md" />
                        <ShimmerBox className="h-3 w-16 rounded-md" />
                    </div>
                    <div className="flex justify-between">
                        <ShimmerBox className="h-3 w-24 rounded-md" />
                        <ShimmerBox className="h-3 w-12 rounded-md" />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <ShimmerBox className="h-8 flex-1 rounded-lg" />
                    <ShimmerBox className="h-8 flex-1 rounded-lg" />
                </div>
            </div>
        ))}
    </div>
);

// DataTable Skeleton (for AdminRefactored.jsx - matches table structure)
export const DataTableSkeleton = ({ show = false }) => {
    const userColumns = 5;
    const companyColumns = 10;
    const columnCount = show ? userColumns : companyColumns;
    const rowCount = 8;

    return (
        <div className="bg-glass-dark backdrop-blur-lg rounded-3xl shadow-2xl border border-primary-500/30 overflow-hidden animate-glow">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-4 border-b border-primary-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShimmerBox className="h-6 w-6 rounded" />
                        <ShimmerBox className="h-6 w-40 rounded-md" />
                    </div>
                    <ShimmerBox className="h-5 w-32 rounded-md" />
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table className="w-full table-fixed bg-transparent text-gray-100">
                    {/* Header Row */}
                    <thead className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 backdrop-blur-sm sticky top-0 z-10">
                        <tr>
                            {Array.from({ length: columnCount }).map((_, i) => (
                                <th key={i} className="py-3 px-4">
                                    <ShimmerBox className="h-4 w-full rounded-md mx-auto" style={{ maxWidth: '80%' }} />
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body Rows */}
                    <tbody className="divide-y divide-primary-500/20">
                        {Array.from({ length: rowCount }).map((_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={rowIndex % 2 === 0 ? 'bg-glass-dark/20' : 'bg-transparent'}
                            >
                                {Array.from({ length: columnCount }).map((_, colIndex) => (
                                    <td key={colIndex} className="py-4 px-4">
                                        {/* Vary the widths to look more natural */}
                                        <ShimmerBox
                                            className="h-4 rounded-md mx-auto"
                                            style={{
                                                width: `${60 + (rowIndex * colIndex * 7) % 30}%`
                                            }}
                                        />
                                        {/* Some cells have two lines (like company address/contact) */}
                                        {!show && colIndex < 4 && rowIndex % 2 === 0 && (
                                            <ShimmerBox
                                                className="h-3 rounded-md mx-auto mt-2"
                                                style={{
                                                    width: `${50 + (rowIndex * colIndex * 5) % 25}%`
                                                }}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-3 border-t border-primary-500/20">
                <div className="flex items-center justify-between">
                    <ShimmerBox className="h-4 w-32 rounded-md" />
                    <ShimmerBox className="h-4 w-24 rounded-md" />
                </div>
            </div>
        </div>
    );
};

// Modal Table Skeleton (for ScheduledEmailsModal, SavedListsModal, SavedTemplatesModal)
export const ModalTableSkeleton = ({ columns = 4, rows = 6 }) => (
    <div className="flex-1 overflow-auto mb-4">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-orange-500/20 overflow-hidden">
            <table className="w-full text-white">
                {/* Header */}
                <thead className="bg-gradient-to-r from-orange-600/30 to-amber-600/30 backdrop-blur-sm">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="py-4 px-6">
                                <div className="flex items-center space-x-2 justify-center">
                                    <ShimmerBox className="h-5 w-5 rounded" />
                                    <ShimmerBox className="h-4 w-24 rounded-md" />
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-orange-500/10">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={rowIndex % 2 === 0 ? 'bg-gray-800/20' : 'bg-transparent'}
                        >
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex} className="py-4 px-6">
                                    {/* First column usually has a name/title - make it bolder/wider */}
                                    {colIndex === 0 ? (
                                        <div className="space-y-2">
                                            <ShimmerBox className="h-5 w-32 rounded-md" />
                                            <ShimmerBox className="h-3 w-20 rounded-md" />
                                        </div>
                                    ) : colIndex === columns - 1 ? (
                                        // Last column is usually checkbox/select
                                        <div className="flex justify-center">
                                            <ShimmerBox className="h-5 w-5 rounded" />
                                        </div>
                                    ) : (
                                        // Middle columns
                                        <ShimmerBox
                                            className="h-4 rounded-md"
                                            style={{
                                                width: `${65 + (rowIndex * colIndex * 6) % 25}%`
                                            }}
                                        />
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Profile Header Skeleton (for Profile.jsx initial load)
export const ProfileHeaderSkeleton = () => (
    <div className="bg-dark-800/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-glass overflow-hidden mb-6">
        <div className="px-6 md:px-10 py-6">
            {/* Avatar and Name Section */}
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-4">
                {/* Avatar */}
                <ShimmerBox className="w-32 h-32 rounded-full" />

                {/* Name and Email */}
                <div className="text-center md:text-left space-y-3">
                    <ShimmerBox className="h-8 w-48 rounded-lg" />
                    <ShimmerBox className="h-5 w-64 rounded-md" />
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-4">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-dark-900/40 border border-white/5 rounded-2xl p-6"
                    >
                        {/* Card Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <ShimmerBox className="w-10 h-10 rounded-lg" />
                            <ShimmerBox className="h-6 w-32 rounded-md" />
                        </div>

                        {/* Card Content */}
                        <div className="space-y-3">
                            <div>
                                <ShimmerBox className="h-3 w-20 rounded-md mb-2" />
                                <ShimmerBox className="h-4 w-40 rounded-md" />
                            </div>
                            <div>
                                <ShimmerBox className="h-3 w-24 rounded-md mb-2" />
                                <ShimmerBox className="h-4 w-56 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-white/5">
                <ShimmerBox className="h-14 flex-1 rounded-xl" />
                <ShimmerBox className="h-14 flex-1 rounded-xl" />
                <ShimmerBox className="h-14 sm:w-32 rounded-xl" />
            </div>
        </div>
    </div>
);

export default {
    SmtpSlotsSkeleton,
    DataTableSkeleton,
    ModalTableSkeleton,
    ProfileHeaderSkeleton,
    ShimmerBox
};