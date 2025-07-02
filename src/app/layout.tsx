import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Status Checker",
  description: "Projects status checker.",
  authors: { name: "EduardStroescu", url: "https://eduardstroescu.com" },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Status Checker",
    type: "website",
    url: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL!}`,
    description: "Projects status checker.",
    images: `https://${process.env
      .VERCEL_PROJECT_PRODUCTION_URL!}/api/og/fVTbbtswDP0VQ0OBFogcN9cmwDBswy596FP7NhSDLNO2WtnyJDqxW_jfR9lpmqYXJLBFSueQOiT9yKRJgK0fGbYVvVmiNmzEKmsq570OW91vZ6Ki3cWsalg3YrglY8vTWusgH16phqZ_cGl0oBAKxyWUCDa4qx2qtH0yERrkF40OLGiBagODZ5sTiGLLXOnEQsnWf_ZZqSJ7kZWV5MwRK7cejx0KrClYDvIeLDcFZCLcgJWgQ1FVY1GpscnGqhAZcOJo2i-11Z97-Mn068nkJ_09iZIEkwjw0IbSFN7bOroILSw4UxOjozXmdRGXQmlvRJOInquZf16cLzymEFr_nTS0FLFDKyRyrf7VKuGxroHHQt5n1tRl8uQmwYzlW7EBd7hbCBtr2KH2VK_hwzleCSR1y4GNSsJTUcp2OETiH-AybZzb7SRcSNtqJQmvSuS-FLUlttygCe8qr_tWJZiz9fkkikYsB5XlyNaLKRn79kiVpuBUFErWnlKXnL3TJnQPo2uEQJUOkEcvCl7Sia4bvdeMPV2ckSB0l_E0Ct6mJsg-r9g017lIjEdGQRTQFaomsFksTqNR_wtXZ0MuPuH3U3GbFx24k4RNI3-DjYLtN9PsYiznwWJOXtJEk-tTmqaHKVG5MkUR6OxyPozTc9h9PKpmfhgwId_VdBnOV-FkrqeLcEVRZr_DxWww-GL28IaWH6h5lNCN8QPOp5PjlNh1P1_B92G-WNfdEiszFSpT9kypKZEWNK6lKHwkGpcErJL3IsAcgl8WBD5LwEpjaUZ8Y-16aeYbKxEoiK3PeMdz6b8XdO5p6xmx9IgjvgPglSCgEjq4lD7Htxj6mMcMtx81ewJxnbF1KrSDEYPC3KmbQVnc9pavOUnxo4iByoW2hq77Dw.png`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Status Checker",
    description: "Projects status checker.",
    images: `https://${process.env
      .VERCEL_PROJECT_PRODUCTION_URL!}/api/og/fVTbbtswDP0VQ0OBFogcN9cmwDBswy596FP7NhSDLNO2WtnyJDqxW_jfR9lpmqYXJLBFSueQOiT9yKRJgK0fGbYVvVmiNmzEKmsq570OW91vZ6Ki3cWsalg3YrglY8vTWusgH16phqZ_cGl0oBAKxyWUCDa4qx2qtH0yERrkF40OLGiBagODZ5sTiGLLXOnEQsnWf_ZZqSJ7kZWV5MwRK7cejx0KrClYDvIeLDcFZCLcgJWgQ1FVY1GpscnGqhAZcOJo2i-11Z97-Mn068nkJ_09iZIEkwjw0IbSFN7bOroILSw4UxOjozXmdRGXQmlvRJOInquZf16cLzymEFr_nTS0FLFDKyRyrf7VKuGxroHHQt5n1tRl8uQmwYzlW7EBd7hbCBtr2KH2VK_hwzleCSR1y4GNSsJTUcp2OETiH-AybZzb7SRcSNtqJQmvSuS-FLUlttygCe8qr_tWJZiz9fkkikYsB5XlyNaLKRn79kiVpuBUFErWnlKXnL3TJnQPo2uEQJUOkEcvCl7Sia4bvdeMPV2ckSB0l_E0Ct6mJsg-r9g017lIjEdGQRTQFaomsFksTqNR_wtXZ0MuPuH3U3GbFx24k4RNI3-DjYLtN9PsYiznwWJOXtJEk-tTmqaHKVG5MkUR6OxyPozTc9h9PKpmfhgwId_VdBnOV-FkrqeLcEVRZr_DxWww-GL28IaWH6h5lNCN8QPOp5PjlNh1P1_B92G-WNfdEiszFSpT9kypKZEWNK6lKHwkGpcErJL3IsAcgl8WBD5LwEpjaUZ8Y-16aeYbKxEoiK3PeMdz6b8XdO5p6xmx9IgjvgPglSCgEjq4lD7Htxj6mMcMtx81ewJxnbF1KrSDEYPC3KmbQVnc9pavOUnxo4iByoW2hq77Dw.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-inter antialiased`}
      >
        <main className="flex flex-col items-center text-text-primary w-[100dvw] min-h-[100dvh]">
          <Providers>{children}</Providers>
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
