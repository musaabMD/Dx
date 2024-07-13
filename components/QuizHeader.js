'use client';

import React from 'react';
import QuizTimer from './QuizTimer';
import { Suspense } from 'react';

const QuizHeader = ({ testTaker, quizName, timerRef, currentQuestionIndex, totalQuestions, onToggleSidebar }) => {
  return (
    <Suspense>
      <div className="bg-[#0066a1] text-white p-3 w-full">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <button onClick={onToggleSidebar} className="mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p className="text-2xl lg:text-2xl md:text-xl sm:text-lg text-base">
              Page {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xl lg:text-xl md:text-lg sm:text-base text-sm">{testTaker}</p>
            <p className="text-lg lg:text-lg md:text-base sm:text-sm text-xs">{quizName || 'Quiz'}</p>
          </div>
          <div className="flex-1 text-right">
            <QuizTimer ref={timerRef} textColor="white" />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default QuizHeader;
