'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PeerClient({ initialUsername }) {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/peer-session');
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch queue');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll every 10 seconds for new incoming requests
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (sessionId) => {
    setActionLoading(sessionId);
    try {
      const res = await fetch(`/api/peer-session/${sessionId}`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/peer/chat/${sessionId}`);
      } else {
        alert(data.error || 'Failed to accept session. Someone else may have taken it.');
        fetchQueue(); // refresh queue
      }
    } catch (err) {
      alert('Network error while accepting session.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="container mt-8 fade-in">
      {/* Header with approved badge */}
      <div className="flex items-center gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
        <h1 className="text-primary" style={{ margin: 0 }}>Peer Supporter Dashboard</h1>
        <span className="badge badge-approved">Approved</span>
      </div>

      <p className="text-secondary mb-8">
        Welcome back, <strong>{initialUsername}</strong>. Thank you for being here for your peers.
        Remember to maintain confidentiality and report high-risk situations to the counselor immediately.
      </p>

      <div className="card max-w-2xl mx-auto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="text-primary" style={{ margin: 0 }}>Incoming Connections</h3>
          <button 
            onClick={fetchQueue} 
            className="btn-outline" 
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="text-center p-4 mb-4" style={{ backgroundColor: '#fff5f5', color: 'var(--error)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {loading && sessions.length === 0 ? (
          <p className="text-secondary text-center p-8">Loading incoming requests...</p>
        ) : sessions.length === 0 ? (
          <p className="text-secondary text-center p-8">No students are currently waiting.</p>
        ) : (
          <div className="flex-col gap-4">
            {sessions.map(req => {
              // Calculate wait time
              const mins = Math.max(0, Math.floor((new Date() - new Date(req.created_at)) / 60000));
              const timeString = mins === 0 ? 'Just now' : `${mins} min${mins !== 1 ? 's' : ''} ago`;

              return (
                <div
                  key={req.session_id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{req.student_anon_id}</h4>
                    <p className="text-secondary" style={{ margin: 0, fontSize: '0.875rem' }}>
                      {req.topic} &bull; Waiting for {timeString}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(req.session_id)}
                    disabled={actionLoading === req.session_id}
                    className="btn btn-outline"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    {actionLoading === req.session_id ? 'Accepting...' : 'Accept Request'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
