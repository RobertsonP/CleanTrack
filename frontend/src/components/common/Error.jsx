import React from 'react';

const Error = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg text-red-700">
      <div className="h-12 w-12 text-red-500 mb-4">⚠️</div>
      <p className="text-center">
        {message || 'An error occurred. Please try again later.'}
      </p>
    </div>
  );
};

export default Error;