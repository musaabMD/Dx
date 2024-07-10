// // 'use client';
// // import React, { useState } from 'react';

// // const Feedback = ({ questionId, currentAnswer, options, onSubmit }) => {
// //   const [feedbackType, setFeedbackType] = useState('');
// //   const [suggestedAnswer, setSuggestedAnswer] = useState('');
// //   const [feedbackText, setFeedbackText] = useState('');
// //   const [isSubmitted, setIsSubmitted] = useState(false);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSubmit({
// //       questionId,
// //       feedbackType,
// //       suggestedAnswer,
// //       feedbackText
// //     });
// //     setIsSubmitted(true);
// //     // Reset form after submission
// //     setFeedbackType('');
// //     setSuggestedAnswer('');
// //     setFeedbackText('');
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
// //       <h3 className="text-lg font-semibold mb-2">Provide Feedback</h3>
// //       {isSubmitted && <p className="text-green-500 mb-2">Feedback sent successfully!</p>}
// //       <div className="mb-2">
// //         <label className="block mb-1">Feedback Type:</label>
// //         <select 
// //           value={feedbackType} 
// //           onChange={(e) => setFeedbackType(e.target.value)}
// //           className="w-full p-2 border rounded"
// //           required
// //         >
// //           <option value="">Select a type</option>
// //           <option value="incorrect_answer">Incorrect Answer</option>
// //           <option value="incorrect_explanation">Incorrect Explanation</option>
// //           <option value="typo">Typo or Error</option>
// //           <option value="other">Other</option>
// //         </select>
// //       </div>
// //       {feedbackType === 'incorrect_answer' && (
// //         <div className="mb-2">
// //           <label className="block mb-1">Suggested Answer:</label>
// //           <select 
// //             value={suggestedAnswer} 
// //             onChange={(e) => setSuggestedAnswer(e.target.value)}
// //             className="w-full p-2 border rounded"
// //             required
// //           >
// //             <option value="">Select an answer</option>
// //             {options.map(option => (
// //               <option key={option.letter} value={option.letter}>{option.letter}: {option.text}</option>
// //             ))}
// //           </select>
// //         </div>
// //       )}
// //       <div className="mb-2">
// //         <label className="block mb-1">Comments:</label>
// //         <textarea 
// //           value={feedbackText} 
// //           onChange={(e) => setFeedbackText(e.target.value)}
// //           className="w-full p-2 border rounded"
// //           rows="3"
// //           required
// //         ></textarea>
// //       </div>
// //       <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit Feedback</button>
// //     </form>
// //   );
// // }import React, { useState } from 'react';'use client';

// // import React, { useState, useEffect, useRef } from 'react';

// // const Feedback = ({ questionId, currentAnswer, options, onSubmit, existingFeedback }) => {
// //   const [feedbackType, setFeedbackType] = useState('');
// //   const [suggestedAnswer, setSuggestedAnswer] = useState('');
// //   const [feedbackText, setFeedbackText] = useState('');
// //   const [isSubmitted, setIsSubmitted] = useState(!!existingFeedback);
// //   const [showForm, setShowForm] = useState(false);
// //   const formRef = useRef(null);

// //   const handleClickOutside = (event) => {
// //     if (formRef.current && !formRef.current.contains(event.target)) {
// //       setShowForm(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (showForm) {
// //       document.addEventListener('mousedown', handleClickOutside);
// //     } else {
// //       document.removeEventListener('mousedown', handleClickOutside);
// //     }
// //     return () => {
// //       document.removeEventListener('mousedown', handleClickOutside);
// //     };
// //   }, [showForm]);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     const feedbackData = {
// //       question_id: questionId,
// //       feedback_type: feedbackType,
// //       suggested_answer: feedbackType === 'incorrect_answer' ? suggestedAnswer : null,
// //       feedback_text: feedbackText,
// //       status: 'In Progress'
// //     };

// //     console.log('Submitting feedback:', feedbackData);
// //     onSubmit(feedbackData);

// //     setIsSubmitted(true);
// //     // Reset form after submission
// //     setFeedbackType('');
// //     setSuggestedAnswer('');
// //     setFeedbackText('');
// //     setShowForm(false);
// //   };

