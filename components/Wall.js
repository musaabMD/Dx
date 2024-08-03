// // 'use client';
// // import { useEffect, useState } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import UpgradeModal from '@/components/UpgradeModal';

// // export default function Wall({ children, examName }) {
// //   const [loading, setLoading] = useState(true);
// //   const [isSubscribed, setIsSubscribed] = useState(false);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const supabase = createClientComponentClient();

// //   useEffect(() => {
// //     async function fetchData() {
// //       try {
// //         const { data: { user } } = await supabase.auth.getUser();
// //         console.log('User:', user);
// //         if (user) {
// //           const { data, error } = await supabase
// //             .from('subscribers')
// //             .select('subscription_status, remaining_days, examname, disable')
// //             .eq('user_id', user.id)
// //             .eq('examname', examName)
// //             .maybeSingle();

// //           console.log('Subscription Data:', data);

// //           if (error) {
// //             console.error("Error fetching subscription data:", error);
// //           } else if (data) {
// //             const hasAccess = !data.disable && data.remaining_days > 0;
// //             setIsSubscribed(hasAccess);
// //             setIsModalOpen(!hasAccess);
// //           } else {
// //             // No subscription found
// //             setIsSubscribed(false);
// //             setIsModalOpen(true);
// //           }
// //         } else {
// //           // No user logged in
// //           setIsSubscribed(false);
// //           setIsModalOpen(true);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching data:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchData();

// //     // Remove the real-time subscription code for now
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

// // 'use client';
// // import { useEffect, useState } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import UpgradeModal from '@/components/UpgradeModal';

// // export default function Wall({ children, examName }) {
// //   const [loading, setLoading] = useState(true);
// //   const [isSubscribed, setIsSubscribed] = useState(false);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const supabase = createClientComponentClient();

// //   useEffect(() => {
// //     async function fetchData() {
// //       try {
// //         const { data: { user } } = await supabase.auth.getUser();
// //         if (user) {
// //           const { data, error } = await supabase
// //             .from('subscribers')
// //             .select('subscription_status, remaining_days, disable')
// //             .eq('user_id', user.id)
// //             .eq('examname', examName)
// //             .single();

// //           if (error) {
// //             console.error("Error fetching subscription data:", error);
// //           } else if (data) {
// //             const subscriptionStatus = data.subscription_status.toLowerCase();
// //             const remainingDays = data.remaining_days;
// //             const isDisabled = data.disable;

// //             const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled);

// //             console.log(`User subscription status: ${subscriptionStatus}, remaining days: ${remainingDays}, isDisabled: ${isDisabled}, isSubscribed: ${isActive}`);

// //             setIsSubscribed(isActive);
// //             setIsModalOpen(!isActive);
// //           } else {
// //             // No subscription found
// //             setIsSubscribed(false);
// //             setIsModalOpen(true);
// //           }
// //         } else {
// //           // No user logged in
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
// // components/Wall.js

// // 'use client';
// // import { useEffect, useState } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import UpgradeModal from '@/components/UpgradeModal';

// // export default function Wall({ children, examName }) {
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
// //             .from('subscribers')
// //             .select('subscription_status, remaining_days, disable, trial')
// //             .eq('user_id', user.id)
// //             .eq('examname', examName)
// //             .single();

// //           if (error && status !== 406) {
// //             throw error;
// //           }

// //           if (data) {
// //             const subscriptionStatus = data.subscription_status.toLowerCase();
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


// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import UpgradeModal from '@/components/UpgradeModal';

// // export default function Wall({ children, examName }) {
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
// //             const subscriptionStatus = data.subscription_status.toLowerCase();
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

// export default function Wall({ children, examName }) {
//   const [loading, setLoading] = useState(true);
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         console.log('User fetched:', user); // Debugging line
//         if (user) {
//           const { data, error, status } = await supabase
//             .from('user_data')
//             .select('subscription_status, remaining_days, disable, trial')
//             .eq('user_id', user.id)
//             .eq('examname', examName)
//             .single();

//           console.log('Fetched subscription data:', data); // Debugging line
//           console.log('Subscription fetch error:', error); // Debugging line

//           if (error && status !== 406) {
//             throw error;
//           }

//           if (data) {
//             const subscriptionStatus = data.subscription_status?.toLowerCase();
//             const remainingDays = data.remaining_days;
//             const isDisabled = data.disable;
//             const isTrial = data.trial;

//             const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled) || isTrial;

//             console.log(`User subscription status: ${subscriptionStatus}, remaining days: ${remainingDays}, isDisabled: ${isDisabled}, isSubscribed: ${isActive}, isTrial: ${isTrial}`);

//             setIsSubscribed(isActive);
//             setIsModalOpen(!isActive);
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
