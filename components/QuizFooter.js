'use client';

import React from 'react';
import { Suspense } from 'react';
const QuizFooter = ({ onPrevious, onNext, onSubmit, currentQuestionIndex, totalQuestions, onToggleBookmark, isBookmarked }) => {
  return (
    <>
    <Suspense>


  
    <div className="fixed bottom-0 left-0 right-0 bg-[#0066a1] p-4 flex justify-between items-center">
      <button
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        className="px-4 py-2 bg-white text-[#0066a1] rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M10.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L12.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M4.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L6.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={onNext}
        disabled={currentQuestionIndex === totalQuestions - 1}
        className="px-4 py-2 bg-white text-[#0066a1] rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={onToggleBookmark}
        className="px-4 py-2 bg-white text-[#0066a1] rounded hover:bg-gray-100"
      >
        {isBookmarked ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
        )}
      </button>
      <button
        onClick={onSubmit}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        END
      </button>
    </div>
    </Suspense>
    </>
  );
};

export default QuizFooter;