import type {Metadata} from 'next';
import { Pixelify_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const pixelFont = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Pixel Tactics Idle',
  description: 'A premium browser-based idle MMORPG with a central isometric battlefield, tactical movement, and auto-battle mechanics.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body className="font-pixel" suppressHydrationWarning>{children}</body>
    </html>
  );
}
