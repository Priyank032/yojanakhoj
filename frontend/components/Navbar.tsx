'use client';
import Link from 'next/link';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center">
        <Logo size={32} showText={true} />
      </Link>
      <LanguageSelector />
    </nav>
  );
}
