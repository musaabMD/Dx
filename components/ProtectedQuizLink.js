'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UpgradeModal from './UpgradeModal';

export default function ProtectedQuizLink({ quiz }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from('subscribers')
          .select('disable, remaining_days, subscription_status, subscription_end')
          .eq('user_id', session.user.id)
          .eq('examname', quiz.examname)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription data:', error);
          return;
        }

        if (data) {
          const currentDate = new Date();
          const subscriptionEndDate = new Date(data.subscription_end);

          const hasAccess = !data.disable && (
            data.remaining_days > 0 ||
            data.subscription_status === 'active' ||
            subscriptionEndDate >= currentDate
          );

          setIsSubscribed(hasAccess);
        }
      }
    }

    fetchSubscriptionStatus();
  }, [supabase, quiz.examname]);

  const handleQuizAccess = (e) => {
    if (!isSubscribed) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <a href={`/quiz/${quiz.file_name.replace(/%20/g, '-')}`} onClick={handleQuizAccess}>
        <span className="text-blue-600 font-sans font-semibold">
          {quiz.file_name.replace(/%20/g, ' ')}
          <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
        </span>
      </a>
      {!isSubscribed && <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
    </>
  );
}
