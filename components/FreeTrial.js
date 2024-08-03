// 'use client';

// import { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import Link from 'next/link';

// const FreeTrial = ({ examName }) => {
//     const [trialStatus, setTrialStatus] = useState(null); // null, active, or ended
//     const supabase = createClientComponentClient();

//     useEffect(() => {
//         const checkFreeTrialStatus = async () => {
//             const { data: { session } } = await supabase.auth.getSession();

//             if (session) {
//                 const { data, error } = await supabase
//                     .from('user_data')
//                     .select('subscription_start, subscription_end, trial, examname')
//                     .eq('user_id', session.user.id)
//                     .eq('examname', examName)
//                     .single();

//                 if (error) {
//                     console.error('Error fetching user data:', error);
//                     return;
//                 }

//                 const now = new Date();
//                 if (data.trial && new Date(data.subscription_end) > now) {
//                     setTrialStatus('active');
//                 } else if (data.trial && new Date(data.subscription_end) <= now) {
//                     setTrialStatus('ended');
//                 } else {
//                     setTrialStatus(null);
//                 }
//             }
//         };

//         checkFreeTrialStatus();
//     }, [supabase, examName]);

//     const activateFreeTrial = async () => {
//         const { data: { session } } = await supabase.auth.getSession();

//         if (session) {
//             const trialEndDate = new Date();
//             trialEndDate.setDate(trialEndDate.getDate() + 1); // 24-hour trial period

//             const { error } = await supabase
//                 .from('user_data')
//                 .update({
//                     subscription_start: new Date(),
//                     subscription_end: trialEndDate,
//                     trial: true
//                 })
//                 .eq('user_id', session.user.id)
//                 .eq('examname', examName);

//             if (error) {
//                 console.error('Error activating free trial:', error);
//                 return;
//             }

//             setTrialStatus('active');
//         }
//     };

//     return (
//         <div>
//             {trialStatus === 'active' && (
//                 <p className="text-green-600 font-semibold">
//                     Free trial has been activated for 24 hours so you could try before you subscribe.
//                 </p>
//             )}
//             {trialStatus === 'ended' && (
//                 <div>
//                     <p className="text-red-600 font-semibold">Free trial ended. Please subscribe.</p>
//                     <Link href="/pricing">
//                         <button className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Subscribe</button>
//                     </Link>
//                 </div>
//             )}
//             {trialStatus === null && (
//                 <button onClick={activateFreeTrial} className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//                     Activate Free Trial
//                 </button>
//             )}
//         </div>
//     );
// };

// export default FreeTrial;
