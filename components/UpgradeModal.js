'use client';

import Link from 'next/link';
import { CheckCircle2, CreditCard, X } from 'lucide-react';

const benefits = [
  'Access all questions and expert explanations.',
  'Unlock files, subjects, and all quiz modes.',
  "Get the Pass Guarantee with three extra months if you do not pass.",
];

const UpgradeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-[#E5E5E5] bg-white text-[#3C3C3C]" style={{ boxShadow: '0 6px 0 #D9D9D9' }}>
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#E5E5E5] bg-[#F7FFF0] px-5 py-5 sm:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7F4C1] bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
              <CreditCard className="h-4 w-4" strokeWidth={2.5} />
              Premium access
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Upgrade to keep practicing
            </h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[#777]">
              Choose a plan on the pricing page to unlock this qbank.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[#E5E5E5] bg-white text-[#777] hover:text-[#3C3C3C]"
            aria-label="Close upgrade dialog"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm font-bold leading-6 text-[#3C3C3C]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#58CC02]" strokeWidth={2.5} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3 text-sm font-extrabold text-[#777] hover:text-[#3C3C3C]"
            >
              Not now
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl bg-[#58CC02] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white hover:brightness-105"
              style={{ boxShadow: '0 4px 0 #46A302' }}
            >
              View pricing and upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
