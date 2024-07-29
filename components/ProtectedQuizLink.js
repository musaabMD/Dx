// 'use client';

// import { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { useRouter } from 'next/navigation';
// import UpgradeModal from '@/components/UpgradeModal';

// export default function ProtectedQuizLink({ quiz }) {
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const supabase = createClientComponentClient();
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchSubscriptionStatus() {
//       const { data: { session } } = await supabase.auth.getSession();

//       if (session) {
//         const { data, error } = await supabase
//           .from('subscribers')
//           .select('subscription_status, remaining_days, disable')
//           .eq('user_id', session.user.id)
//           .single();

//         if (error) {
//           console.error('Error fetching subscription status:', error);
//           return;
//         }

//         const subscriptionStatus = data.subscription_status.toLowerCase();
//         const remainingDays = data.remaining_days;
//         const isDisabled = data.disable;

//         const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled);

//         console.log(`User subscription status: ${subscriptionStatus}, remaining days: ${remainingDays}, isDisabled: ${isDisabled}, isSubscribed: ${isActive}`);
        
//         setIsSubscribed(isActive);
//       }
//     }

//     fetchSubscriptionStatus();
//   }, [supabase]);

//   const handleQuizAccess = (e) => {
//     if (!isSubscribed) {
//       e.preventDefault();
//       setIsModalOpen(true);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   if (!quiz.file_name) {
//     return null; // Return null if file_name is not available
//   }

//   return (
//     <>
//       <a href={`/quiz/${quiz.file_name.replace(/%20/g, '-')}`} onClick={handleQuizAccess}>
//         <span className="text-blue-600 font-sans font-semibold">
//           {quiz.file_name.replace(/%20/g, ' ')}
//           <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
//         </span>
//       </a>
//       <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />
//     </>
//   );
// }'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UpgradeModal from '@/components/UpgradeModal';

export default function ProtectedQuizLink({ quiz, examName }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from('subscribers')
          .select('subscription_status, remaining_days, disable')
          .eq('user_id', session.user.id)
          .eq('examname', examName)
          .single();

        if (error) {
          console.error('Error fetching subscription status:', error);
          return;
        }

        const subscriptionStatus = data.subscription_status.toLowerCase();
        const remainingDays = data.remaining_days;
        const isDisabled = data.disable;

        const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled);

        console.log(`User subscription status: ${subscriptionStatus}, remaining days: ${remainingDays}, isDisabled: ${isDisabled}, isSubscribed: ${isActive}`);
        
        setIsSubscribed(isActive);
      }
    }

    fetchSubscriptionStatus();
  }, [supabase, examName]);

  const handleQuizAccess = (e) => {
    if (!isSubscribed) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!quiz.file_name) {
    return null; // Return null if file_name is not available
  }

  return (
    <>
      <a href={`/quiz/${quiz.file_name.replace(/%20/g, '-')}`} onClick={handleQuizAccess}>
        <span className="text-blue-600 font-sans font-semibold">
          {quiz.file_name.replace(/%20/g, ' ')}
          <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
        </span>
      </a>
      <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
