import { memo } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

/**
 * Compact inline pagination for table headers
 * Shows: ← Page 1/10 →
 */
const InlinePagination = memo(({ pagination, onPageChange }) => {
    if (!pagination) return null;

    const { page, totalPages, totalItems, hasNextPage, hasPrevPage } = pagination;

    // Don't show if no pages or only one page
    if (!totalPages || totalPages <= 0) {
        return totalItems > 0 ? (
            <span className="text-gray-400 text-sm ml-2">({totalItems})</span>
        ) : null;
    }

    return (
        <div className="inline-flex items-center gap-1 ml-3">
            {/* Previous button */}
            <button
                onClick={(e) => { e.stopPropagation(); onPageChange(page - 1); }}
                disabled={!hasPrevPage}
                className={`p-1 rounded transition-all duration-200 ${hasPrevPage
                        ? 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                title="Previous page"
            >
                <MdChevronLeft className="w-5 h-5" />
            </button>

            {/* Page indicator */}
            <span className="text-sm text-gray-300 min-w-[80px] text-center">
                Page <span className="text-primary-400 font-semibold">{page}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">{totalPages}</span>
            </span>

            {/* Next button */}
            <button
                onClick={(e) => { e.stopPropagation(); onPageChange(page + 1); }}
                disabled={!hasNextPage}
                className={`p-1 rounded transition-all duration-200 ${hasNextPage
                        ? 'text-gray-300 hover:bg-primary-500/20 hover:text-primary-400'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                title="Next page"
            >
                <MdChevronRight className="w-5 h-5" />
            </button>

            {/* Total count */}
            <span className="text-gray-500 text-xs ml-1">
                ({totalItems} total)
            </span>
        </div>
    );
});

InlinePagination.displayName = 'InlinePagination';

export default InlinePagination;
