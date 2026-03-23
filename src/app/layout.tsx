import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Song Portrait',
  description: 'See the soul of a song. Paste a Spotify track and watch it come alive.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
