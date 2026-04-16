'use client';

import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { registerUser } from '@/app/actions/auth';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

function SubmitButton({ role }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full mt-4" id="register-submit-btn">
      {pending
        ? 'Please wait...'
        : role === 'peer'
        ? 'Submit Application'
        : 'Create Account'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, null);
  const [role, setRole] = useState('student');
  const peerFieldsRef = useRef(null);

  // Animate peer fields in/out
  useEffect(() => {
    const el = peerFieldsRef.current;
    if (!el) return;
    if (role === 'peer') {
      el.style.display = 'flex';
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    } else {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      setTimeout(() => { if (el) el.style.display = 'none'; }, 280);
    }
  }, [role]);

  return (
    <main className="container flex-col items-center justify-center mt-8 fade-in">
      <div className="card max-w-md w-full">
        <h2 className="text-center text-primary mb-2">Join MindGuard</h2>
        <p className="text-center text-secondary mb-6" style={{ fontSize: '0.9rem' }}>
          Your privacy is our priority. Choose how you&apos;d like to participate.
        </p>

        {/* Role Toggle */}
        <div className="role-toggle mb-6" role="group" aria-label="Account type selection">
          <button
            type="button"
            id="role-student-btn"
            className={`role-card${role === 'student' ? ' active' : ''}`}
            onClick={() => setRole('student')}
          >
            <span className="role-icon">🎓</span>
            <span className="role-label">Student</span>
            <span className="role-desc">Access mental health support &amp; resources</span>
          </button>
          <button
            type="button"
            id="role-peer-btn"
            className={`role-card${role === 'peer' ? ' active' : ''}`}
            onClick={() => setRole('peer')}
          >
            <span className="role-icon">🤝</span>
            <span className="role-label">Peer Supporter</span>
            <span className="role-desc">Help fellow students — requires admin approval</span>
          </button>
        </div>

        {/* Peer pending notice */}
        {role === 'peer' && (
          <div className="status-notice status-notice--pending mb-6">
            <span style={{ fontSize: '1.1rem' }}>⏳</span>
            <span>Peer supporter accounts are reviewed by an admin before activation.</span>
          </div>
        )}

        <form action={formAction}>
          {/* Hidden role field */}
          <input type="hidden" name="role" value={role} />

          {/* Common fields */}
          {role === 'student' && (
            <div>
              <label className="label" htmlFor="reg-rollno">College Roll Number</label>
              <input id="reg-rollno" type="text" name="rollNo" placeholder="e.g. 2023CS105" required={role === 'student'} />
            </div>
          )}

          <div>
            <label className="label" htmlFor="reg-username">Username</label>
            <input id="reg-username" type="text" name="username" placeholder="e.g. coolstudent99" required />
          </div>

          <div>
            <label className="label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" name="password" placeholder="Min 6 characters" required minLength={6} />
          </div>

          {/* Peer-only fields — conditionally animated */}
          <div
            ref={peerFieldsRef}
            className="peer-fields"
            style={{
              display: role === 'peer' ? 'flex' : 'none',
              opacity: role === 'peer' ? 1 : 0,
              transform: 'translateY(0)',
              flexDirection: 'column',
            }}
          >
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0 1.25rem' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontWeight: 500 }}>
              PEER SUPPORTER DETAILS
            </p>

            <div>
              <label className="label" htmlFor="reg-roll-number">
                College Roll Number
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.35rem', fontSize: '0.78rem' }}>
                  (admin-only, never shown publicly)
                </span>
              </label>
              <input
                id="reg-roll-number"
                type="text"
                name="roll_number"
                placeholder="e.g. 2021CS042"
                required={role === 'peer'}
              />
            </div>

            <div>
              <label className="label" htmlFor="reg-experience">Experience Level</label>
              <select id="reg-experience" name="experience_level" required={role === 'peer'} defaultValue="">
                <option value="" disabled>Select your experience level</option>
                <option value="basic">Basic — Some awareness of mental health topics</option>
                <option value="moderate">Moderate — Volunteered or completed basic training</option>
                <option value="trained">Trained Supporter — Certified / formally trained</option>
              </select>
            </div>
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

          <SubmitButton role={role} />
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--primary-color)' }}>Login</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
