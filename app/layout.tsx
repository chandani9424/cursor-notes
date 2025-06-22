import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/toaster';

export const metadata = {
  metadataBase: new URL('https://www.alanagoyal.com'),
  title: {
    default: 'Notes',
    template: '%s | Notes',
  },
  description: 'A simple and elegant notes application.',
  openGraph: {
    title: 'Notes',
    description: 'A simple and elegant notes application.',
    url: 'https://www.alanagoyal.com',
    siteName: 'Notes',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Notes',
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[GeistSans.variable, GeistMono.variable].join(' ')}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 