import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'useSearchParamState — Next.js Example',
  description: 'Next.js App Router with SSR + CSR using useSearchParamState',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
