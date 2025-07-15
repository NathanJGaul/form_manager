import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface DevDropdownMenuProps {
  onFillMockData: () => void;
  onFormDevTool: () => void;
}

export const DevDropdownMenu: React.FC<DevDropdownMenuProps> = ({ onFillMockData, onFormDevTool }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        <Icons.ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
              Form Dev Tool
            </button>
            <button
              onClick={() => handleItemClick(() => console.log('Clear form data'))}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <Icons.Trash2 size={16} />
              Clear Form Data (Coming Soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};