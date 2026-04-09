import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import WhatsAppFloat from '@/components/WhatsAppFloat';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YojanaKhoj — Apni Yojana Khojo | Find Government Schemes',
  description: 'Aapke liye kaunsi sarkari yojana hai? 3 minutes. 20+ schemes checked. Free, instant, available in Hindi and 10 Indian languages.',
  keywords: 'yojana khoj, sarkari yojana, government schemes india, PM KISAN, Ayushman Bharat, yojana finder, मेरी योजना',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main>{children}</main>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
