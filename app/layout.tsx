import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GTM Commit — Talk is cheap. Commits aren\'t.',
    template: '%s | GTM Commit',
  },
  description:
    'The proof-of-work profile for AI-native GTM professionals. Connect GitHub. Show what you\'ve shipped. Get your GTM Commit.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'GTM Commit — Talk is cheap. Commits aren\'t.',
    description: 'The proof-of-work profile for AI-native GTM professionals.',
    siteName: 'GTM Commit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTM Commit — Talk is cheap. Commits aren\'t.',
    description: 'The proof-of-work profile for AI-native GTM professionals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-body min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
