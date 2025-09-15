import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Buyer Leads App',
  description: 'Capture, manage buyer leads',
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
