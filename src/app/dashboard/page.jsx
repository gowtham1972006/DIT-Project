import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import Footer from '@/components/Footer';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    redirect('/login');
  }

  return (
    <>
      <main className="container mt-8 fade-in">
        <h1 className="text-primary mb-2">Student Dashboard</h1>
        <p className="text-secondary mb-8">
          Your session is entirely private. Your Anonymous ID is <span style={{ fontWeight: 'bold' }}>{session.anonymous_id}</span>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Link href="/relaxation" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
            <h3 className="text-primary" style={{ margin: 0 }}>Relaxation</h3>
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>Breathing exercises and grounding techniques.</p>
          </Link>

          <Link href="/chat" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
            <h3 className="text-primary" style={{ margin: 0 }}>AI Companion</h3>
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>Chat privately for empathetic support and guidance.</p>
          </Link>

          <Link href="/peer/queue" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
            <h3 className="text-primary" style={{ margin: 0 }}>Peer Support</h3>
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>Talk to a trained student listener anonymously.</p>
          </Link>

          <Link href="/career" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
            <h3 className="text-primary" style={{ margin: 0 }}>Career Center</h3>
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>Guides, resources, and resume tips.</p>
          </Link>

          <Link href="/fitness" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💪</div>
            <h3 className="text-primary" style={{ margin: 0 }}>Body & Fitness</h3>
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>Beginner exercises, routines, and workout tips.</p>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}