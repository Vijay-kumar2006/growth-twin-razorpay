import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Growth Twin for Razorpay — Bounded MCP Commerce & Settlement Gateway',
  description: 'A merchant-controlled AI agent that creates explainable revenue opportunities and prevents unsafe payments. Bounded Model Context Protocol (MCP) commerce gateway with deterministic guardrails and Razorpay settlement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
