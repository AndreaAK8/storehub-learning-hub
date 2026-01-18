import type { Metadata } from "next";
import { Barlow, Open_Sans } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Learning Hub | StoreHub",
  description: "StoreHub employee training and onboarding platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} ${openSans.variable} antialiased`} style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
