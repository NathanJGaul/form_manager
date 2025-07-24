import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { MockDataConfig } from '../utils/mockDataGenerator';

interface MockDataConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: MockDataConfig) => void;
}

export const MockDataConfigModal: React.FC<MockDataConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [config, setConfig] = useState<MockDataConfig>({
    fillPercentage: 100,
    requiredOnly: false,
    useRealisticData: true,
    seed: undefined,
    overrideDefaults: false
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Icons.Database size={20} />
            Mock Data Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fill Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={config.fillPercentage}
                onChange={(e) => setConfig({ ...config, fillPercentage: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium text-gray-600">
                {config.fillPercentage}%
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Percentage of optional fields to fill (required fields are always filled)
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.requiredOnly}
                onChange={(e) => setConfig({ ...config, requiredOnly: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Required Fields Only
              </span>
            </label>
            <p className="mt-1 ml-6 text-sm text-gray-500">
              Only fill fields marked as required
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.useRealisticData}
                onChange={(e) => setConfig({ ...config, useRealisticData: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Realistic Data
              </span>
            </label>
            <p className="mt-1 ml-6 text-sm text-gray-500">
              Generate context-aware data based on field names (e.g., real names for name fields)
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.overrideDefaults}
                onChange={(e) => setConfig({ ...config, overrideDefaults: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Override Default Values
              </span>
            </label>
            <p className="mt-1 ml-6 text-sm text-gray-500">
              Replace fields with default values with generated mock data
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Random Seed (Optional)
            </label>
            <input
              type="number"
              value={config.seed || ''}
              onChange={(e) => setConfig({ ...config, seed: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Leave empty for random data"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use the same seed to generate reproducible data
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icons.Wand2 size={16} />
            Fill Form
          </button>
        </div>
      </div>
    </div>
  );
};