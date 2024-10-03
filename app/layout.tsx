import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Work_Sans } from "next/font/google";
import { Room } from "./Room";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700", "800"],
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Figma clone",
  description:
    "a minimalist figama clone useing fabric.js and liveblocks for real time collaboration! 'yess...go!'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${work_sans.className} bg-primary-grey-200 antialiased`}
      >
        <Room>{children}</Room>
      </body>
    </html>
  );
}
