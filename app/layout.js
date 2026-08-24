import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Society Maintenance Tracker",
  description:
    "Raise and track maintenance complaints, manage priorities, and stay informed with a notice board and email updates.",
  keywords: ["maintenance", "complaints", "society", "apartment", "tracker"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
