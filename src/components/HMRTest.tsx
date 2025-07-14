import React from 'react';

const HMRTest: React.FC = () => {
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h2 className="text-xl font-bold text-blue-800">HMR Test Component</h2>
      <p className="text-blue-600">
        Change this text and save to test HMR!
        Current time: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default HMRTest;