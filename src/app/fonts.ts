import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

// Same three faces as the product app: Geist for UI, Geist Mono for the small
// uppercase labels, and the self-hosted Season Mix for editorial display type.
export const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const seasonMix = localFont({
  src: "../../public/fonts/season/SeasonMix-SemiBold.woff2",
  weight: "600",
  style: "normal",
  variable: "--font-season-mix",
  display: "swap",
});
