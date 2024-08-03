'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import UpgradeModal from '@/components/UpgradeModal';

const ProtectedQuizLink = ({ quiz, examName }) => {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setFetchError(sessionError.message);
          return;
        }

        if (session) {
          const { data, error, status } = await supabase
            .from('user_data')
            .select('subscription_status, remaining_days, disable, trial, examname')
            .eq('user_id', session.user.id)
            .eq('examname', examName)
            .single();

          if (error && status !== 406) {
            console.error('Error fetching subscription status:', error);
            setFetchError(error.message);
          } else if (data) {
            const { subscription_status, remaining_days, disable, trial } = data;
            const isActive = (subscription_status === 'active' && remaining_days > 0 && !disable) || trial;

            setIsSubscribed(isActive);

            if (!isActive) {
              setIsModalOpen(true);
            }
          } else {
            setIsSubscribed(false);
            setIsModalOpen(true);
          }
        } else {
          setIsSubscribed(false);
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setFetchError(error.message);
        setIsSubscribed(false);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return <div>Error: {fetchError}</div>;
  }

  return (
    <div>
      <Link href={isSubscribed ? `/quiz/${quiz.file_name.replace(/%20/g, '-')}` : '#'} onClick={handleQuizAccess}>
        <span className="text-blue-600 font-sans font-semibold">
          {quiz.file_name.replace(/%20/g, ' ')}
          <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
        </span>
      </Link>
      {!isSubscribed && <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  );
};

export default ProtectedQuizLink;
