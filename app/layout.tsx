import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sheger Prime Multilingual AI Voice Agent | Addis Ababa Real Estate',
  description: 'Standalone conversational AI voice agent for Sheger Prime Real Estate in Addis Ababa, Ethiopia, supporting Amharic, Afaan Oromoo, Tigrinya, and English with real speech input and voice responses.',
  openGraph: {
    title: 'Sheger Prime Multilingual AI Voice Agent | Addis Ababa Real Estate',
    description: 'Standalone conversational AI voice agent for Sheger Prime Real Estate in Addis Ababa, Ethiopia, supporting Amharic, Afaan Oromoo, Tigrinya, and English with real speech input and voice responses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sheger Prime Multilingual AI Voice Agent | Addis Ababa Real Estate',
    description: 'Standalone conversational AI voice agent for Sheger Prime Real Estate in Addis Ababa, Ethiopia, supporting Amharic, Afaan Oromoo, Tigrinya, and English with real speech input and voice responses.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        suppressHydrationWarning
        className="bg-[#070B14] text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200 min-h-screen font-sans"
      >
        {children}
      </body>
    </html>
  );
}
