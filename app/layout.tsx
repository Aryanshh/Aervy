import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { NavigationLoader } from "@/components/ui/navigation-loader";

export const metadata: Metadata = {
  title: "Aervy — Dynamic Aerial Advertising Platform",
  description:
    "Plan, upload, schedule, and manage aerial media campaigns for approved outdoor locations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className="font-sans bg-[#000000] text-[#ebebeb] antialiased selection:bg-[#ccff00] selection:text-black min-h-screen relative overflow-x-hidden"
      >
        {/* Seamless Obsidian & Lime Navigation Loader */}
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>

        {/* Persistent Hardware-Accelerated Ambient Backdrop */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-60 z-0" />
        <div className="fixed inset-0 bg-noise pointer-events-none opacity-40 z-0" />

        {/* Dynamic Route Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
