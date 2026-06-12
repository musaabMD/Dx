"use client";

import { PricingTable } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#F8F8F7",
          borderRadius: 20,
          boxShadow: "0 32px 80px -16px rgba(0,0,0,0.4)",
          width: "100%",
          maxWidth: 980,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          padding: "32px 28px 48px",
        }}
      >
        {/* X close button */}
        <button
          onClick={() => router.back()}
          style={{
            position: "sticky",
            top: 0,
            float: "right",
            marginBottom: -40,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid #E4E4E7",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          aria-label="Close pricing"
        >
          <X size={16} strokeWidth={2.5} color="#18181B" />
        </button>

        <PricingTable
          appearance={{
            variables: {
              colorPrimary: "#18181B",
              colorText: "#18181B",
              colorTextSecondary: "#71717A",
              colorBackground: "#F8F8F7",
              colorInputBackground: "#FFFFFF",
              colorBorder: "#E4E4E7",
              borderRadius: "14px",
              fontFamily:
                "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            },
            elements: {
              card: {
                boxShadow: "0 12px 32px -18px rgba(0,0,0,0.25)",
                border: "1px solid #E4E4E7",
              },
              headerTitle: { fontWeight: "800", letterSpacing: "-0.02em" },
              headerSubtitle: { color: "#71717A" },
              pricingTable: { gap: "14px" },
              pricingTableCard: {
                border: "1px solid #E4E4E7",
                boxShadow: "0 16px 36px -22px rgba(0,0,0,0.35)",
              },
              pricingTableCardTitle: { fontWeight: "800" },
              pricingTableCardPrice: { fontWeight: "800", letterSpacing: "-0.02em" },
              pricingTableCardButton: {
                background: "#18181B",
                color: "#FFFFFF",
                borderRadius: "999px",
                padding: "10px 16px",
              },
              pricingTableCardButton__secondary: {
                background: "#FFFFFF",
                color: "#18181B",
                border: "1.5px solid #E4E4E7",
              },
              badge: { background: "#18181B", color: "#FFFFFF" },
            },
          }}
        />
      </div>
    </div>
  );
}
