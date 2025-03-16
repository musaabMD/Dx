// 'use client';
// import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
// import { Suspense } from "react";
// const QuizTimer = forwardRef(({ textColor = 'black' }, ref) => {
//   const [time, setTime] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(prevTime => prevTime + 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useImperativeHandle(ref, () => ({
//     getTime: () => time
//   }));

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   return (
//     <>
//     <Suspense>


//     <span className={`text-${textColor} text-2xl font-semibold`}>
//       Time: {formatTime(time)}
//     </span>
//     </Suspense>
//     </>
//  );
// });

// QuizTimer.displayName = 'QuizTimer';

// export default QuizTimer;
// 'use client';
// import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
// import { Suspense } from "react";

// const QuizTimer = forwardRef(({ textColor = 'black' }, ref) => {
//   const [time, setTime] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(prevTime => prevTime + 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useImperativeHandle(ref, () => ({
//     getTime: () => time
//   }));

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   return (
//     <Suspense>
//       <span className={`text-${textColor} text-2xl lg:text-2xl md:text-xl sm:text-lg text-base font-semibold`}>
//         Time: {formatTime(time)}
//       </span>
//     </Suspense>
//   );
// });

// QuizTimer.displayName = 'QuizTimer';

// export default QuizTimer;
// add fix to make less func invo

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Suspense } from "react";

const QuizTimer = forwardRef(({ textColor = 'black' }, ref) => {
  const [time, setTime] = useState(0);

  // Regular time increment (1 second interval)
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 1);  // <-- Timer increments every second
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Used to get time from the parent component
  useImperativeHandle(ref, () => ({
    getTime: () => time
  }));

  // Format time to display minutes and seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Display time is updated every 5 seconds to reduce UI updates
  const [displayTime, setDisplayTime] = useState(formatTime(time));  // <-- Added state for display time
  
  useEffect(() => {
    const updateDisplayInterval = setInterval(() => {
      setDisplayTime(formatTime(time));  // <-- Updated every 5 seconds instead of 1 second
    }, 5000);  // <-- Timer UI update frequency (5 seconds)

    return () => clearInterval(updateDisplayInterval);
  }, [time]);

  return (
    <Suspense>
      <span className={`text-${textColor} text-2xl font-semibold`}>
        Time: {displayTime}  {/* <-- Use displayTime to minimize re-renders */}
      </span>
    </Suspense>
  );
});

QuizTimer.displayName = 'QuizTimer';

export default QuizTimer;
