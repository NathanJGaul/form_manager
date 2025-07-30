import React, { useState, useRef, useEffect } from "react";
import * as Icons from "lucide-react";

interface DevDropdownMenuProps {
  onFillMockData: () => void;
  onFormDevTool: () => void;
  onClearFormData: () => void;
  onBatchGenerate: () => void;
  onExportMockData: () => void;
  mockDataCount?: number;
}

export const DevDropdownMenu: React.FC<DevDropdownMenuProps> = ({
  onFillMockData,
  onFormDevTool,
  onClearFormData,
  onBatchGenerate,
  onExportMockData,
  mockDataCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        title="Developer Tools"
      >
        <Icons.Code2 size={16} />
        <span className="text-sm">Dev Tools</span>
        <Icons.ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => handleItemClick(onFillMockData)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Icons.Database size={16} />
              Fill with Mock Data
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => handleItemClick(onFormDevTool)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Icons.TestTube size={16} />
              Data Validation Checker
            </button>
            <button
              onClick={() => handleItemClick(onClearFormData)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Icons.Trash2 size={16} />
              Clear Form Data
            </button>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => handleItemClick(onBatchGenerate)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Icons.Layers size={16} />
              Generate Multiple Instances
            </button>
            {mockDataCount > 0 && (
              <button
                onClick={() => handleItemClick(onExportMockData)}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Icons.Download size={16} />
                Export Mock Data CSV ({mockDataCount} instances)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
