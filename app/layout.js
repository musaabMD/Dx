import { Inter } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import { Suspense } from "react";
import dynamic from 'next/dynamic'; // Correct import for dynamic
import { PHProvider } from './providers'
import { CSPostHogProvider } from './providers'

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
});
const font = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

export const metadata = getSEOTags();

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      <CSPostHogProvider>
      <head>
          {config.domainName && (
            <PlausibleProvider domain={config.domainName} />
          )}
          
        </head>
        <body>
          <Suspense>
            <PostHogPageView /> 
            {children}
          </Suspense>
          
        </body>
        </CSPostHogProvider>
        </html>
  );
}
