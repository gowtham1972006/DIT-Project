import Link from 'next/link';

export const metadata = {
  title: 'Application Pending — MindGuard',
  description: 'Your peer supporter application is under review.',
};

export default function PendingPage() {
  return (
    <main className="container flex-col items-center justify-center mt-8 fade-in" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="card max-w-md w-full text-center" style={{ padding: '3rem 2rem' }}>

        {/* Animated clock / pending illustration */}
        <div className="pending-orbit" aria-hidden="true">
          <div className="pending-ring" />
          <div className="pending-icon">⏳</div>
        </div>

        <h2 className="text-primary mt-6 mb-2">Application Submitted!</h2>
        <p className="text-secondary mb-2" style={{ fontSize: '1rem' }}>
          Thank you for signing up as a <strong>Peer Supporter</strong>.
        </p>
        <p className="text-secondary mb-6" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
          Your application is currently <span className="badge badge-pending">pending review</span>.
          An admin will verify your details and approve your account shortly.
          You will be able to log in once your account has been approved.
        </p>

        <div
          style={{
            background: 'rgba(121,163,177,0.08)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📋 <strong>What happens next?</strong>
          </p>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li>Admin reviews your roll number &amp; experience level</li>
            <li>Account is approved or rejected within 24–48 hours</li>
            <li>Return to login to check your access status</li>
          </ul>
        </div>

        <Link href="/login">
          <button type="button" id="pending-back-login-btn" style={{ width: '100%' }}>
            Back to Login
          </button>
        </Link>

        <div className="mt-4">
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
