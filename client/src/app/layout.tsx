import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Serif_Display, Poppins } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lanyard",
  description:
    "Lanyard helps you stay organized, ship faster, and focus on what matters. The calm, confident way to manage your projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} ${poppins.variable} font-[family-name:var(--font-poppins)] antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
