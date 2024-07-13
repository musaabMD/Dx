'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import UpgradeModal from '@/components/UpgradeModal';

export default function ProtectedQuizLink({ quiz }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single();

        const subscriptionStatus = profile?.subscription_status || 'inactive';
        setIsSubscribed(subscriptionStatus === 'active');
      }
    }

    fetchSubscriptionStatus();
  }, [supabase]);

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
