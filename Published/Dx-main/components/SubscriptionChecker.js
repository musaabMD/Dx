// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import { useRouter } from 'next/navigation';
// // import UpgradeModal from '@/components/UpgradeModal';

// // export default function ProtectedQuizLink({ quiz }) {
// //   const [isSubscribed, setIsSubscribed] = useState(false);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const supabase = createClientComponentClient();
// //   const router = useRouter();

// //   useEffect(() => {
// //     async function fetchSubscriptionStatus() {
// //       const { data: { session } } = await supabase.auth.getSession();

// //       if (session) {
// //         const { data: profile } = await supabase
// //           .from('profiles')
// //           .select('subscription_status')
// //           .eq('id', session.user.id)
// //           .single();

// //         const subscriptionStatus = profile?.subscription_status || 'inactive';
// //         setIsSubscribed(subscriptionStatus === 'active');
// //       }
// //     }

// //     fetchSubscriptionStatus();
// //   }, [supabase]);

// //   const handleQuizAccess = (e) => {
// //     if (!isSubscribed) {
// //       e.preventDefault();
// //       setIsModalOpen(true);
// //     }
// //   };

// //   const handleCloseModal = () => {
// //     setIsModalOpen(false);
// //   };

// //   return (
// //     <>
// //       <a href={`/quiz/${quiz.file_name.replace(/%20/g, '-')}`} onClick={handleQuizAccess}>
// //         <span className="text-blue-600 font-sans font-semibold">
// //           {quiz.file_name.replace(/%20/g, ' ')}
// //           <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
// //         </span>
// //       </a>
// //       {!isSubscribed && <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
// //     </>
// //   );
// // // }
// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import UpgradeModal from '@/components/UpgradeModal';

// // export default function SubscriptionChecker({ children, examName }) {
// //   const [loading, setLoading] = useState(true);
// //   const [isSubscribed, setIsSubscribed] = useState(false);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const supabase = createClientComponentClient();

// //   useEffect(() => {
// //     async function fetchData() {
// //       try {
// //         const { data: { user } } = await supabase.auth.getUser();
// //         if (user) {
// //           const { data, error, status } = await supabase
// //             .from('user_data')
// //             .select('subscription_status, remaining_days, disable, trial')
// //             .eq('user_id', user.id)
// //             .eq('examname', examName)
// //             .single();

// //           if (error && status !== 406) {
// //             throw error;
// //           }

// //           if (data) {
// //             const subscriptionStatus = data.subscription_status?.toLowerCase();
// //             const remainingDays = data.remaining_days;
// //             const isDisabled = data.disable;
// //             const isTrial = data.trial;

// //             const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled) || isTrial;

// //             console.log(`User subscription status: ${subscriptionStatus}, remaining days: ${remainingDays}, isDisabled: ${isDisabled}, isSubscribed: ${isActive}, isTrial: ${isTrial}`);

// //             setIsSubscribed(isActive);
// //             setIsModalOpen(!isActive);
// //           } else {
// //             setIsSubscribed(false);
// //             setIsModalOpen(true);
// //           }
// //         } else {
// //           setIsSubscribed(false);
// //           setIsModalOpen(true);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching data:", error);
// //         setIsSubscribed(false);
// //         setIsModalOpen(true);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchData();
// //   }, [supabase, examName]);

// //   const handleCloseModal = () => {
// //     setIsModalOpen(false);
// //   };

// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }

// //   return (
// //     <div>
// //       {isSubscribed ? children : <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
// //     </div>
// //   );
// // }
// 'use client';

// import { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import UpgradeModal from '@/components/UpgradeModal';

// export default function SubscriptionChecker({ children, examName }) {
//   const [loading, setLoading] = useState(true);
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [userAccess, setUserAccess] = useState([]);
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         console.log('User fetched:', user);
//         if (user) {
//           const { data, error } = await supabase
//             .from('user_data')
//             .select('subscription_status, remaining_days, disable, trial, examname')
//             .eq('user_id', user.id);

//           console.log('Fetched subscription data:', data);
//           console.log('Subscription fetch error:', error);

//           if (error) throw error;

//           if (data && data.length > 0) {
//             const accessList = data.map(item => ({
//               examName: item.examname,
//               subscriptionStatus: item.subscription_status?.toLowerCase(),
//               remainingDays: item.remaining_days,
//               isDisabled: item.disable,
//               isTrial: item.trial,
//             }));

//             setUserAccess(accessList);

//             const currentExamAccess = accessList.find(item => item.examName === examName);
//             if (currentExamAccess) {
//               const isActive = (currentExamAccess.subscriptionStatus === 'active' && 
//                                 currentExamAccess.remainingDays > 0 && 
//                                 !currentExamAccess.isDisabled) || 
//                                 currentExamAccess.isTrial;

//               console.log(`User subscription status for ${examName}: ${currentExamAccess.subscriptionStatus}, 
//                            remaining days: ${currentExamAccess.remainingDays}, 
//                            isDisabled: ${currentExamAccess.isDisabled}, 
//                            isSubscribed: ${isActive}, 
//                            isTrial: ${currentExamAccess.isTrial}`);

//               setIsSubscribed(isActive);
//               setIsModalOpen(!isActive);
//             } else {
//               setIsSubscribed(false);
//               setIsModalOpen(true);
//             }
//           } else {
//             setIsSubscribed(false);
//             setIsModalOpen(true);
//           }
//         } else {
//           setIsSubscribed(false);
//           setIsModalOpen(true);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setIsSubscribed(false);
//         setIsModalOpen(true);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, [supabase, examName]);

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       {isSubscribed ? children : <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
//     </div>
//   );
// }