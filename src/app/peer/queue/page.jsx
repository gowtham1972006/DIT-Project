'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PeerQueuePage() {
  const router = useRouter();
  const [status, setStatus] = useState('Finding an available peer supporter...');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function createSession() {
      try {
        const res = await fetch('/api/peer-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'General Support' }),
        });
        
        const data = await res.json();
        
        if (!mounted) return;

        if (res.ok && data.session_id) {
          setStatus('Session created! Redirecting to secure room...');
          router.replace(`/peer/chat/${data.session_id}`);
        } else {
          setError(data.error || 'Failed to connect to peer queue.');
          setStatus('');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Queue error:', err);
        setError('Network error occurred. Please try again.');
        setStatus('');
      }
    }

    createSession();

    return () => { mounted = false; };
  }, [router]);

  return (
    <main className="container mt-8 fade-in text-center flex-col items-center justify-center p-4">
      <div className="card max-w-md w-full mx-auto" style={{ padding: '3rem 2rem' }}>
        <div className="mb-6" style={{ fontSize: '3rem' }}>🤝</div>
        <h2 className="text-primary mb-4">Peer Support</h2>
        
        {status && <p className="text-secondary mb-8">{status}</p>}
        {error && <p className="text-error mb-8" style={{ color: 'var(--error)' }}>{error}</p>}
        
        {!error && (
          <div className="flex justify-center gap-2 mb-8">
            <div className="animate-pulse-slow" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>
            <div className="animate-pulse-slow" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', animationDelay: '0.2s' }}></div>
            <div className="animate-pulse-slow" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', animationDelay: '0.4s' }}></div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
            Cancel Request
          </Link>
        </div>
      </div>
    </main>
  );
}
