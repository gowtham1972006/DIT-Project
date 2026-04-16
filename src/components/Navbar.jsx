import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem' }}>
      <div className="container flex justify-between items-center" style={{ padding: 0 }}>
        <Link href={session ? '/dashboard' : '/'} style={{ textDecoration: 'none', color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 600 }}>
          MindGuard
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              {session.role === 'student' && (
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  ID: {session.anonymous_id}
                </span>
              )}
              {session.role === 'admin' && (
                <Link href="/admin" className="text-primary" style={{ fontWeight: 500 }}>Admin Panel</Link>
              )}
              {session.role === 'peer' && (
                <Link href="/peer" className="text-primary" style={{ fontWeight: 500 }}>Peer Support</Link>
              )}
              <form action={logoutAction}>
                <button type="submit" className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
