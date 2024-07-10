'use client';

import React from 'react';
import { Suspense } from 'react';
const SubmitExam = ({ isOpen, onClose, onSubmit, unansweredQuestions }) => {
  if (!isOpen) return null;

  return (
    <>
    <Suspense>


 
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white text-black p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Submit Exam?</h2>
        <p>Are you sure you want to submit your exam?</p>
        {unansweredQuestions > 0 && (
          <p className="mt-2 text-red-500">There are {unansweredQuestions} questions not answered.</p>
        )}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
    </Suspense>
    </>
  );
};

export default SubmitExam;