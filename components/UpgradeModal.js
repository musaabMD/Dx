'use client';
import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';

const UpgradeModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleStartPremium = () => {
    router.push('/pricing');
  };

  const handleCancel = () => {
    router.push('/'); // This will navigate to the homepage
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded">
          <h2 className="text-2xl mb-4">Upgrade to Premium</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <svg className="w-6 h-6" /* Add your SVG icon */></svg>
              <p>Access All questions and explanations written by subject matter experts.</p>
            </div>
            <div className="flex items-center space-x-4">
              <svg className="w-6 h-6" /* Add your SVG icon */></svg>
              <p>Multiple quiz modes to gauge your exam readiness.</p>
            </div>
            <div className="flex items-center space-x-4">
              <svg className="w-6 h-6" /* Add your SVG icon */></svg>
              <p>Pass Guarantee: If you fail your exam, we’ll give you three months free.</p>
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={handleCancel} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={handleStartPremium} className="btn btn-warning">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default UpgradeModal;
