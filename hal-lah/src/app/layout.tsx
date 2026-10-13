import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05070c',
};

export const metadata: Metadata = {
  title: 'Hal::laH — Staff Distributed Systems Architect & Engineer',
  description: 'Personal developer portfolio and interactive engineering showcase by Hal::laH. Featuring live Raft consensus simulation, multi-region event streaming, GPU-accelerated WebAssembly canvas, and cryptographic vaults.',
  keywords: [
    'Distributed Systems',
    'Raft Consensus',
    'Software Architect',
    'High Throughput Streaming',
    'Kafka',
    'WebAssembly',
    'Rust',
    'Go',
    'Next.js',
    'Hal::laH'
  ],
  authors: [{ name: 'Hal::laH' }],
  openGraph: {
    title: 'Hal::laH — Staff Distributed Systems Architect',
    description: 'High-throughput streaming, Raft consensus simulators, and mission-critical engineering systems.',
    type: 'website',
  },
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