// //   return (
// //     <div ref={formRef}>
// //       {!showForm && !isSubmitted && (
// //         <button 
// //           onClick={() => setShowForm(true)} 
// //           className="bg-blue-500 text-white px-4 py-2 rounded mt-2 "
// //         >
// //           Provide Feedback
// //         </button>
// //       )}
// //       {showForm && (
// //         <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
// //           <h3 className="text-lg font-semibold mb-2">Provide Feedback</h3>
// //           <div className="mb-2">
// //             <label className="block mb-1">Feedback Type:</label>
// //             <select 
// //               value={feedbackType} 
// //               onChange={(e) => setFeedbackType(e.target.value)}
// //               className="w-full p-2 border rounded"
// //               required
// //             >
// //               <option value="">Select a type</option>
// //               <option value="incorrect_answer">Incorrect Answer</option>
// //               <option value="incorrect_explanation">Incorrect Explanation</option>
// //               <option value="typo">Typo or Error</option>
// //               <option value="other">Other</option>
// //             </select>
// //           </div>
// //           {feedbackType === 'incorrect_answer' && (
// //             <div className="mb-2">
// //               <label className="block mb-1">Suggested Answer:</label>
// //               <select 
// //                 value={suggestedAnswer} 
// //                 onChange={(e) => setSuggestedAnswer(e.target.value)}
// //                 className="w-full p-2 border rounded"
// //                 required
// //               >
// //                 <option value="">Select an answer</option>
// //                 {options.map(option => (
// //                   <option key={option.letter} value={option.letter}>{option.letter}: {option.text}</option>
// //                 ))}
// //               </select>
// //             </div>
// //           )}
// //           <div className="mb-2">
// //             <label className="block mb-1">Comments:</label>
// //             <textarea 
// //               value={feedbackText} 
// //               onChange={(e) => setFeedbackText(e.target.value)}
// //               className="w-full p-2 border rounded"
// //               rows="3"
// //               required
// //             ></textarea>
// //           </div>
// //           <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">Submit Feedback</button>
// //         </form>
// //       )}
// //       {isSubmitted && (
// //         <p className="text-green-500 mt-2">Feedback sent successfully!</p>
// //       )}
// //     </div>
// //   );
// // };

// // export default Feedback;
// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { Suspense } from 'react';
// const Feedback = ({ questionId, examName, currentAnswer, options, onSubmit, existingFeedback }) => {
//   const [feedbackType, setFeedbackType] = useState('');
//   const [suggestedAnswer, setSuggestedAnswer] = useState('');
//   const [feedbackText, setFeedbackText] = useState('');
//   const [isSubmitted, setIsSubmitted] = useState(!!existingFeedback);
//   const [showForm, setShowForm] = useState(false);
//   const formRef = useRef(null);

//   const handleClickOutside = (event) => {
//     if (formRef.current && !formRef.current.contains(event.target)) {
//       setShowForm(false);
//     }
//   };

//   useEffect(() => {
//     if (showForm) {
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       document.removeEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showForm]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const feedbackData = {
//       question_id: questionId,
//       exam_name: examName,
//       feedback_type: feedbackType,
//       suggested_answer: feedbackType === 'incorrect_answer' ? suggestedAnswer : null,
//       feedback_text: feedbackText,
//       status: 'In Progress'
//     };

//     console.log('Submitting feedback:', feedbackData);
//     onSubmit(feedbackData);

//     setIsSubmitted(true);
//     // Reset form after submission
//     setFeedbackType('');
//     setSuggestedAnswer('');
//     setFeedbackText('');
//     setShowForm(false);
//   };

//   return (
//     <>
//     <Suspense>

   
//     <div ref={formRef}>
//       {!showForm && !isSubmitted && (
//         <button 
//           onClick={() => setShowForm(true)} 
//           className="bg-blue-500 text-white px-4 py-2 rounded mt-2 "
//         >
//           Provide Feedback
//         </button>
//       )}
//       {showForm && (
//         <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
//           <h3 className="text-lg font-semibold mb-2">Provide Feedback</h3>
//           <div className="mb-2">
//             <label className="block mb-1">Feedback Type:</label>
//             <select 
//               value={feedbackType} 
//               onChange={(e) => setFeedbackType(e.target.value)}
//               className="w-full p-2 border rounded"
//               required
//             >
//               <option value="">Select a type</option>
//               <option value="incorrect_answer">Incorrect Answer</option>
//               <option value="incorrect_explanation">Incorrect Explanation</option>
//               <option value="typo">Typo or Error</option>
//               <option value="other">Other</option>
//             </select>
//           </div>
//           {feedbackType === 'incorrect_answer' && (
//             <div className="mb-2">
//               <label className="block mb-1">Suggested Answer:</label>
//               <select 
//                 value={suggestedAnswer} 
//                 onChange={(e) => setSuggestedAnswer(e.target.value)}
//                 className="w-full p-2 border rounded"
//                 required
//               >
//                 <option value="">Select an answer</option>
//                 {options.map(option => (
//                   <option key={option.letter} value={option.letter}>{option.letter}: {option.text}</option>
//                 ))}
//               </select>
//             </div>
//           )}
//           <div className="mb-2">
//             <label className="block mb-1">Comments:</label>
//             <textarea 
//               value={feedbackText} 
//               onChange={(e) => setFeedbackText(e.target.value)}
//               className="w-full p-2 border rounded"
//               rows="3"
//               required
//             ></textarea>
//           </div>
//           <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">Submit Feedback</button>
//         </form>
//       )}
//       {isSubmitted && (
//         <p className="text-green-500 mt-2">Feedback sent successfully!</p>
//       )}
//     </div>
//     </Suspense>
//     </>
//   );
// };

// export default Feedback;
