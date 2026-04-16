'use client';

import { useActionState, useEffect } from 'react';
import { loginUser } from '@/app/actions/auth';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full mt-4" id="login-submit-btn">
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

import Footer from '@/components/Footer';

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, null);
  const router = useRouter();

  // If server action signals a pending peer, redirect to the info page
  useEffect(() => {
    if (state?.pendingRedirect) {
      router.push('/register/pending');
    }
  }, [state, router]);

  return (
    <>
      <main className="container flex-col items-center justify-center mt-8 fade-in">
        <div className="card max-w-md w-full">
          <h2 className="text-center text-primary mb-8">Welcome Back</h2>

          <form action={formAction}>
            <div>
              <label className="label" htmlFor="login-username">Roll Number or Username</label>
              <input id="login-username" type="text" name="username" placeholder="Enter your ID" required />
            </div>

            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" name="password" placeholder="Enter your password" required />
            </div>

            {state?.error && (
              <div
                className="p-4 mb-4 text-sm"
                style={{
                  backgroundColor: 'rgba(224,122,95,0.12)',
                  border: '1px solid var(--error)',
                  borderRadius: '10px',
                  color: 'var(--error)',
                }}
              >
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>

          <div className="text-center mt-4">
            <Link href="/register" className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Don&apos;t have an account?{' '}
              <span style={{ color: 'var(--primary-color)' }}>Register</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
