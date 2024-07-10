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