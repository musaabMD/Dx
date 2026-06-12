'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Suspense } from "react";

const QuizTimer = forwardRef(({ textColor = 'black' }, ref) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(elapsedSeconds);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useImperativeHandle(ref, () => ({
    getTime: () => seconds
  }));

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Suspense>
      <span className="text-white text-2xl font-semibold">
        Time: {formatTime(seconds)}
      </span>
    </Suspense>
  );
});

QuizTimer.displayName = 'QuizTimer';

export default QuizTimer;
