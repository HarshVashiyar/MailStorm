import { memo } from 'react';
import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

/**
 * Reusable Pagination component
 * 
 * @param {Object} pagination - Pagination state object
 * @param {number} pagination.page - Current page
 * @param {number} pagination.totalPages - Total number of pages
 * @param {number} pagination.totalItems - Total number of items
 * @param {boolean} pagination.hasNextPage - Whether there's a next page
 * @param {boolean} pagination.hasPrevPage - Whether there's a previous page
 * @param {Function} onPageChange - Callback when page changes
 * @param {string} itemLabel - Label for items (e.g., "companies", "templates")
 */
const Pagination = memo(({ pagination, onPageChange, itemLabel = "items" }) => {
    const { page, totalPages, totalItems, hasNextPage, hasPrevPage } = pagination;

    if (totalPages <= 1) {
        // Still show total count even if only one page
        return totalItems > 0 ? (
            <div className="flex items-center justify-center py-2 text-sm text-gray-400">
                Showing all {totalItems} {itemLabel}
            </div>
        ) : null;
    }

    return (
        <div className="flex items-center justify-between py-3 px-4 bg-dark-800/50 border-t border-primary-500/20">
            {/* Item count info */}
            <div className="text-sm text-gray-400">
                Page {page} of {totalPages} ({totalItems} {itemLabel})
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={!hasPrevPage}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${hasPrevPage
                            ? 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                    title="First page"
                >
                    <MdFirstPage className="w-5 h-5" />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrevPage}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${hasPrevPage
                            ? 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                    title="Previous page"
                >
                    <MdChevronLeft className="w-5 h-5" />
                </button>

                {/* Page numbers - show current and nearby */}
                <div className="flex items-center gap-1 px-2">
                    {/* Create page number buttons */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${pageNum === page
                                        ? 'bg-primary-500 text-white shadow-glow'
                                        : 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${hasNextPage
                            ? 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                    title="Next page"
                >
                    <MdChevronRight className="w-5 h-5" />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={!hasNextPage}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${hasNextPage
                            ? 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                    title="Last page"
                >
                    <MdLastPage className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
});

Pagination.displayName = 'Pagination';

export default Pagination;
