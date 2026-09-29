import type { Metadata } from "next";

import { StartOver } from "@/components/StartOver";
import { SessionProvider } from "@/lib/session";
import { geist, geistMono, seasonMix } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "readywhen — growth challenge",
  description: "A mock of the readywhen sign-up funnel, from sign-in to chat.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${seasonMix.variable}`}
    >
      <body className="font-sans">
        <SessionProvider>
          {children}
          <StartOver />
        </SessionProvider>
      </body>
    </html>
  );
}
