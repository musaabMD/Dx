// 'use client';
// import React, { useState } from 'react';
// import { Search, Filter } from 'lucide-react';

// const Review = ({ responses }) => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');

//   const correctAnswers = responses.filter(response => response.user_answer === response.qtable.correct_choice);
//   const incorrectAnswers = responses.filter(response => response.user_answer !== response.qtable.correct_choice && response.user_answer !== null);
//   const skippedQuestions = responses.filter(response => response.user_answer === null);
//   const flaggedQuestions = responses.filter(response => response.is_bookmarked);

//   const tabData = [
//     { id: 'all', label: 'All', count: responses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'correct', label: 'Correct', count: correctAnswers.length },
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'correct': return correctAnswers;
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return responses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qtable.question_text.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => (
//         <div key={index} className="mb-4 p-4 border rounded">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm text-gray-500">{answer.qtable.subject}</span>
//             {answer.user_answer === answer.qtable.correct_choice && <span className="text-green-500">✓</span>}
//             {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//           </div>
//           <p className="font-bold">{answer.qtable.question_text}</p>
//           <p>Your answer: {answer.user_answer || 'Skipped'}</p>
//           <p>Correct answer: {answer.qtable.correct_choice}</p>
//           <p>Explanation: {answer.qtable.rationale}</p>
//           {answer.feedback && (
//             <div className="mt-2 p-2 bg-gray-100 rounded">
//               <h4 className="font-semibold">Your Feedback:</h4>
//               <p>Type: {answer.feedback.feedbackType}</p>
//               {answer.feedback.suggestedAnswer && (
//                 <p>Suggested Answer: {answer.feedback.suggestedAnswer}</p>
//               )}
//               <p>Comments: {answer.feedback.feedbackText}</p>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="w-full max-w-3xl bg-white rounded-lg ">
//       <div className="p-4">
//         <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Review Questions</h2>
//         <div className="mb-4">
//           <div className="flex space-x-2 border-b">
//             {tabData.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`py-2 px-4 ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
//               >
//                 {tab.label}
//                 <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full text-xs">
//                   {tab.count}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//         <div className="mt-4 flex space-x-2">
//           <div className="relative flex-grow">
//             <input
//               type="text"
//               placeholder="Search Answered Questions"
//               className="pl-10 pr-4 py-2 w-full border rounded"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//           </div>
         
//         </div>
//         <div className="mt-4">
//           {renderAnswers(filteredAnswers)}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Review;

// import React from 'react';

// const Review = ({ responses, activeTab }) => {
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'all':
//       case 'bookmark':
//       case 'incorrect':
//         return responses.map((response, index) => (
//           <div key={index} className="mb-4 p-4 border rounded ">
//             <div className="flex justify-between items-center mb-2 v">
//               <span className="text-sm text-gray-500">{response.qtable.subject}</span>
//               {response.user_answer === response.qtable.correct_choice && <span className="text-green-500">✓</span>}
//               {response.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <p className="font-bold">{response.qtable.question_text}</p>
//             <p>Your answer: {response.user_answer || 'Skipped'}</p>
//             <p>Correct answer: {response.qtable.correct_choice}</p>
//             <p>Explanation: {response.qtable.rationale}</p>
//           </div>
//         ));
//       case 'feedback':
//         return responses.map((feedback, index) => (
//           <div key={index} className="mb-4 p-4 border rounded">
//             <h4 className="font-semibold">Feedback for Question:</h4>
//             <p>{feedback.qtable.question_text}</p>
//             <p>Type: {feedback.feedback_type}</p>
//             {feedback.suggested_answer && (
//               <p>Suggested Answer: {feedback.suggested_answer}</p>
//             )}
//             <p>Comments: {feedback.feedback_text}</p>
//           </div>
//         ));
//       default:
//         return <p>No content to display.</p>;
//     }
//   };

//   return (
//     <div className="w-full max-w-3xl bg-white rounded-lg">
//       <div className="p-4">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Review;

// import React from 'react';

// const Review = ({ responses, activeTab }) => {
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'all':
//       case 'bookmark':
//       case 'incorrect':
//         return responses.map((response, index) => {
//           const correctChoice = response.qtable.choices.find(choice => choice.letter === response.qtable.correct_choice);
//           const userChoice = response.qtable.choices.find(choice => choice.letter === response.user_answer);

//           return (
//             <div key={index} className="mb-4 p-4 border rounded">
//               <div className="flex justify-between items-center mb-2 v">
//                 <span className="text-sm text-gray-500">{response.qtable.subject}</span>
//                 {response.user_answer === response.qtable.correct_choice && <span className="text-green-500">✓</span>}
//                 {response.is_bookmarked && <span className="text-blue-500">🚩</span>}
//               </div>
//               <p className="font-bold">{response.qtable.question_text}</p>
//               <p>Your answer: {userChoice ? `${userChoice.letter}: ${userChoice.text}` : 'Skipped'}</p>
//               <p>Correct answer: {correctChoice ? `${correctChoice.letter}: ${correctChoice.text}` : 'N/A'}</p>
//               <p>Explanation: {response.qtable.rationale}</p>
//             </div>
//           );
//         });
//       case 'feedback':
//         return responses.map((feedback, index) => (
//           <div key={index} className="mb-4 p-4 border rounded">
//             <h4 className="font-semibold">Feedback for Question:</h4>
//             <p>{feedback.qtable.question_text}</p>
//             <p>Type: {feedback.feedback_type}</p>
//             {feedback.suggested_answer && (
//               <p>Suggested Answer: {feedback.suggested_answer}</p>
//             )}
//             <p>Comments: {feedback.feedback_text}</p>
//           </div>
//         ));
//       default:
//         return <p>No content to display.</p>;
//     }
//   };

//   return (
//     <div className="w-full max-w-3xl bg-white rounded-lg">
//       <div className="p-4">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Review;
import React, { useState } from 'react';
import Feedback from './Feedback'; // Assume Feedback component is in the same directory
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Suspense } from 'react';
const Review = ({ responses, activeTab }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const supabase = createClientComponentClient();

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert(feedbackData)
        .single();

      if (error) throw error;
      console.log('Feedback submitted successfully:', data);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error submitting feedback:', error.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
      case 'bookmark':
      case 'incorrect':
        return responses.map((response, index) => {
          const correctChoice = response.qtable.choices.find(choice => choice.letter === response.qtable.correct_choice);
          const userChoice = response.qtable.choices.find(choice => choice.letter === response.user_answer);

          return (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{response.qtable.subject}</span>
                {response.user_answer === response.qtable.correct_choice && <span className="text-green-500">✓</span>}
                {response.is_bookmarked && <span className="text-blue-500">🚩</span>}
              </div>
              <p className="font-bold">{response.qtable.question_text}</p>
              <p>Your answer: {userChoice ? `${userChoice.letter}: ${userChoice.text}` : 'Skipped'}</p>
              <p>Correct answer: {correctChoice ? `${correctChoice.letter}: ${correctChoice.text}` : 'N/A'}</p>
              <p>Explanation: {response.qtable.rationale}</p>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setShowFeedbackForm(true);
                  setCurrentQuestion(response);
                }}
              >
                Provide Feedback
              </button>
            </div>
          );
        });
      case 'feedback':
        return responses.map((feedback, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <h4 className="font-semibold">Feedback for Question:</h4>
            <p>{feedback.qtable.question_text}</p>
            <p>Type: {feedback.feedback_type}</p>
            {feedback.suggested_answer && (
              <p>Suggested Answer: {feedback.suggested_answer}</p>
            )}
            <p>Comments: {feedback.feedback_text}</p>
          </div>
        ));
      default:
        return <p>No content to display.</p>;
    }
  };

  return (

    <>
    <Suspense>

   
    <div className="w-full max-w-3xl bg-white rounded-lg">
      <div className="p-4">
        {renderContent()}
        {showFeedbackForm && currentQuestion && (
          <Feedback
            questionId={currentQuestion.qtable.id}
            currentAnswer={currentQuestion.user_answer}
            options={currentQuestion.qtable.choices}
            onSubmit={handleFeedbackSubmit}
          />
        )}
      </div>
    </div>
    </Suspense>
    
    </>
  );
};

export default Review;
