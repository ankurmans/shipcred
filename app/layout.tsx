import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ShipCred — Talk is cheap. Commits aren\'t.',
    template: '%s | ShipCred',
  },
  description:
    'The proof-of-work network for AI-native GTM professionals. Connect GitHub. Show what you\'ve shipped. Get your ShipCred.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ShipCred — Talk is cheap. Commits aren\'t.',
    description:
      'The proof-of-work network for AI-native GTM professionals.',
    siteName: 'ShipCred',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShipCred — Talk is cheap. Commits aren\'t.',
    description:
      'The proof-of-work network for AI-native GTM professionals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="shipcred">
      <body className={`${dmSans.variable} min-h-screen bg-base-100 text-base-content`}>
        {children}
      </body>
    </html>
  );
}
