
import React from 'react';

const LoadingSpinner = ({ size = '8', color = 'blue-500' }: { size?: string, color?: string }) => (
  <div className="flex justify-center items-center">
    <div
      className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-${color}`}
    ></div>
  </div>
);

export default LoadingSpinner;
