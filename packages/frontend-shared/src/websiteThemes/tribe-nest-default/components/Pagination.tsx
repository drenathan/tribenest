import { css } from "@emotion/css";
import { alphaToHexCode, addAlphaToHexCode } from "../../../lib/utils";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  themeSettings: {
    colors: {
      primary: string;
      text: string;
    };
    cornerRadius: string;
  };
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  themeSettings,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate pagination range with ellipsis
  const getPaginationRange = () => {
    const maxVisiblePages = 7; // Show up to 7 page numbers

    if (totalPages <= maxVisiblePages) {
      // If total pages is small, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // For larger page counts, show a smart range
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    if (currentPage <= 4) {
      // Near the beginning: show 1, 2, 3, 4, 5, ..., last
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const paginationButtonStyles = css({
    border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.65)}`,
    borderRadius: `${themeSettings.cornerRadius}px`,
    padding: "8px 12px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    backgroundColor: "transparent",
    color: themeSettings.colors.text,
    fontSize: "14px",
    "&:hover": {
      backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
      borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      "&:hover": {
        backgroundColor: "transparent",
        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.65)}`,
      },
    },
  });

  const activePageButtonStyles = css({
    backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
    borderColor: `${themeSettings.colors.primary}${alphaToHexCode(1)}`,
    color: themeSettings.colors.primary,
  });

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Page Info */}
      <div
        className={css({
          color: addAlphaToHexCode(themeSettings.colors.text, 0.7),
          fontSize: "14px",
        })}
      >
        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
        items
      </div>

      {/* Pagination Buttons */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={paginationButtonStyles}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {getPaginationRange().map((page, index) =>
            page === "..." ? (
              <span
                key={index}
                className={css({
                  padding: "8px 12px",
                  color: addAlphaToHexCode(themeSettings.colors.text, 0.5),
                  fontSize: "14px",
                })}
              >
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => onPageChange(page as number)}
                className={`${paginationButtonStyles} ${page === currentPage ? activePageButtonStyles : ""}`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={paginationButtonStyles}
        >
          Next
        </button>
      </div>
    </div>
  );
};
