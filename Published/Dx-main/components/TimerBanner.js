'use client';

import { useState, useEffect } from 'react';

const TimerBanner = () => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const copyCode = () => {
    navigator.clipboard.writeText('new');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (timeLeft <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="text-yellow-300 font-bold">🔥 Special Offer!</span>
          <span className="font-semibold">
            15% OFF with code: 
          </span>
          <button
            onClick={copyCode}
            className="bg-white text-indigo-600 px-3 py-1 rounded-md font-mono font-bold hover:bg-gray-100 transition-colors"
          >
            new
          </button>
          {isCopied && (
            <span className="text-sm text-yellow-300">Copied!</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Expires in:</span>
          <span className="bg-white text-indigo-600 px-3 py-1 rounded-md font-mono font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerBanner; 