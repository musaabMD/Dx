/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChevronDown, CreditCard, LogOut } from "lucide-react";
import apiClient from "@/libs/api";

// A button to show user some account actions
//  1. Billing: open a Stripe Customer Portal to manage their billing (cancel subscription, update payment method, etc.).
//     You have to manually activate the Customer Portal in your Stripe Dashboard (https://dashboard.stripe.com/test/settings/billing/portal)
//     This is only available if the customer has a customerId (they made a purchase previously)
//  2. Logout: sign out and go back to homepage
// See more at https://shipfa.st/docs/components/buttonAccount
const ButtonAccount = () => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleBilling = async () => {
    setIsLoading(true);

    try {
      const { url } = await apiClient.post("/stripe/create-portal", {
        returnUrl: window.location.href,
      });

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <Popover className="relative z-10">
      {({ open }) => (
        <>
          <Popover.Button
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-sm font-extrabold text-[#3C3C3C] transition hover:border-[#AFAFAF]"
            style={{ boxShadow: "0 4px 0 #E5E5E5" }}
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user?.user_metadata?.avatar_url}
                alt={"Profile picture"}
                className="w-6 h-6 rounded-full shrink-0"
                referrerPolicy="no-referrer"
                width={24}
                height={24}
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7F8D6] capitalize text-[#58A700]">
                {user?.email?.charAt(0)}
              </span>
            )}

            {user?.user_metadata?.name ||
              user?.email?.split("@")[0] ||
              "Account"}

            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <ChevronDown
                className={`h-5 w-5 text-[#58CC02] duration-200 ${
                  open ? "transform rotate-180 " : ""
                }`}
                strokeWidth={3}
              />
            )}
          </Popover.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute left-0 z-10 mt-3 w-screen max-w-[16rem] transform">
              <div
                className="overflow-hidden rounded-2xl border-2 border-[#E5E5E5] bg-white p-2"
                style={{ boxShadow: "0 5px 0 #E5E5E5" }}
              >
                <div className="space-y-1 text-sm">
                  <button
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 font-extrabold text-[#3C3C3C] duration-200 hover:bg-[#F2FBFF]"
                    onClick={handleBilling}
                  >
                    <CreditCard className="h-5 w-5 text-[#1CB0F6]" strokeWidth={2.5} />
                    Billing
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 font-extrabold text-[#CC3C3C] duration-200 hover:bg-[#FFE3E3]"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" strokeWidth={2.5} />
                    Logout
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default ButtonAccount;
