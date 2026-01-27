import React from 'react';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  pageName?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  className = '',
  pageName = ''
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handleFirstPage = () => onPageChange(1);
  const handleLastPage = () => onPageChange(totalPages);
  const handleNextPage = () => currentPage < totalPages && onPageChange(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && onPageChange(currentPage - 1);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Left side - Total items count */}
      <div className="text-cyan-400 text-xs md:text-sm font-medium">
        {formatNumber(totalItems)} {pageName}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="w-10 h-10 p-0 hidden md:flex items-center justify-center border-slate-700 hover:border-cyan-400 disabled:opacity-30"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4 text-cyan-400" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="w-10 h-10 p-0 flex items-center justify-center border-slate-700 hover:border-cyan-400 disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
        </Button>

        {/* Page info */}
        <div className="flex items-center px-4 h-10 text-xs md:text-sm text-slate-300">
          <span className="mr-2 hidden md:block">Page</span>
          <span className="w-8 h-8 flex items-center justify-center border border-cyan-400 text-cyan-400 rounded-sm mr-2">
            {currentPage}
          </span>
          <span>of {totalPages} Pages</span>
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="w-10 h-10 p-0 flex items-center justify-center border-slate-700 hover:border-cyan-400 disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="w-10 h-10 p-0 hidden md:flex items-center justify-center border-slate-700 hover:border-cyan-400 disabled:opacity-30"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4 text-cyan-400" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
