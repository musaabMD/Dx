// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Review from "@/components/Review";

// export default function Dashboard() {
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qtable:question_id (
//             *
//           )
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchUserResponses(),
//         fetchUserFeedback(),
//         fetchSubscriptionStatus()
//       ]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   const groupedResponses = userResponses.reduce((acc, response) => {
//     const examName = response.qtable.examname;
//     if (!acc[examName]) {
//       acc[examName] = [];
//     }
//     acc[examName].push(response);
//     return acc;
//   }, {});

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Header/>
//       <main className="p-8 pb-24 bg-white">
//         <section className="max-w-4xl mx-auto space-y-8">
//           <h1 className="text-3xl md:text-4xl font-extrabold">Your Dashboard</h1>
//           <ButtonAccount />

//           {/* Subscription Status */}
//           <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
//             <h2 className="text-2xl font-bold mb-4">Subscription Status</h2>
//             {subscriptionStatus ? (
//               <>
//                 <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//                 <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//                 <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//                 {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//                   <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
//                     Renew Subscription
//                   </button>
//                 )}
//               </>
//             ) : (
//               <p>No active subscription found.</p>
//             )}
//           </div>

//           {/* Quiz Results */}
//           <h2 className="text-2xl font-bold mb-4">Your Quiz Results</h2>
//           {Object.keys(groupedResponses).length === 0 ? (
//             <p>No quiz results found. Try taking a quiz first!</p>
//           ) : (
//             Object.entries(groupedResponses).map(([examName, responses]) => (
//               <div key={examName} className="bg-white rounded-lg p-6 mb-6">
//                 <h2 className="text-2xl font-bold mb-4">{examName}</h2>
//                 <Review responses={responses} />
//               </div>
//             ))
//           )}

//           {/* User Feedback */}
//           <div className="bg-white rounded-lg p-6 mb-6">
//             <h2 className="text-2xl font-bold mb-4">Your Feedback</h2>
//             {userFeedback.length > 0 ? (
//               userFeedback.map((feedback, index) => (
//                 <div key={index} className="mb-4 p-4 border rounded">
//                   <p><strong>Type:</strong> {feedback.feedback_type}</p>
//                   <p><strong>Question Text:</strong> {feedback.qtable.question_text}</p>
//                   <p><strong>Suggested Answer:</strong> {feedback.suggested_answer || 'N/A'}</p>
//                   <p><strong>Comments:</strong> {feedback.feedback_text}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No feedback submitted yet.</p>
//             )}
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }

// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Review from "@/components/Review";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qtable:question_id (
//             *
//           )
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchUserResponses(),
//         fetchUserFeedback(),
//         fetchSubscriptionStatus()
//       ]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qtable.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qtable.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'correct': return correctAnswers;
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qtable.question_text.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => (
//         <div key={index} className="mb-4 p-4 bg-white border-2 border-slate-500 ">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm text-gray-500">{answer.qtable.subject}</span>
//             {answer.user_answer === answer.qtable.correct_choice && <span className="text-green-500">✓</span>}
//             {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//           </div>
//           <p className="font-semibold ">{answer.qtable.question_text}</p>
//           <p>Your answer: {answer.user_answer || 'Skipped'}</p>
//           <p>Correct answer: {answer.qtable.correct_choice}</p>
//           <p>Explanation: {answer.qtable.rationale}</p>
//           {answer.feedback && (
//             <div className="mt-2 p-2 bg-gray-100 ">
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

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-white">
//               <h4 className="font-semibold">Feedback for Question:</h4>
//               <p>{feedback.qtable.question_text}</p>
//               <p className="mt-2"><strong>Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className=" p-6 mb-6">
//             <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//             <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p><strong>Remaining Days:</strong> {remainingDays}</p>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//               <button className="mt-4 px-4 py-2 bg-blue-500 text-white  hover:bg-blue-600">
//                 Renew Subscription
//               </button>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Header />
//       <main className="p-8 pb-24 bg-slate-100">
//         <section className="max-w-6xl mx-auto space-y-8">
//           <h1 className="text-3xl md:text-4xl font-extrabold">Your Dashboard</h1>
//           <ButtonAccount />

//           <div className="mb-4 ">
//             <div className="flex space-x-2 ">
//               {tabData.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`py-2 px-4 ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-500 text-xl font-sans font-semibold' : 'text-black text-xl font-sans font-semibold'}`}
//                 >
//                   {tab.label}
//                   <span className="ml-2 font-sans font-extrabold px-2 py-1  ">
//                     {tab.count}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {activeTab !== 'subscription' && (
//             <div className="mt-4 flex space-x-2">
//               <div className="relative flex-grow">
//                 <input
//                   type="text"
//                   placeholder="Search Answered Questions"
//                   className="pl-10 pr-4 py-2 w-full border "
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               </div>
//             </div>
//           )}

//           {renderContent()}
//         </section>
//       </main>
//     </>
//   );
// };

// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Review from "@/components/Review";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchUserResponses(),
//         fetchUserFeedback(),
//         fetchSubscriptionStatus()
//       ]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qtable.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qtable.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qtable.question_text.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectItem = (item) => {
//     setSelectedItems(prev =>
//       prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//     );
//   };

//   const handleRemoveSelectedItems = async () => {
//     if (selectedItems.length > 0) {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("No user found");

//         const itemIds = selectedItems.map(item => item.id);
//         const { error } = await supabase
//           .from('user_responses')
//           .delete()
//           .in('id', itemIds)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         setUserResponses(prev => prev.filter(item => !itemIds.includes(item.id)));
//         setSelectedItems([]);
//         setShowConfirm(false);
//       } catch (error) {
//         console.error('Error removing responses:', error);
//         setError(error.message);
//       }
//     }
//   };

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => {
//         const choices = {
//           'A': answer.qtable.option_a,
//           'B': answer.qtable.option_b,
//           'C': answer.qtable.option_c,
//           'D': answer.qtable.option_d,
//           'E': answer.qtable.option_e,
//           'F': answer.qtable.option_f
//         };

//         const correctChoice = choices[answer.qtable.correct_choice];
//         const userChoice = choices[answer.user_answer];

//         return (
//           <div
//             key={index}
//             className={`mb-4 p-4 bg-white border-2 border-slate-500 ${selectedItems.includes(answer) ? 'bg-gray-100' : ''}`}
//             onClick={() => handleSelectItem(answer)}
//           >
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm text-gray-500">{answer.qtable.subject}</span>
//               {answer.user_answer === answer.qtable.correct_choice && <span className="text-green-500">✓</span>}
//               {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <p className="font-semibold ">{answer.qtable.question_text}</p>
//             <p>Your answer: {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//             <p>Correct answer: {correctChoice ? `${answer.qtable.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//             <p>Explanation: {answer.qtable.rationale}</p>
//             {answer.feedback && (
//               <div className="mt-2 p-2 bg-gray-100 ">
//                 <h4 className="font-semibold">Your Feedback:</h4>
//                 <p>Type: {answer.feedback.feedbackType}</p>
//                 {answer.feedback.suggestedAnswer && (
//                   <p>Suggested Answer: {answer.feedback.suggestedAnswer}</p>
//                 )}
//                 <p>Comments: {answer.feedback.feedbackText}</p>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div
//               key={index}
//               className={`mb-4 p-4 border-2 border-slate-500 bg-white ${selectedItems.includes(feedback) ? 'bg-gray-100' : ''}`}
//               onClick={() => handleSelectItem(feedback)}
//             >
//               <h4 className="font-semibold">Feedback for Question:</h4>
//               <p>{feedback.qtable.question_text}</p>
//               <p className="mt-2"><strong>Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className=" p-6 mb-6">
//             <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//             <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p><strong>Remaining Days:</strong> {remainingDays}</p>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//               <button className="mt-4 px-4 py-2 bg-blue-500 text-white  hover:bg-blue-600">
//                 Renew Subscription
//               </button>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Header />
//       <main className="p-8 pb-24 bg-slate-100">
//         <section className="max-w-6xl mx-auto space-y-8">
//           <h1 className="text-3xl md:text-4xl font-extrabold">Your Dashboard</h1>
//           <ButtonAccount />

//           <div className="mb-4 ">
//             <div className="flex space-x-2 ">
//               {tabData.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`py-2 px-4 ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-500 text-xl font-sans font-semibold' : 'text-black text-xl font-sans font-semibold'}`}
//                 >
//                   {tab.label}
//                   <span className="ml-2 font-sans font-extrabold px-2 py-1  ">
//                     {tab.count}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {activeTab !== 'subscription' && (
//             <div className="mt-4 flex space-x-2">
//               <div className="relative flex-grow">
//                 <input
//                   type="text"
//                   placeholder="Search Answered Questions"
//                   className="pl-10 pr-4 py-2 w-full border "
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               </div>
//             </div>
//           )}

//           {selectedItems.length > 0 && (
//             <div className="mt-4">
//               <button
//                 onClick={() => setShowConfirm(true)}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Remove Selected ({selectedItems.length})
//               </button>
//             </div>
//           )}

//           {showConfirm && (
//             <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
//               <div className="bg-white p-6 rounded-lg">
//                 <p>Do you want to remove {selectedItems.length} item(s)?</p>
//                 <div className="mt-4 flex justify-end">
//                   <button
//                     onClick={handleRemoveSelectedItems}
//                     className="px-4 py-2 bg-red-500 text-white rounded mr-2"
//                   >
//                     Yes
//                   </button>
//                   <button
//                     onClick={() => setShowConfirm(false)}
//                     className="px-4 py-2 bg-gray-300 rounded"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {renderContent()}
//         </section>
//       </main>
//     </>
//   );
// };

// export default Dashboard;

// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Review from "@/components/Review";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchUserResponses(),
//         fetchUserFeedback(),
//         fetchSubscriptionStatus()
//       ]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qtable.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qtable.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qtable.question_text.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectItem = (item) => {
//     setSelectedItems(prev =>
//       prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//     );
//   };

//   const handleRemoveSelectedItems = async () => {
//     if (selectedItems.length > 0) {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("No user found");

//         const ids = selectedItems.map(item => item.id);
//         let tableName = '';

//         switch (activeTab) {
//           case 'feedback':
//             tableName = 'feedback';
//             break;
//           case 'incorrect':
//           case 'flagged':
//           case 'all':
//             tableName = 'user_responses';
//             break;
//           default:
//             return;
//         }

//         const { error } = await supabase
//           .from(tableName)
//           .delete()
//           .in('id', ids)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//         setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//         setSelectedItems([]);
//         setShowConfirm(false);
//       } catch (error) {
//         console.error('Error removing items:', error);
//         setError(error.message);
//       }
//     }
//   };

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => {
//         const choices = {
//           'A': answer.qtable.option_a,
//           'B': answer.qtable.option_b,
//           'C': answer.qtable.option_c,
//           'D': answer.qtable.option_d,
//           'E': answer.qtable.option_e,
//           'F': answer.qtable.option_f
//         };

//         const correctChoice = choices[answer.qtable.correct_choice];
//         const userChoice = choices[answer.user_answer];

//         return (
//           <div
//             key={index}
//             className={`mb-4 p-4 bg-white border-2 ${selectedItems.includes(answer) ? 'border-red-500' : 'border-slate-500'}`}
//             onClick={() => handleSelectItem(answer)}
//           >
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm text-gray-500">{answer.qtable.subject}</span>
//               {answer.user_answer === answer.qtable.correct_choice && <span className="text-green-500">✓</span>}
//               {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <p className="font-semibold ">{answer.qtable.question_text}</p>
//             <p>Your answer: {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//             <p>Correct answer: {correctChoice ? `${answer.qtable.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//             <p>Explanation: {answer.qtable.rationale}</p>
//             {answer.feedback && (
//               <div className="mt-2 p-2 bg-gray-100 ">
//                 <h4 className="font-semibold">Your Feedback:</h4>
//                 <p>Type: {answer.feedback.feedbackType}</p>
//                 {answer.feedback.suggestedAnswer && (
//                   <p>Suggested Answer: {answer.feedback.suggestedAnswer}</p>
//                 )}
//                 <p>Comments: {answer.feedback.feedbackText}</p>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div
//               key={index}
//               className={`mb-4 p-4 border-2 ${selectedItems.includes(feedback) ? 'border-red-500' : 'border-slate-500'} bg-white`}
//               onClick={() => handleSelectItem(feedback)}
//             >
//               <h4 className="font-semibold">Feedback for Question:</h4>
//               <p>{feedback.qtable.question_text}</p>
//               <p className="mt-2"><strong>Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className=" p-6 mb-6">
//             <h2 className="text-2xl font-bold mb-4 text-white">Subscription Status</h2>
//             <p className="text-2xl font-bold mb-4 text-white"><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p className="text-2xl font-bold mb-4 text-white"><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p className="text-2xl font-bold mb-4 text-white"><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p className="text-2xl font-bold mb-4 text-white"><strong>Remaining Days:</strong> {remainingDays}</p>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//               <button className="mt-4 px-4 py-2 bg-blue-500 text-white  hover:bg-blue-600">
//                 Renew Subscription
//               </button>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Header />
//       <section className="w-full mx-auto space-y-8 bg-zinc-800 ">
//         <br />
//         <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center">Your Dashboard </h1>
//         <ButtonAccount />

//         <br />

//       </section>
//       <main className="h-screen  bg-zinc-800">
//         <section className="max-w-6xl mx-auto space-y-8 p-8 pb-24">
//           <div className="mb-4 bg-zinc-800">
//             <div className="flex space-x-2">
//               {tabData.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`py-2 px-4 ${activeTab === tab.id ? 'border-b-2 border-gray-100 text-blue-400 text-xl font-sans font-semibold' : 'text-white text-xl font-sans font-semibold'}`}
//                 >
//                   {tab.label}
//                   <span className="ml-2 font-sans font-extrabold px-2 py-1">
//                     {tab.count}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {activeTab !== 'subscription' && (
//             <div className="mt-4 flex space-x-2">
//               <div className="relative flex-grow">
//                 <input
//                   type="text"
//                   placeholder="Search Answered Questions"
//                   className="pl-10 pr-4 py-2 w-full border"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               </div>
//             </div>
//           )}

//           {selectedItems.length > 0 && (
//             <div className="mt-4">
//               <button
//                 onClick={() => setShowConfirm(true)}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Remove Selected ({selectedItems.length})
//               </button>
//             </div>
//           )}

//           {showConfirm && (
//             <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
//               <div className="bg-white p-6 rounded-lg">
//                 <p>Do you want to remove {selectedItems.length} item(s)?</p>
//                 <div className="mt-4 flex justify-end">
//                   <button
//                     onClick={handleRemoveSelectedItems}
//                     className="px-4 py-2 bg-red-500 text-white rounded mr-2"
//                   >
//                     Yes
//                   </button>
//                   <button
//                     onClick={() => setShowConfirm(false)}
//                     className="px-4 py-2 bg-gray-300 rounded"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {renderContent()}
//         </section>
//       </main>
//     </>
//   );
// };

// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Review from "@/components/Review";
// import Feedback from "@/components/Feedback";
// import Link from 'next/link';


// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchUserResponses(), fetchUserFeedback(), fetchSubscriptionStatus()]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qtable?.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qtable?.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qtable?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectItem = (item) => {
//     setSelectedItems(prev =>
//       prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//     );
//   };

//   const handleRemoveSelectedItems = async () => {
//     if (selectedItems.length > 0) {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("No user found");

//         const ids = selectedItems.map(item => item.id);
//         let tableName = '';

//         switch (activeTab) {
//           case 'feedback':
//             tableName = 'feedback';
//             break;
//           case 'incorrect':
//           case 'flagged':
//           case 'all':
//             tableName = 'user_responses';
//             break;
//           default:
//             return;
//         }

//         const { error } = await supabase
//           .from(tableName)
//           .delete()
//           .in('id', ids)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//         setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//         setSelectedItems([]);
//         setShowConfirm(false);
//       } catch (error) {
//         console.error('Error removing items:', error);
//         setError(error.message);
//       }
//     }
//   };

//   const handleFeedbackSubmit = async (feedbackData) => {
//     try {
//       const response = await fetch('/api/feedback', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(feedbackData)
//       });

//       const result = await response.json();
//       if (result.error) {
//         throw new Error(result.error);
//       }

//       console.log('Feedback submitted successfully:', result.data);
//       setUserFeedback(prev => [...prev, result.data[0]]);
//     } catch (error) {
//       console.error('Error submitting feedback:', error.message);
//     }
//   };

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => {
//         const choices = {
//           'A': answer.qtable?.option_a,
//           'B': answer.qtable?.option_b,
//           'C': answer.qtable?.option_c,
//           'D': answer.qtable?.option_d,
//           'E': answer.qtable?.option_e,
//           'F': answer.qtable?.option_f
//         };

//         const correctChoice = choices[answer.qtable?.correct_choice];
//         const userChoice = choices[answer.user_answer];

//         return (
//           <div
//             key={index} 
//             className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
//             onClick={() => handleSelectItem(answer)}
//           >
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-1xl text-gray-900">{answer.qtable?.subject || 'Unknown Subject'}</span>
//               {answer.user_answer === answer.qtable?.correct_choice && <span className="text-green-500">✓</span>}
              
//               {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <br />
//             <p className="font-semibold ">{answer.qtable?.question_text || 'Question text not available'}</p>
//             <br />
//             <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//             <br />
//             <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qtable?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//             <br />
//             <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qtable?.rationale || 'No explanation available'}</p>
//             <Feedback
//               questionId={answer.qtable?.id}
//               currentAnswer={answer.user_answer}
//               options={Object.entries(answer.qtable || {})
//                 .filter(([key]) => key.startsWith('option_'))
//                 .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
//               onSubmit={handleFeedbackSubmit}
//               existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qtable?.id)}
//             />
//             {userFeedback.some(feedback => feedback?.question_id === answer.qtable?.id) && (
//               <p className="text-green-900 mt-2">Feedback sent</p>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
//               <p> <strong>Question:</strong> {feedback.qtable?.question_text || 'Question text not available'}</p>
//               <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//               <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>

//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
//             <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//             <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p><strong>Remaining Days:</strong> {remainingDays}</p>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//                <Link href="/pricing" passHref>
//                <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                  Renew Subscription
//                </button>
//              </Link>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Header />
//       <main className="p-8 pb-24">
//         <section className="max-w-6xl mx-auto space-y-8">
//           <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//           <ButtonAccount />
//           <div className="space-x-4">
//             {tabData.map(tab => (
//               <button
//                 key={tab.id}
//                 className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
//                   activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
//                 }`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 {tab.label} ({tab.count})
//               </button>
//             ))}
//           </div>
//           <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
//             <Search className="text-slate-500" size={18} />
//             <input
//               type="text"
//               placeholder="Search Questions"
//               className="ml-2 flex-1 focus:outline-none"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           {selectedItems.length > 0 && (
//             <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
//               <p className="text-red-800">You have selected {selectedItems.length} items.</p>
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                 onClick={() => setShowConfirm(true)}
//               >
//                 Remove Selected Items
//               </button>
//               {showConfirm && (
//                 <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//                   <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
//                     <p className="text-red-800">Are you sure you want to remove selected items?</p>
//                     <div className="mt-4 flex space-x-4">
//                       <button
//                         className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                         onClick={handleRemoveSelectedItems}
//                       >
//                         Yes, Remove
//                       </button>
//                       <button
//                         className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                         onClick={() => setShowConfirm(false)}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//           {renderContent()}
//         </section>
//       </main>
//     </>
//   );
// };

// "use client"

// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Feedback from "@/components/Feedback";
// import Link from 'next/link';

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qtable:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchUserResponses(), fetchUserFeedback(), fetchSubscriptionStatus()]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     handleResize(); // Check on initial render
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qtable?.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qtable?.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qtable?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectItem = (item) => {
//     setSelectedItems(prev =>
//       prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//     );
//   };

//   const handleRemoveSelectedItems = async () => {
//     if (selectedItems.length > 0) {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("No user found");

//         const ids = selectedItems.map(item => item.id);
//         let tableName = '';

//         switch (activeTab) {
//           case 'feedback':
//             tableName = 'feedback';
//             break;
//           case 'incorrect':
//           case 'flagged':
//           case 'all':
//             tableName = 'user_responses';
//             break;
//           default:
//             return;
//         }

//         const { error } = await supabase
//           .from(tableName)
//           .delete()
//           .in('id', ids)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//         setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//         setSelectedItems([]);
//         setShowConfirm(false);
//       } catch (error) {
//         console.error('Error removing items:', error);
//         setError(error.message);
//       }
//     }
//   };

//   const handleFeedbackSubmit = async (feedbackData) => {
//     try {
//       const response = await fetch('/api/feedback', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(feedbackData)
//       });

//       const result = await response.json();
//       if (result.error) {
//         throw new Error(result.error);
//       }

//       console.log('Feedback submitted successfully:', result.data);
//       setUserFeedback(prev => [...prev, result.data[0]]);
//     } catch (error) {
//       console.error('Error submitting feedback:', error.message);
//     }
//   };

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => {
//         const choices = {
//           'A': answer.qtable?.option_a,
//           'B': answer.qtable?.option_b,
//           'C': answer.qtable?.option_c,
//           'D': answer.qtable?.option_d,
//           'E': answer.qtable?.option_e,
//           'F': answer.qtable?.option_f
//         };

//         const correctChoice = choices[answer.qtable?.correct_choice];
//         const userChoice = choices[answer.user_answer];

//         return (
//           <div
//             key={index} 
//             className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
//             onClick={() => handleSelectItem(answer)}
//           >
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-1xl text-gray-900">{answer.qtable?.subject || 'Unknown Subject'}</span>
//               {answer.user_answer === answer.qtable?.correct_choice && <span className="text-green-500">✓</span>}
//               {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <br />
//             <p className="font-semibold ">{answer.qtable?.question_text || 'Question text not available'}</p>
//             <br />
//             <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//             <br />
//             <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qtable?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//             <br />
//             <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qtable?.rationale || 'No explanation available'}</p>
//             <Feedback
//               questionId={answer.qtable?.id}
//               currentAnswer={answer.user_answer}
//               options={Object.entries(answer.qtable || {})
//                 .filter(([key]) => key.startsWith('option_'))
//                 .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
//               onSubmit={handleFeedbackSubmit}
//               existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qtable?.id)}
//             />
//             {userFeedback.some(feedback => feedback?.question_id === answer.qtable?.id) && (
//               <p className="text-green-900 mt-2">Feedback sent</p>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
//               <p> <strong>Question:</strong> {feedback.qtable?.question_text || 'Question text not available'}</p>
//               <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//               <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>
//               <p className="mt-2"><strong>Feedback Sent:</strong> {feedback.created_at}</p>

//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
//             <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//             <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p><strong>Remaining Days:</strong> {remainingDays}</p>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//               <Link href="/pricing" passHref>
//                 <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                   Renew Subscription
//                 </button>
//               </Link>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   const renderTabBar = () => (
//     <div className={`btm-nav fixed bottom-0 left-0 right-0 flex justify-around bg-slate-900 text-white md:hidden`}>
//       {tabData.map(tab => (
//         <button
//           key={tab.id}
//           className={`py-2 px-4 flex-1 text-center ${
//             activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-900'
//           }`}
//           onClick={() => setActiveTab(tab.id)}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span className="btm-nav-label text-xs">{tab.label}</span>
//         </button>
//       ))}
//     </div>
//   );

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Header />
//         <main className="p-8 pb-24">
          
//           <section className="max-w-6xl mx-auto space-y-8">
//             <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//             <h1 className="text-3xl md:text-1xl font-extrabold">This your Dashboard, please select</h1>

//             <ButtonAccount />
//             <div className="space-x-4 hidden md:flex">
//               {tabData.map(tab => (
//                 <button
//                   key={tab.id}
//                   className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
//                     activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
//                   }`}
//                   onClick={() => setActiveTab(tab.id)}
//                 >
//                   {tab.label} ({tab.count})
//                 </button>
//               ))}
//             </div>
//             <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
//               <Search className="text-slate-500" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search Questions"
//                 className="ml-2 flex-1 focus:outline-none"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {selectedItems.length > 0 && (
//               <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
//                 <p className="text-red-800">You have selected {selectedItems.length} items.</p>
//                 <button
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                   onClick={() => setShowConfirm(true)}
//                 >
//                   Remove Selected Items
//                 </button>
//                 {showConfirm && (
//                   <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//                     <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
//                       <p className="text-red-800">Are you sure you want to remove selected items?</p>
//                       <div className="mt-4 flex space-x-4">
//                         <button
//                           className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                           onClick={handleRemoveSelectedItems}
//                         >
//                           Yes, Remove
//                         </button>
//                         <button
//                           className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                           onClick={() => setShowConfirm(false)}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//             {renderContent()}
//           </section>
//         </main>
//         {renderTabBar()}
//       </Suspense>
//     </>
//   );
// };

// // export default Dashboard;
// "use client"

// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Feedback from "@/components/Feedback";
// import Link from 'next/link';

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qs:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qs:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchUserResponses(), fetchUserFeedback(), fetchSubscriptionStatus()]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     handleResize(); // Check on initial render
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qs?.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qs?.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qs?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectItem = (item) => {
//     setSelectedItems(prev =>
//       prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//     );
//   };

//   const handleRemoveSelectedItems = async () => {
//     if (selectedItems.length > 0) {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("No user found");

//         const ids = selectedItems.map(item => item.id);
//         let tableName = '';

//         switch (activeTab) {
//           case 'feedback':
//             tableName = 'feedback';
//             break;
//           case 'incorrect':
//           case 'flagged':
//           case 'all':
//             tableName = 'user_responses';
//             break;
//           default:
//             return;
//         }

//         const { error } = await supabase
//           .from(tableName)
//           .delete()
//           .in('id', ids)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//         setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//         setSelectedItems([]);
//         setShowConfirm(false);
//       } catch (error) {
//         console.error('Error removing items:', error);
//         setError(error.message);
//       }
//     }
//   };

//   const handleFeedbackSubmit = async (feedbackData) => {
//     try {
//       const response = await fetch('/api/feedback', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(feedbackData)
//       });

//       const result = await response.json();
//       if (result.error) {
//         throw new Error(result.error);
//       }

//       console.log('Feedback submitted successfully:', result.data);
//       setUserFeedback(prev => [...prev, result.data[0]]);
//     } catch (error) {
//       console.error('Error submitting feedback:', error.message);
//     }
//   };

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => {
//         const choices = {
//           'A': answer.qs?.option_a,
//           'B': answer.qs?.option_b,
//           'C': answer.qs?.option_c,
//           'D': answer.qs?.option_d,
//           'E': answer.qs?.option_e,
//           'F': answer.qs?.option_f
//         };

//         const correctChoice = choices[answer.qs?.correct_choice];
//         const userChoice = choices[answer.user_answer];

//         return (
//           <div
//             key={index} 
//             className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
//             onClick={() => handleSelectItem(answer)}
//           >
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-1xl text-gray-900">{answer.qs?.subject || 'Unknown Subject'}</span>
//               {answer.user_answer === answer.qs?.correct_choice && <span className="text-green-500">✓</span>}
//               {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <br />
//             <p className="font-semibold ">{answer.qs?.question_text || 'Question text not available'}</p>
//             <br />
//             <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//             <br />
//             <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qs?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//             <br />
//             <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qs?.rationale || 'No explanation available'}</p>
//             <Feedback
//               questionId={answer.qs?.id}
//               currentAnswer={answer.user_answer}
//               options={Object.entries(answer.qs || {})
//                 .filter(([key]) => key.startsWith('option_'))
//                 .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
//               onSubmit={handleFeedbackSubmit}
//               existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qs?.id)}
//             />
//             {userFeedback.some(feedback => feedback?.question_id === answer.qs?.id) && (
//               <p className="text-green-900 mt-2">Feedback sent</p>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
//               <p> <strong>Question:</strong> {feedback.qs?.question_text || 'Question text not available'}</p>
//               <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//               <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>
//               <p className="mt-2"><strong>Feedback Sent:</strong> {feedback.created_at}</p>
//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
//             <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//             <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p><strong>Remaining Days:</strong> {remainingDays}</p>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//               <Link href="/pricing" passHref>
//                 <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                   Renew Subscription
//                 </button>
//               </Link>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   const renderTabBar = () => (
//     <div className={`btm-nav fixed bottom-0 left-0 right-0 flex justify-around bg-slate-900 text-white md:hidden`}>
//       {tabData.map(tab => (
//         <button
//           key={tab.id}
//           className={`py-2 px-4 flex-1 text-center ${
//             activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-900'
//           }`}
//           onClick={() => setActiveTab(tab.id)}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span className="btm-nav-label text-xs">{tab.label}</span>
//         </button>
//       ))}
//     </div>
//   );

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Header />
//         <main className="p-8 pb-24">
          
//           <section className="max-w-6xl mx-auto space-y-8">
//             <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//             <h1 className="text-3xl md:text-1xl font-extrabold">This your Dashboard, please select</h1>

//             <ButtonAccount />
//             <div className="space-x-4 hidden md:flex">
//               {tabData.map(tab => (
//                 <button
//                   key={tab.id}
//                   className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
//                     activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
//                   }`}
//                   onClick={() => setActiveTab(tab.id)}
//                 >
//                   {tab.label} ({tab.count})
//                 </button>
//               ))}
//             </div>
//             <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
//               <Search className="text-slate-500" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search Questions"
//                 className="ml-2 flex-1 focus:outline-none"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {selectedItems.length > 0 && (
//               <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
//                 <p className="text-red-800">You have selected {selectedItems.length} items.</p>
//                 <button
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                   onClick={() => setShowConfirm(true)}
//                 >
//                   Remove Selected Items
//                 </button>
//                 {showConfirm && (
//                   <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//                     <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
//                       <p className="text-red-800">Are you sure you want to remove selected items?</p>
//                       <div className="mt-4 flex space-x-4">
//                         <button
//                           className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                           onClick={handleRemoveSelectedItems}
//                         >
//                           Yes, Remove
//                         </button>
//                         <button
//                           className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                           onClick={() => setShowConfirm(false)}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//             {renderContent()}
//           </section>
//         </main>
//         {renderTabBar()}
//       </Suspense>
//     </>
//   );
// };

// // export default Dashboard;
// "use client";

// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Feedback from "@/components/Feedback";
// import Link from 'next/link';

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [userResponses, setUserResponses] = useState([]);
//   const [userFeedback, setUserFeedback] = useState([]);
//   const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const supabase = createClientComponentClient();

//   const fetchUserResponses = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('user_responses')
//         .select(`
//           *,
//           qs:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserResponses(data);
//     } catch (error) {
//       console.error('Error fetching user responses:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchUserFeedback = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('feedback')
//         .select(`
//           *,
//           qs:question_id (*)
//         `)
//         .eq('user_id', user.id);

//       if (error) throw error;

//       setUserFeedback(data);
//     } catch (error) {
//       console.error('Error fetching user feedback:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   const fetchSubscriptionStatus = useCallback(async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("No user found");

//       const { data, error } = await supabase
//         .from('subscribers')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('subscription_end', { ascending: false })
//         .limit(1);

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setSubscriptionStatus(data[0]);
//       } else {
//         setSubscriptionStatus(null);
//       }
//     } catch (error) {
//       console.error('Error fetching subscription status:', error);
//       setError(error.message);
//     }
//   }, [supabase]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchUserResponses(), fetchUserFeedback(), fetchSubscriptionStatus()]);
//       setLoading(false);
//     };

//     fetchData();
//   }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     handleResize(); // Check on initial render
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const correctAnswers = userResponses.filter(response => response.user_answer === response.qs?.correct_choice);
//   const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qs?.correct_choice && response.user_answer !== null);
//   const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//   const calculateRemainingDays = (endDate) => {
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const remainingDays = subscriptionStatus ? calculateRemainingDays(subscriptionStatus.subscription_end) : 0;

//   const tabData = [
//     { id: 'all', label: 'All', count: userResponses.length },
//     { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//     { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//     { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//     { id: 'subscription', label: 'Subscription', count: remainingDays }
//   ];

//   const getAnswersForTab = (tabId) => {
//     switch (tabId) {
//       case 'incorrect': return incorrectAnswers;
//       case 'flagged': return flaggedQuestions;
//       default: return userResponses;
//     }
//   };

//   const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//     answer.qs?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelectItem = (item) => {
//     setSelectedItems(prev =>
//       prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//     );
//   };

//   const handleRemoveSelectedItems = async () => {
//     if (selectedItems.length > 0) {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) throw new Error("No user found");

//         const ids = selectedItems.map(item => item.id);
//         let tableName = '';

//         switch (activeTab) {
//           case 'feedback':
//             tableName = 'feedback';
//             break;
//           case 'incorrect':
//           case 'flagged':
//           case 'all':
//             tableName = 'user_responses';
//             break;
//           default:
//             return;
//         }

//         const { error } = await supabase
//           .from(tableName)
//           .delete()
//           .in('id', ids)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//         setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//         setSelectedItems([]);
//         setShowConfirm(false);
//       } catch (error) {
//         console.error('Error removing items:', error);
//         setError(error.message);
//       }
//     }
//   };

//   const handleFeedbackSubmit = async (feedbackData) => {
//     try {
//       const response = await fetch('/api/feedback', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(feedbackData)
//       });

//       const result = await response.json();
//       if (result.error) {
//         throw new Error(result.error);
//       }

//       console.log('Feedback submitted successfully:', result.data);
//       setUserFeedback(prev => [...prev, result.data[0]]);
//     } catch (error) {
//       console.error('Error submitting feedback:', error.message);
//     }
//   };

//   const renderAnswers = (answers) => (
//     <div>
//       {answers.map((answer, index) => {
//         const choices = {
//           'A': answer.qs?.option_a,
//           'B': answer.qs?.option_b,
//           'C': answer.qs?.option_c,
//           'D': answer.qs?.option_d,
//           'E': answer.qs?.option_e,
//           'F': answer.qs?.option_f
//         };

//         const correctChoice = choices[answer.qs?.correct_choice];
//         const userChoice = choices[answer.user_answer];

//         return (
//           <div
//             key={index} 
//             className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
//             onClick={() => handleSelectItem(answer)}
//           >
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-1xl text-gray-900">{answer.qs?.subject || 'Unknown Subject'}</span>
//               {answer.user_answer === answer.qs?.correct_choice && <span className="text-green-500">✓</span>}
//               {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//             </div>
//             <br />
//             <p className="font-semibold ">{answer.qs?.question_text || 'Question text not available'}</p>
//             <br />
//             <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//             <br />
//             <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qs?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//             <br />
//             <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qs?.rationale || 'No explanation available'}</p>
//             <Feedback
//               questionId={answer.qs?.id}
//               currentAnswer={answer.user_answer}
//               options={Object.entries(answer.qs || {})
//                 .filter(([key]) => key.startsWith('option_'))
//                 .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
//               onSubmit={handleFeedbackSubmit}
//               existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qs?.id)}
//             />
//             {userFeedback.some(feedback => feedback?.question_id === answer.qs?.id) && (
//               <p className="text-green-900 mt-2">Feedback sent</p>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   const renderContent = () => {
//     let content;
//     switch (activeTab) {
//       case 'feedback':
//         content = userFeedback.length > 0 ? (
//           userFeedback.map((feedback, index) => (
//             <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
//               <p> <strong>Question:</strong> {feedback.qs?.question_text || 'Question text not available'}</p>
//               <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
//               {feedback.suggested_answer && (
//                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//               )}
//               <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//               <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>
//               <p className="mt-2"><strong>Feedback Sent:</strong> {feedback.created_at}</p>
//             </div>
//           ))
//         ) : (
//           <p>No feedback submitted yet.</p>
//         );
//         break;
//       case 'subscription':
//         content = subscriptionStatus ? (
//           <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
//             <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//             <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//             <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//             <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//             <p><strong>Remaining Days:</strong> {remainingDays}</p>
//             <Link href="/pricing" passHref>
//                 <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                   Renew Subscription
//                 </button>
//               </Link>
//             {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//               <Link href="/pricing" passHref>
//                 <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                   Renew Subscription
//                 </button>
//               </Link>
//             )}
//           </div>
//         ) : (
//           <p>No active subscription found.</p>
//         );
//         break;
//       default:
//         content = renderAnswers(filteredAnswers);
//     }

//     return content ? <div className="mt-4">{content}</div> : null;
//   };

//   const renderTabBar = () => (
//     <div className={`btm-nav fixed bottom-0 left-0 right-0 flex justify-around bg-slate-900 text-white md:hidden`}>
//       {tabData.map(tab => (
//         <button
//           key={tab.id}
//           className={`py-2 px-4 flex-1 text-center ${
//             activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-900'
//           }`}
//           onClick={() => setActiveTab(tab.id)}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span className="btm-nav-label text-xs">{tab.label}</span>
//         </button>
//       ))}
//     </div>
//   );

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Header />
//         <main className="p-8 pb-24">
//           <section className="max-w-6xl mx-auto space-y-8">
//             <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//             <h1 className="text-3xl md:text-1xl font-light">Review your answers</h1>

//             <ButtonAccount />
//             <div className="space-x-4 hidden md:flex">
//               {tabData.map(tab => (
//                 <button
//                   key={tab.id}
//                   className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
//                     activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
//                   }`}
//                   onClick={() => setActiveTab(tab.id)}
//                 >
//                   {tab.label} ({tab.count})
//                 </button>
//               ))}
//             </div>
//             <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
//               <Search className="text-slate-500" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search Questions"
//                 className="ml-2 flex-1 focus:outline-none"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {selectedItems.length > 0 && (
//               <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
//                 <p className="text-red-800">You have selected {selectedItems.length} items.</p>
//                 <button
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                   onClick={() => setShowConfirm(true)}
//                 >
//                   Remove Selected Items
//                 </button>
//                 {showConfirm && (
//                   <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//                     <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
//                       <p className="text-red-800">Are you sure you want to remove selected items?</p>
//                       <div className="mt-4 flex space-x-4">
//                         <button
//                           className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                           onClick={handleRemoveSelectedItems}
//                         >
//                           Yes, Remove
//                         </button>
//                         <button
//                           className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                           onClick={() => setShowConfirm(false)}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//             {renderContent()}
//           </section>
//         </main>
//         {renderTabBar()}
//       </Suspense>
//     </>
//   );
// };


// 'use client';

// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Feedback from "@/components/Feedback";
// import Link from 'next/link';

// const Dashboard = () => {
//     const [activeTab, setActiveTab] = useState('all');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [userResponses, setUserResponses] = useState([]);
//     const [userFeedback, setUserFeedback] = useState([]);
//     const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedItems, setSelectedItems] = useState([]);
//     const [showConfirm, setShowConfirm] = useState(false);
//     const [isMobile, setIsMobile] = useState(false);
//     const [examOptions, setExamOptions] = useState([]);
//     const [selectedExam, setSelectedExam] = useState('');
//     const supabase = createClientComponentClient();

//     const fetchExamOptions = useCallback(async () => {
//         try {
//             const { data, error } = await supabase.from('exams').select('id, initials, name');
//             if (error) throw error;
//             setExamOptions(data);
//         } catch (error) {
//             console.error('Error fetching exam options:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     const fetchUserResponses = useCallback(async (user) => {
//         try {
//             const { data, error } = await supabase
//                 .from('user_responses')
//                 .select(`
//                     *,
//                     qs:question_id (*)
//                 `)
//                 .eq('user_id', user.id);

//             if (error) throw error;

//             setUserResponses(data);
//         } catch (error) {
//             console.error('Error fetching user responses:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     const fetchUserFeedback = useCallback(async (user) => {
//         try {
//             const { data, error } = await supabase
//                 .from('feedback')
//                 .select(`
//                     *,
//                     qs:question_id (*)
//                 `)
//                 .eq('user_id', user.id);

//             if (error) throw error;

//             setUserFeedback(data);
//         } catch (error) {
//             console.error('Error fetching user feedback:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     const fetchSubscriptionStatus = useCallback(async (user) => {
//         try {
//             const { data, error } = await supabase
//                 .from('user_data')
//                 .select('*')
//                 .eq('user_id', user.id)
//                 .order('subscription_end', { ascending: false })
//                 .limit(1);

//             if (error) throw error;

//             if (data && data.length > 0) {
//                 const subscription = data[0];
//                 const now = new Date();
//                 const end = new Date(subscription.subscription_end);
//                 subscription.remaining_days = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//                 setSubscriptionStatus(subscription);
//                 setSelectedExam(subscription.examname);
//             } else {
//                 setSubscriptionStatus(null);
//             }
//         } catch (error) {
//             console.error('Error fetching subscription status:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             const { data: { user } } = await supabase.auth.getUser();
//             if (user) {
//                 await Promise.all([fetchUserResponses(user), fetchUserFeedback(user), fetchSubscriptionStatus(user), fetchExamOptions()]);
//             }
//             setLoading(false);
//         };

//         fetchData();
//     }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus, fetchExamOptions]);

//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(window.innerWidth <= 768);
//         };

//         handleResize(); // Check on initial render
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const correctAnswers = userResponses.filter(response => response.user_answer === response.qs?.correct_choice);
//     const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qs?.correct_choice && response.user_answer !== null);
//     const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//     const tabData = [
//         { id: 'all', label: 'All', count: userResponses.length },
//         { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//         { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//         { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//         { id: 'subscription', label: 'Subscription', count: subscriptionStatus?.remaining_days ?? 0 }
//     ];

//     const getAnswersForTab = (tabId) => {
//         switch (tabId) {
//             case 'incorrect': return incorrectAnswers;
//             case 'flagged': return flaggedQuestions;
//             default: return userResponses;
//         }
//     };

//     const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//         answer.qs?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const handleSelectItem = (item) => {
//         setSelectedItems(prev =>
//             prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//         );
//     };

//     const handleRemoveSelectedItems = async () => {
//         if (selectedItems.length > 0) {
//             try {
//                 const { data: { user } } = await supabase.auth.getUser();
//                 if (!user) throw new Error("No user found");

//                 const ids = selectedItems.map(item => item.id);
//                 let tableName = '';

//                 switch (activeTab) {
//                     case 'feedback':
//                         tableName = 'feedback';
//                         break;
//                     case 'incorrect':
//                     case 'flagged':
//                     case 'all':
//                         tableName = 'user_responses';
//                         break;
//                     default:
//                         return;
//                 }

//                 const { error } = await supabase
//                     .from(tableName)
//                     .delete()
//                     .in('id', ids)
//                     .eq('user_id', user.id);

//                 if (error) throw error;

//                 setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//                 setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//                 setSelectedItems([]);
//                 setShowConfirm(false);
//             } catch (error) {
//                 console.error('Error removing items:', error);
//                 setError(error.message);
//             }
//         }
//     };

//     const handleFeedbackSubmit = async (feedbackData) => {
//         try {
//             const response = await fetch('/api/feedback', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(feedbackData)
//             });

//             const result = await response.json();
//             if (result.error) {
//                 throw new Error(result.error);
//             }

//             console.log('Feedback submitted successfully:', result.data);
//             setUserFeedback(prev => [...prev, result.data[0]]);
//         } catch (error) {
//             console.error('Error submitting feedback:', error.message);
//         }
//     };

//     const handleExamSelect = async (e) => {
//         const selectedExamInitials = e.target.value;
//         setSelectedExam(selectedExamInitials);

//         try {
//             const { data: { user } } = await supabase.auth.getUser();
//             if (!user) throw new Error("No user found");

//             const selectedExam = examOptions.find(exam => exam.initials === selectedExamInitials);

//             const { data, error } = await supabase
//                 .from('user_data')
//                 .upsert(
//                     {
//                         user_id: user.id,
//                         name: user.user_metadata.full_name || user.email,
//                         email: user.email,
//                         examname: selectedExamInitials,
//                         subscription_start: null,
//                         subscription_end: null,
//                         remaining_days: null,
//                         trial: null
//                     },
//                     { onConflict: ['user_id', 'examname'] }
//                 );

//             if (error) throw error;

//             setSubscriptionStatus({
//                 user_id: user.id,
//                 name: user.user_metadata.full_name || user.email,
//                 email: user.email,
//                 examname: selectedExamInitials,
//                 subscription_start: null,
//                 subscription_end: null,
//                 remaining_days: null,
//                 trial: null
//             });
//         } catch (error) {
//             console.error('Error saving selected exam:', error);
//             setError(error.message);
//         }
//     };

//     const renderAnswers = (answers) => (
//         <div>
//             {answers.map((answer, index) => {
//                 const choices = {
//                     'A': answer.qs?.option_a,
//                     'B': answer.qs?.option_b,
//                     'C': answer.qs?.option_c,
//                     'D': answer.qs?.option_d,
//                     'E': answer.qs?.option_e,
//                     'F': answer.qs?.option_f
//                 };

//                 const correctChoice = choices[answer.qs?.correct_choice];
//                 const userChoice = choices[answer.user_answer];

//                 return (
//                     <div
//                         key={index}
//                         className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
//                         onClick={() => handleSelectItem(answer)}
//                     >
//                         <div className="flex justify-between items-center mb-2">
//                             <span className="text-1xl text-gray-900">{answer.qs?.subject || 'Unknown Subject'}</span>
//                             {answer.user_answer === answer.qs?.correct_choice && <span className="text-green-500">✓</span>}
//                             {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//                         </div>
//                         <br />
//                         <p className="font-semibold ">{answer.qs?.question_text || 'Question text not available'}</p>
//                         <br />
//                         <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//                         <br />
//                         <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qs?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//                         <br />
//                         <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qs?.rationale || 'No explanation available'}</p>
//                         <Feedback
//                             questionId={answer.qs?.id}
//                             currentAnswer={answer.user_answer}
//                             options={Object.entries(answer.qs || {})
//                                 .filter(([key]) => key.startsWith('option_'))
//                                 .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
//                             onSubmit={handleFeedbackSubmit}
//                             existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qs?.id)}
//                         />
//                         {userFeedback.some(feedback => feedback?.question_id === answer.qs?.id) && (
//                             <p className="text-green-900 mt-2">Feedback sent</p>
//                         )}
//                     </div>
//                 );
//             })}
//         </div>
//     );

//     const renderContent = () => {
//         let content;
//         switch (activeTab) {
//             case 'feedback':
//                 content = userFeedback.length > 0 ? (
//                     userFeedback.map((feedback, index) => (
//                         <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
//                             <p> <strong>Question:</strong> {feedback.qs?.question_text || 'Question text not available'}</p>
//                             <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
//                             {feedback.suggested_answer && (
//                                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//                             )}
//                             <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//                             <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>
//                             <p className="mt-2"><strong>Feedback Sent:</strong> {feedback.created_at}</p>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No feedback submitted yet.</p>
//                 );
//                 break;
//             case 'subscription':
//                 content = subscriptionStatus ? (
//                     <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
//                         <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//                         <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//                         <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//                         <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//                         <p><strong>Remaining Days:</strong> {subscriptionStatus.remaining_days}</p>
//                         <Link href="/pricing" passHref>
//                             <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                                 Renew Subscription
//                             </button>
//                         </Link>
//                         {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//                             <Link href="/pricing" passHref>
//                                 <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                                     Renew Subscription
//                                 </button>
//                             </Link>
//                         )}
//                     </div>
//                 ) : (
//                     <p>No active subscription found.</p>
//                 );
//                 break;
//             default:
//                 content = renderAnswers(filteredAnswers);
//         }

//         return content ? <div className="mt-4">{content}</div> : null;
//     };

//     const renderTabBar = () => (
//         <div className={`btm-nav fixed bottom-0 left-0 right-0 flex justify-around bg-slate-900 text-white md:hidden`}>
//             {tabData.map(tab => (
//                 <button
//                     key={tab.id}
//                     className={`py-2 px-4 flex-1 text-center ${
//                         activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-900'
//                     }`}
//                     onClick={() => setActiveTab(tab.id)}
//                 >
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span className="btm-nav-label text-xs">{tab.label}</span>
//                 </button>
//             ))}
//         </div>
//     );

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <>
//             <Suspense fallback={<div>Loading...</div>}>
//                 <Header />
//                 <main className="p-8 pb-24">
//                     <section className="max-w-6xl mx-auto space-y-8">
//                         <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//                         <h1 className="text-3xl md:text-1xl font-light">Review your answers</h1>
//                         {subscriptionStatus?.examname ? (
//                             <div className="mt-4">
//                                 <h2 className="text-xl font-bold mb-4">Your Exam</h2>
//                                 <p className="text-lg">{subscriptionStatus.examname}</p>
//                             </div>
//                         ) : (
//                             <div className="mt-4">
//                                 <h2 className="text-xl font-bold mb-4">Select Your Exam</h2>
//                                 <select
//                                     value={selectedExam}
//                                     onChange={handleExamSelect}
//                                     className="w-full p-2 border border-gray-300 rounded"
//                                 >
//                                     <option value="">Select an exam</option>
//                                     {examOptions.map((exam) => (
//                                         <option key={exam.id} value={exam.initials}>
//                                             {exam.initials}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                         <ButtonAccount />
//                         <div className="space-x-4 hidden md:flex">
//                             {tabData.map(tab => (
//                                 <button
//                                     key={tab.id}
//                                     className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
//                                         activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
//                                     }`}
//                                     onClick={() => setActiveTab(tab.id)}
//                                 >
//                                     {tab.label} ({tab.count})
//                                 </button>
//                             ))}
//                         </div>
//                         <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
//                             <Search className="text-slate-500" size={18} />
//                             <input
//                                 type="text"
//                                 placeholder="Search Questions"
//                                 className="ml-2 flex-1 focus:outline-none"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                         </div>
//                         {selectedItems.length > 0 && (
//                             <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
//                                 <p className="text-red-800">You have selected {selectedItems.length} items.</p>
//                                 <button
//                                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                                     onClick={() => setShowConfirm(true)}
//                                 >
//                                     Remove Selected Items
//                                 </button>
//                                 {showConfirm && (
//                                     <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//                                         <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
//                                             <p className="text-red-800">Are you sure you want to remove selected items?</p>
//                                             <div className="mt-4 flex space-x-4">
//                                                 <button
//                                                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                                                     onClick={handleRemoveSelectedItems}
//                                                 >
//                                                     Yes, Remove
//                                                 </button>
//                                                 <button
//                                                     className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                                                     onClick={() => setShowConfirm(false)}
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                         {renderContent()}
//                     </section>
//                 </main>
//                 {renderTabBar()}
//             </Suspense>
//         </>
//     );
// };

// export default Dashboard;



//// 🚩🚩🚩🚩🚩🚩this following code is excellent 132345

// 'use client';

// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Search } from 'lucide-react';
// import ButtonAccount from "@/components/ButtonAccount";
// import Header from "@/components/Header";
// import Feedback from "@/components/Feedback";
// import Link from 'next/link';

// const Dashboard = () => {
//     const [activeTab, setActiveTab] = useState('all');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [userResponses, setUserResponses] = useState([]);
//     const [userFeedback, setUserFeedback] = useState([]);
//     const [subscriptionStatus, setSubscriptionStatus] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedItems, setSelectedItems] = useState([]);
//     const [showConfirm, setShowConfirm] = useState(false);
//     const [isMobile, setIsMobile] = useState(false);
//     const supabase = createClientComponentClient();

//     const fetchUserResponses = useCallback(async (user) => {
//         try {
//             const { data, error } = await supabase
//                 .from('user_responses')
//                 .select(`
//                     *,
//                     qs:question_id (*)
//                 `)
//                 .eq('user_id', user.id);

//             if (error) throw error;

//             setUserResponses(data);
//         } catch (error) {
//             console.error('Error fetching user responses:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     const fetchUserFeedback = useCallback(async (user) => {
//         try {
//             const { data, error } = await supabase
//                 .from('feedback')
//                 .select(`
//                     *,
//                     qs:question_id (*)
//                 `)
//                 .eq('user_id', user.id);

//             if (error) throw error;

//             setUserFeedback(data);
//         } catch (error) {
//             console.error('Error fetching user feedback:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     const fetchSubscriptionStatus = useCallback(async (user) => {
//         try {
//             const { data, error } = await supabase
//                 .from('user_data')
//                 .select('*')
//                 .eq('user_id', user.id)
//                 .order('subscription_end', { ascending: false })
//                 .limit(1);

//             if (error) throw error;

//             if (data && data.length > 0) {
//                 const subscription = data[0];
//                 const now = new Date();
//                 const end = new Date(subscription.subscription_end);
//                 subscription.remaining_days = Math.floor((end - now) / (1000 * 60 * 60 * 24));
//                 setSubscriptionStatus(subscription);
//             } else {
//                 setSubscriptionStatus(null);
//             }
//         } catch (error) {
//             console.error('Error fetching subscription status:', error);
//             setError(error.message);
//         }
//     }, [supabase]);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             const { data: { user } } = await supabase.auth.getUser();
//             if (user) {
//                 await Promise.all([fetchUserResponses(user), fetchUserFeedback(user), fetchSubscriptionStatus(user)]);
//             }
//             setLoading(false);
//         };

//         fetchData();
//     }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus]);

//     useEffect(() => {
//         const handleResize = () => {
//             setIsMobile(window.innerWidth <= 768);
//         };

//         handleResize(); // Check on initial render
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const correctAnswers = userResponses.filter(response => response.user_answer === response.qs?.correct_choice);
//     const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qs?.correct_choice && response.user_answer !== null);
//     const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

//     const tabData = [
//         { id: 'all', label: 'All', count: userResponses.length },
//         { id: 'flagged', label: 'Flagged', count: flaggedQuestions.length },
//         { id: 'incorrect', label: 'Incorrect', count: incorrectAnswers.length },
//         { id: 'feedback', label: 'Feedback', count: userFeedback.length },
//         { id: 'subscription', label: 'Subscription', count: subscriptionStatus?.remaining_days ?? 0 }
//     ];

//     const getAnswersForTab = (tabId) => {
//         switch (tabId) {
//             case 'incorrect': return incorrectAnswers;
//             case 'flagged': return flaggedQuestions;
//             default: return userResponses;
//         }
//     };

//     const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
//         answer.qs?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const handleSelectItem = (item) => {
//         setSelectedItems(prev =>
//             prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
//         );
//     };

//     const handleRemoveSelectedItems = async () => {
//         if (selectedItems.length > 0) {
//             try {
//                 const { data: { user } } = await supabase.auth.getUser();
//                 if (!user) throw new Error("No user found");

//                 const ids = selectedItems.map(item => item.id);
//                 let tableName = '';

//                 switch (activeTab) {
//                     case 'feedback':
//                         tableName = 'feedback';
//                         break;
//                     case 'incorrect':
//                     case 'flagged':
//                     case 'all':
//                         tableName = 'user_responses';
//                         break;
//                     default:
//                         return;
//                 }

//                 const { error } = await supabase
//                     .from(tableName)
//                     .delete()
//                     .in('id', ids)
//                     .eq('user_id', user.id);

//                 if (error) throw error;

//                 setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
//                 setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
//                 setSelectedItems([]);
//                 setShowConfirm(false);
//             } catch (error) {
//                 console.error('Error removing items:', error);
//                 setError(error.message);
//             }
//         }
//     };

//     const handleFeedbackSubmit = async (feedbackData) => {
//         try {
//             const response = await fetch('/api/feedback', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(feedbackData)
//             });

//             const result = await response.json();
//             if (result.error) {
//                 throw new Error(result.error);
//             }

//             console.log('Feedback submitted successfully:', result.data);
//             setUserFeedback(prev => [...prev, result.data[0]]);
//         } catch (error) {
//             console.error('Error submitting feedback:', error.message);
//         }
//     };

//     const renderAnswers = (answers) => (
//         <div>
//             {answers.map((answer, index) => {
//                 const choices = {
//                     'A': answer.qs?.option_a,
//                     'B': answer.qs?.option_b,
//                     'C': answer.qs?.option_c,
//                     'D': answer.qs?.option_d,
//                     'E': answer.qs?.option_e,
//                     'F': answer.qs?.option_f
//                 };

//                 const correctChoice = choices[answer.qs?.correct_choice];
//                 const userChoice = choices[answer.user_answer];

//                 return (
//                     <div
//                         key={index}
//                         className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
//                         onClick={() => handleSelectItem(answer)}
//                     >
//                         <div className="flex justify-between items-center mb-2">
//                             <span className="text-1xl text-gray-900">{answer.qs?.subject || 'Unknown Subject'}</span>
//                             {answer.user_answer === answer.qs?.correct_choice && <span className="text-green-500">✓</span>}
//                             {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
//                         </div>
//                         <br />
//                         <p className="font-semibold ">{answer.qs?.question_text || 'Question text not available'}</p>
//                         <br />
//                         <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
//                         <br />
//                         <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qs?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
//                         <br />
//                         <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qs?.rationale || 'No explanation available'}</p>
//                         <Feedback
//                             questionId={answer.qs?.id}
//                             currentAnswer={answer.user_answer}
//                             options={Object.entries(answer.qs || {})
//                                 .filter(([key]) => key.startsWith('option_'))
//                                 .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
//                             onSubmit={handleFeedbackSubmit}
//                             existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qs?.id)}
//                         />
//                         {userFeedback.some(feedback => feedback?.question_id === answer.qs?.id) && (
//                             <p className="text-green-900 mt-2">Feedback sent</p>
//                         )}
//                     </div>
//                 );
//             })}
//         </div>
//     );

//     const renderContent = () => {
//         let content;
//         switch (activeTab) {
//             case 'feedback':
//                 content = userFeedback.length > 0 ? (
//                     userFeedback.map((feedback, index) => (
//                         <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
//                             <p> <strong>Question:</strong> {feedback.qs?.question_text || 'Question text not available'}</p>
//                             <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
//                             {feedback.suggested_answer && (
//                                 <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
//                             )}
//                             <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
//                             <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>
//                             <p className="mt-2"><strong>Feedback Sent:</strong> {feedback.created_at}</p>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No feedback submitted yet.</p>
//                 );
//                 break;
//             case 'subscription':
//                 content = subscriptionStatus ? (
//                     <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
//                         <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
//                         <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
//                         <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
//                         <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
//                         <p><strong>Remaining Days:</strong> {subscriptionStatus.remaining_days}</p>
//                         <Link href="/pricing" legacyBehavior>
//                             <a className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                                 Renew Subscription
//                             </a>
//                         </Link>
//                         {new Date(subscriptionStatus.subscription_end) <= new Date() && (
//                             <Link href="/pricing" legacyBehavior>
//                                 <a className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                                     Renew Subscription
//                                 </a>
//                             </Link>
//                         )}
//                     </div>
//                 ) : (
//                     <p>No active subscription found.</p>
//                 );
//                 break;
//             default:
//                 content = renderAnswers(filteredAnswers);
//         }

//         return content ? <div className="mt-4">{content}</div> : null;
//     };

//     const renderTabBar = () => (
//         <div className={`btm-nav fixed bottom-0 left-0 right-0 flex justify-around bg-slate-900 text-white md:hidden`}>
//             {tabData.map(tab => (
//                 <button
//                     key={tab.id}
//                     className={`py-2 px-4 flex-1 text-center ${
//                         activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-900'
//                     }`}
//                     onClick={() => setActiveTab(tab.id)}
//                 >
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span className="btm-nav-label text-xs">{tab.label}</span>
//                 </button>
//             ))}
//         </div>
//     );

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <>
//             <Suspense fallback={<div>Loading...</div>}>
//                 <Header />
//                 <main className="p-8 pb-24">
//                     <section className="max-w-6xl mx-auto space-y-8">
//                         <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//                         <h1 className="text-3xl md:text-1xl font-light">Review your answers</h1>
//                         {subscriptionStatus?.examname && (
//                             <div className="mt-4">
//                                 <h2 className="text-xl font-bold mb-4">Your Exam</h2>
//                                 <p className="text-lg">{subscriptionStatus.examname} <Link href="/" legacyBehavior><a className="text-blue-500">Go to Homepage</a></Link></p>
//                             </div>
//                         )}
//                         <ButtonAccount />
//                         <div className="space-x-4 hidden md:flex">
//                             {tabData.map(tab => (
//                                 <button
//                                     key={tab.id}
//                                     className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
//                                         activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
//                                     }`}
//                                     onClick={() => setActiveTab(tab.id)}
//                                 >
//                                     {tab.label} ({tab.count})
//                                 </button>
//                             ))}
//                         </div>
//                         <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
//                             <Search className="text-slate-500" size={18} />
//                             <input
//                                 type="text"
//                                 placeholder="Search Questions"
//                                 className="ml-2 flex-1 focus:outline-none"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                         </div>
//                         {selectedItems.length > 0 && (
//                             <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
//                                 <p className="text-red-800">You have selected {selectedItems.length} items.</p>
//                                 <button
//                                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                                     onClick={() => setShowConfirm(true)}
//                                 >
//                                     Remove Selected Items
//                                 </button>
//                                 {showConfirm && (
//                                     <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
//                                         <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
//                                             <p className="text-red-800">Are you sure you want to remove selected items?</p>
//                                             <div className="mt-4 flex space-x-4">
//                                                 <button
//                                                     className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                                                     onClick={handleRemoveSelectedItems}
//                                                 >
//                                                     Yes, Remove
//                                                 </button>
//                                                 <button
//                                                     className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                                                     onClick={() => setShowConfirm(false)}
//                                                 >
//                                                     Cancel
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                         {renderContent()}
//                     </section>
//                 </main>
//                 {renderTabBar()}
//             </Suspense>
//         </>
//     );
// };

// export default Dashboard;
// 3678 
"use client"
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Search } from 'lucide-react';
import ButtonAccount from "@/components/ButtonAccount";
import Header from "@/components/Header";
import Feedback from "@/components/Feedback";
import Link from 'next/link';

const ITEMS_PER_PAGE = 30;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [userResponses, setUserResponses] = useState([]);
    const [userFeedback, setUserFeedback] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tabCounts, setTabCounts] = useState({
        all: 0,
        flagged: 0,
        incorrect: 0,
        feedback: 0
    });

    const supabase = createClientComponentClient();

    const fetchUserResponses = useCallback(async (user, page = 1) => {
        try {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const { data, error, count } = await supabase
                .from('user_responses')
                .select(`
                    *,
                    qs:question_id (*)
                `, { count: 'exact' })
                .eq('user_id', user.id)
                .range(startIndex, startIndex + ITEMS_PER_PAGE - 1)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUserResponses(data);
            setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        } catch (error) {
            console.error('Error fetching user responses:', error);
            setError(error.message);
        }
    }, [supabase]);

    const fetchUserFeedback = useCallback(async (user, page = 1) => {
        try {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const { data, error, count } = await supabase
                .from('feedback')
                .select(`
                    *,
                    qs:question_id (*)
                `, { count: 'exact' })
                .eq('user_id', user.id)
                .range(startIndex, startIndex + ITEMS_PER_PAGE - 1)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUserFeedback(data);
            setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        } catch (error) {
            console.error('Error fetching user feedback:', error);
            setError(error.message);
        }
    }, [supabase]);

    const fetchSubscriptionStatus = useCallback(async (user) => {
        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .eq('user_id', user.id)
                .order('subscription_end', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const subscription = data[0];
                const now = new Date();
                const end = new Date(subscription.subscription_end);
                subscription.remaining_days = Math.floor((end - now) / (1000 * 60 * 60 * 24));
                setSubscriptionStatus(subscription);
            } else {
                setSubscriptionStatus(null);
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setError(error.message);
        }
    }, [supabase]);

    const fetchTabCounts = useCallback(async (user) => {
        try {
            const [allCount, flaggedCount, incorrectCount, feedbackCount] = await Promise.all([
                supabase
                    .from('user_responses')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .then(({ count }) => count),
                supabase
                    .from('user_responses')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('is_bookmarked', true)
                    .then(({ count }) => count),
                supabase
                    .from('user_responses')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .neq('user_answer', 'qs.correct_choice')
                    .not('user_answer', 'is', null)
                    .then(({ count }) => count),
                supabase
                    .from('feedback')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .then(({ count }) => count)
            ]);

            setTabCounts({
                all: allCount,
                flagged: flaggedCount,
                incorrect: incorrectCount,
                feedback: feedbackCount
            });
        } catch (error) {
            console.error('Error fetching tab counts:', error);
            setError(error.message);
        }
    }, [supabase]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await Promise.all([
                    fetchUserResponses(user),
                    fetchUserFeedback(user),
                    fetchSubscriptionStatus(user),
                    fetchTabCounts(user)
                ]);
            }
            setLoading(false);
        };

        fetchData();
    }, [fetchUserResponses, fetchUserFeedback, fetchSubscriptionStatus, fetchTabCounts]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        const fetchPageData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                if (activeTab === 'feedback') {
                    await fetchUserFeedback(user, currentPage);
                } else {
                    await fetchUserResponses(user, currentPage);
                }
            }
        };

        fetchPageData();
    }, [currentPage, activeTab, fetchUserResponses, fetchUserFeedback]);

    const correctAnswers = userResponses.filter(response => response.user_answer === response.qs?.correct_choice);
    const incorrectAnswers = userResponses.filter(response => response.user_answer !== response.qs?.correct_choice && response.user_answer !== null);
    const flaggedQuestions = userResponses.filter(response => response.is_bookmarked);

    const tabData = [
        { id: 'all', label: 'All', count: tabCounts.all },
        { id: 'flagged', label: 'Flagged', count: tabCounts.flagged },
        { id: 'incorrect', label: 'Incorrect', count: tabCounts.incorrect },
        { id: 'feedback', label: 'Feedback', count: tabCounts.feedback },
        { id: 'subscription', label: 'Subscription', count: subscriptionStatus?.remaining_days ?? 0 }
    ];

    const getAnswersForTab = (tabId) => {
        switch (tabId) {
            case 'incorrect': return incorrectAnswers;
            case 'flagged': return flaggedQuestions;
            case 'feedback': return userFeedback;
            default: return userResponses;
        }
    };

    const filteredAnswers = getAnswersForTab(activeTab).filter(answer =>
        answer.qs?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectItem = (item) => {
        setSelectedItems(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const handleRemoveSelectedItems = async () => {
        if (selectedItems.length > 0) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No user found");

                const ids = selectedItems.map(item => item.id);
                let tableName = '';

                switch (activeTab) {
                    case 'feedback':
                        tableName = 'feedback';
                        break;
                    case 'incorrect':
                    case 'flagged':
                    case 'all':
                        tableName = 'user_responses';
                        break;
                    default:
                        return;
                }

                const { error } = await supabase
                    .from(tableName)
                    .delete()
                    .in('id', ids)
                    .eq('user_id', user.id);

                if (error) throw error;

                setUserResponses(prev => prev.filter(item => !ids.includes(item.id)));
                setUserFeedback(prev => prev.filter(item => !ids.includes(item.id)));
                setSelectedItems([]);
                setShowConfirm(false);
            } catch (error) {
                console.error('Error removing items:', error);
                setError(error.message);
            }
        }
    };

    const handleFeedbackSubmit = async (feedbackData) => {
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            });

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }

            console.log('Feedback submitted successfully:', result.data);
            setUserFeedback(prev => [...prev, result.data[0]]);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const renderAnswers = (answers) => (
        <div>
            {answers.map((answer, index) => {
                const choices = {
                    'A': answer.qs?.option_a,
                    'B': answer.qs?.option_b,
                    'C': answer.qs?.option_c,
                    'D': answer.qs?.option_d,
                    'E': answer.qs?.option_e,
                    'F': answer.qs?.option_f
                };

                const correctChoice = choices[answer.qs?.correct_choice];
                const userChoice = choices[answer.user_answer];

                return (
                    <div
                        key={index}
                        className={`mb-4 p-4 bg-slate-100 border-2 ${selectedItems.includes(answer) ? 'bg-red-100 border-red-500' : 'border-slate-500'}`}
                        onClick={() => handleSelectItem(answer)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-1xl text-gray-900">{answer.qs?.subject || 'Unknown Subject'}</span>
                            {answer.user_answer === answer.qs?.correct_choice && <span className="text-green-500">✓</span>}
                            {answer.is_bookmarked && <span className="text-blue-500">🚩</span>}
                        </div>
                        <br />
                        <p className="font-semibold ">{answer.qs?.question_text || 'Question text not available'}</p>
                        <br />
                        <p> <strong className='text-1xl text-red-500'> Your answer:</strong> {userChoice ? `${answer.user_answer}: ${userChoice}` : 'Skipped'}</p>
                        <br />
                        <p> <strong className='text-1xl text-green-800'> Correct answer: </strong> {correctChoice ? `${answer.qs?.correct_choice}: ${correctChoice}` : 'N/A'}</p>
                        <br />
                        <p> <strong className='text-1xl text-blue-800'> Explanation: </strong>  {answer.qs?.rationale || 'No explanation available'}</p>
                        <Feedback
                            questionId={answer.qs?.id}
                            currentAnswer={answer.user_answer}
                            options={Object.entries(answer.qs || {})
                                .filter(([key]) => key.startsWith('option_'))
                                .map(([key, value]) => ({ letter: key.split('_')[1].toUpperCase(), text: value }))}
                            onSubmit={handleFeedbackSubmit}
                            existingFeedback={userFeedback.some(feedback => feedback.question_id === answer.qs?.id)}
                        />
                        {userFeedback.some(feedback => feedback?.question_id === answer.qs?.id) && (
                            <p className="text-green-900 mt-2">Feedback sent</p>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderContent = () => {
        let content;
        switch (activeTab) {
            case 'feedback':
                content = userFeedback.length > 0 ? (
                    userFeedback.map((feedback, index) => (
                        <div key={index} className="mb-4 p-4 border-2 border-slate-500 bg-slate-100">
                            <p> <strong>Question:</strong> {feedback.qs?.question_text || 'Question text not available'}</p>
                            <p className="mt-2"><strong>Feedback Type:</strong> {feedback.feedback_type}</p>
                            {feedback.suggested_answer && (
                                <p><strong>Suggested Answer:</strong> {feedback.suggested_answer}</p>
                            )}
                            <p className="mt-2"><strong>Comments:</strong> {feedback.feedback_text}</p>
                            <p className="mt-2"><strong>Feedback Status:</strong> {feedback.status}</p>
                            <p className="mt-2"><strong>Feedback Sent:</strong> {feedback.created_at}</p>
                        </div>
                    ))
                ) : (
                    <p>No feedback submitted yet.</p>
                );
                break;
            case 'subscription':
                content = subscriptionStatus ? (
                    <div className="p-6 mb-6 bg-slate-100 border-2 border-black">
                        <h2 className="text-2xl font-bold mb-4 ">Subscription Status</h2>
                        <p><strong>Exam:</strong> {subscriptionStatus.examname}</p>
                        <p><strong>Status:</strong> {new Date(subscriptionStatus.subscription_end) > new Date() ? 'Active' : 'Expired'}</p>
                        <p><strong>Ends on:</strong> {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
                        <p><strong>Remaining Days:</strong> {subscriptionStatus.remaining_days}</p>
                        <br />
                        <br />
                        <Link href="/pricing" legacyBehavior>
                            <a className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                                Renew Subscription
                            </a>
                        </Link>
                    </div>
                ) : (
                    <p>No active subscription found.</p>
                );
                break;
            default:
                content = renderAnswers(filteredAnswers);
        }
        return content ? (
            <div className="mt-4">
                {content}
                {activeTab !== 'subscription' && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 mr-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 ml-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        ) : null;
    };

    const renderTabBar = () => (
        <div className={`btm-nav fixed bottom-0 left-0 right-0 flex justify-around bg-slate-900 text-white md:hidden`}>
            {tabData.map(tab => (
                <button
                    key={tab.id}
                    className={`py-2 px-4 flex-1 text-center ${
                        activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="btm-nav-label text-xs">{tab.label}</span>
                </button>
            ))}
        </div>
    );

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <Header />
                <main className="p-8 pb-24">
                    <section className="max-w-6xl mx-auto space-y-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
                        <h1 className="text-3xl md:text-1xl font-light">Review your answers</h1>
                        {subscriptionStatus?.examname && (
                            <div className="mt-4">
                                <h2 className="text-xl font-bold mb-4">Your Exam</h2>
                                <p className="text-lg">{subscriptionStatus.examname} <Link href="/" legacyBehavior><a className="text-blue-500">Go to Homepage</a></Link></p>
                            </div>
                        )}
                        <ButtonAccount />
                        <div className="space-x-4 hidden md:flex">
                            {tabData.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`py-2 px-4 rounded-lg text-sm md:text-base font-semibold ${
                                        activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'
                                    }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center border-2 border-slate-500 rounded-lg p-2 bg-white max-w-lg mx-auto">
                            <Search className="text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search Questions"
                                className="ml-2 flex-1 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {selectedItems.length > 0 && (
                            <div className="max-w-4xl mx-auto bg-red-100 p-4 rounded-lg border border-red-300 flex items-center justify-between">
                                <p className="text-red-800">You have selected {selectedItems.length} items.</p>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={() => setShowConfirm(true)}
                                >
                                    Remove Selected Items
                                </button>
                                {showConfirm && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <div className="bg-white p-4 rounded-lg border border-red-300 max-w-md mx-auto">
                                            <p className="text-red-800">Are you sure you want to remove selected items?</p>
                                            <div className="mt-4 flex space-x-4">
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                    onClick={handleRemoveSelectedItems}
                                                >
                                                    Yes, Remove
                                                </button>
                                                <button
                                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                                    onClick={() => setShowConfirm(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                        
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {renderContent()}
                    </section>
                </main>
                {renderTabBar()}
            </Suspense>
        </>
    );
};

export default Dashboard;
