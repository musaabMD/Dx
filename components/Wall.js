'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UpgradeModal from '@/components/UpgradeModal';
import { Suspense } from 'react';
export default function Wall({ children, examName }) {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User:', user);
        if (user) {
          const { data, error } = await supabase
            .from('subscribers')
            .select('subscription_status, remaining_days, examname, disable')
            .eq('user_id', user.id)
            .eq('examname', examName)
            .maybeSingle();

          console.log('Subscription Data:', data);

          if (error) {
            console.error("Error fetching subscription data:", error);
          } else if (data) {
            const hasAccess = !data.disable && data.remaining_days > 0;
            setIsSubscribed(hasAccess);
            setIsModalOpen(!hasAccess);
          } else {
            // No subscription found
            setIsSubscribed(false);
            setIsModalOpen(true);
          }
        } else {
          // No user logged in
          setIsSubscribed(false);
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Remove the real-time subscription code for now
  }, [supabase, examName]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <Suspense>

   
    <div>
      {isSubscribed ? children : <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
    </Suspense>
    </>
  );
}