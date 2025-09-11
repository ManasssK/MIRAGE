import React from 'react';

const Spinner = ({ size = 'default' }) => {
  let spinnerSize;

  switch (size) {
    case 'small':
      spinnerSize = 'w-4 h-4';
      break;
    case 'large':
      spinnerSize = 'w-12 h-12';
      break;
    default:
      spinnerSize = 'w-8 h-8';
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${spinnerSize} border-t-2 border-b-2 border-gray-900 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Spinner;
