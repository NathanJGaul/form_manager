import React, { useState, useRef, useEffect } from "react";
import * as Icons from "lucide-react";

interface HamburgerDropdownProps {
  /**
   * Show Development Tools dropdown (only in development)
   */
  showDevTools: boolean;
  /**
   * Current view mode for the toggle button
   */
  viewMode: "continuous" | "section";
  /**
   * Callback for view mode toggle
   */
  onViewModeToggle: () => void;
  /**
   * Callback for Export CSV action
   */
  onExportCSV: () => void;
  /**
   * Callback for Share Form action
   */
  onShareForm: () => void;
  /**
   * Development tools dropdown component
   */
  devDropdownComponent?: React.ReactNode;
}

/**
 * Hamburger dropdown menu for FormRenderer header actions
 * Consolidates Dev Tools, View Mode Toggle, Export CSV, and Share Form into a space-saving dropdown
 */
const HamburgerDropdown: React.FC<HamburgerDropdownProps> = ({
  showDevTools,
  viewMode,
  onViewModeToggle,
  onExportCSV,
  onShareForm,
  devDropdownComponent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        title="More options"
      >
        <Icons.Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Development Tools - Only shown in development */}
            {showDevTools && devDropdownComponent && (
              <div className="px-4 py-2 border-b border-gray-100">
                {devDropdownComponent}
              </div>
            )}

            {/* View Mode Toggle */}
            <button
              onClick={() => handleItemClick(onViewModeToggle)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              title={
                viewMode === "continuous"
                  ? "Switch to section view"
                  : "Switch to continuous view"
              }
            >
              {viewMode === "continuous" ? (
                <Icons.List className="w-4 h-4 mr-3" />
              ) : (
                <Icons.ScrollText className="w-4 h-4 mr-3" />
              )}
              <span>
                {viewMode === "continuous" ? "Section View" : "Continuous View"}
              </span>
            </button>

            {/* Export CSV */}
            <button
              onClick={() => handleItemClick(onExportCSV)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              title="Export current form data to CSV"
            >
              <Icons.Download className="w-4 h-4 mr-3" />
              <span>Export CSV</span>
            </button>

            {/* Share Form */}
            <button
              onClick={() => handleItemClick(onShareForm)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              title="Share form instance"
            >
              <Icons.Share className="w-4 h-4 mr-3" />
              <span>Share Form</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerDropdown;