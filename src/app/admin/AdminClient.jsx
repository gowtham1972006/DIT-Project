'use client';

import { useState } from 'react';
import { unmaskUser, resolveAlert, approvePeer, rejectPeer } from '@/app/actions/admin';

const EXPERIENCE_LABELS = {
  basic: 'Basic',
  moderate: 'Moderate',
  trained: 'Trained Supporter',
};

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ConfirmPopover({ message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div className="confirm-popover">
      <p className="confirm-popover__msg">{message}</p>
      <div className="confirm-popover__actions">
        <button
          id="confirm-popover-cancel"
          type="button"
          className="btn-outline"
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          id="confirm-popover-ok"
          type="button"
          style={{
            padding: '0.25rem 0.65rem',
            fontSize: '0.78rem',
            backgroundColor: danger ? 'var(--error)' : 'var(--success)',
          }}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

export default function AdminClient({ initialAlerts, initialPeers, stats }) {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState(initialAlerts);
  const [peers, setPeers] = useState(initialPeers);
  const [unmasked, setUnmasked] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  // confirmState: { peerId, action: 'approve'|'reject' } | null
  const [confirmState, setConfirmState] = useState(null);

  // ── Alert handlers ───────────────────────────────────────────────────────
  const handleUnmask = async (userId, anonId) => {
    if (
      window.confirm(
        `CAUTION: You are about to view the real identity for ${anonId}.\n` +
        `Reserved ONLY for imminent safety risks. Proceed?`
      )
    ) {
      setLoadingMap(prev => ({ ...prev, [userId]: true }));
      const res = await unmaskUser(userId);
      setLoadingMap(prev => ({ ...prev, [userId]: false }));
      if (res.success) {
        setUnmasked(prev => ({ ...prev, [userId]: res.username }));
      } else {
        alert(res.error);
      }
    }
  };

  const handleResolve = async (alertId) => {
    const res = await resolveAlert(alertId);
    if (res.success) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } else {
      alert(res.error);
    }
  };

  // ── Peer confirm flow ────────────────────────────────────────────────────
  const requestAction = (peerId, action) => {
    setConfirmState({ peerId, action });
  };

  const cancelAction = () => setConfirmState(null);

  const executeAction = async () => {
    if (!confirmState) return;
    const { peerId, action } = confirmState;
    setConfirmState(null);
    setLoadingMap(prev => ({ ...prev, [peerId]: action }));

    const res = action === 'approve' ? await approvePeer(peerId) : await rejectPeer(peerId);

    setLoadingMap(prev => ({ ...prev, [peerId]: null }));
    if (res.success) {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      setPeers(prev => prev.map(p => p.id === peerId ? { ...p, status: newStatus } : p));
    } else {
      alert(res.error);
    }
  };

  const confirmingPeer = confirmState ? peers.find(p => p.id === confirmState.peerId) : null;

  return (
    <main className="container mt-8 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-primary m-0">Admin Dashboard</h1>
      </div>
      <p className="text-secondary mb-8">
        Monitor system health and manage peer supporter approvals.
      </p>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard value={stats.totalStudents} label="Registered Students" color="var(--text-primary)" />
        <StatCard value={stats.totalPeers} label="Peer Supporters" color="var(--primary-color)" />
        <StatCard value={stats.pendingPeers} label="Pending Approval" color="#f0a500" />
        <StatCard value={stats.highRisk} label="High-Risk Users" color="var(--error)" />
        <StatCard value={stats.pendingAlerts} label="Pending Alerts" color="var(--error)" />
      </div>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist">
        <button
          role="tab"
          id="tab-alerts"
          aria-selected={activeTab === 'alerts'}
          className={`admin-tab${activeTab === 'alerts' ? ' active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          ⚠ High-Risk Alerts
          {alerts.length > 0 && <span className="tab-badge">{alerts.length}</span>}
        </button>
        <button
          role="tab"
          id="tab-peers"
          aria-selected={activeTab === 'peers'}
          className={`admin-tab${activeTab === 'peers' ? ' active' : ''}`}
          onClick={() => setActiveTab('peers')}
        >
          🤝 Peer Supporters
          {stats.pendingPeers > 0 && <span className="tab-badge tab-badge--warning">{stats.pendingPeers}</span>}
        </button>
      </div>

      {/* ── Inline Confirm Banner ──────────────────────────────────────────── */}
      {confirmState && confirmingPeer && (
        <div className="confirm-banner fade-in" role="alertdialog" aria-live="assertive">
          <div style={{ flex: 1 }}>
            {confirmState.action === 'approve' ? (
              <>✅ Approve <strong>{confirmingPeer.username}</strong>? They will gain access to the peer dashboard.</>
            ) : (
              <>🚫 Reject <strong>{confirmingPeer.username}</strong>? Their account will be blocked but kept on record.</>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              id="confirm-banner-cancel"
              type="button"
              className="btn-outline"
              style={{ padding: '0.3rem 0.85rem', fontSize: '0.82rem' }}
              onClick={cancelAction}
            >
              Cancel
            </button>
            <button
              id="confirm-banner-ok"
              type="button"
              style={{
                padding: '0.3rem 0.85rem',
                fontSize: '0.82rem',
                backgroundColor: confirmState.action === 'approve' ? 'var(--success)' : 'var(--error)',
              }}
              onClick={executeAction}
            >
              {confirmState.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
            </button>
          </div>
        </div>
      )}

      {/* ── Alerts Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="fade-in">
          {alerts.length === 0 ? (
            <div className="card text-center text-secondary py-8">
              ✅ No pending high-risk alerts. Monitoring active.
            </div>
          ) : (
            <div className="flex-col gap-4">
              {alerts.map(alert => (
                <div key={alert.id} className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0' }}>{alert.anonId}</h4>
                      <p className="text-secondary text-sm m-0">
                        Reported at: {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-outline"
                        id={`unmask-${alert.userId}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                        onClick={() => handleUnmask(alert.userId, alert.anonId)}
                        disabled={loadingMap[alert.userId] === true || !!unmasked[alert.userId]}
                      >
                        {loadingMap[alert.userId] === true
                          ? 'Unmasking...'
                          : unmasked[alert.userId]
                          ? `Identity: ${unmasked[alert.userId]}`
                          : 'Unmask Identity'}
                      </button>
                      <button
                        id={`resolve-${alert.id}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', backgroundColor: 'var(--success)' }}
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#fff5f5', padding: '1rem', borderRadius: '8px', border: '1px solid #ffd8d8' }}>
                    <p className="m-0 text-secondary" style={{ fontSize: '0.9rem' }}>
                      <strong>Risk Context:</strong> High-risk intent detected in AI interaction. (Session ID: {alert.sessionId}).
                      Protocol requires immediate counselor evaluation.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Peer Supporters Tab ──────────────────────────────────────────────── */}
      {activeTab === 'peers' && (
        <div className="fade-in">
          {peers.length === 0 ? (
            <div className="card text-center text-secondary py-8">
              No peer supporter applications yet.
            </div>
          ) : (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="peer-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Roll Number</th>
                      <th>Experience Level</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peers.map(peer => (
                      <tr key={peer.id}>
                        <td style={{ fontWeight: 500 }}>{peer.username}</td>
                        <td>
                          <code style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.04)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            {peer.roll_number}
                          </code>
                        </td>
                        <td>{EXPERIENCE_LABELS[peer.experience_level] || peer.experience_level}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {peer.created_at ? new Date(peer.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <StatusBadge status={peer.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {peer.status !== 'approved' && (
                              <button
                                id={`approve-peer-${peer.id}`}
                                type="button"
                                style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }}
                                disabled={!!loadingMap[peer.id] || confirmState?.peerId === peer.id}
                                onClick={() => requestAction(peer.id, 'approve')}
                              >
                                {loadingMap[peer.id] === 'approve' ? '...' : '✓ Approve'}
                              </button>
                            )}
                            {peer.status !== 'rejected' && (
                              <button
                                id={`reject-peer-${peer.id}`}
                                type="button"
                                className="btn-outline"
                                style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                                disabled={!!loadingMap[peer.id] || confirmState?.peerId === peer.id}
                                onClick={() => requestAction(peer.id, 'reject')}
                              >
                                {loadingMap[peer.id] === 'reject' ? '...' : '✕ Reject'}
                              </button>
                            )}
                            {peer.status === 'approved' && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500 }}>Active</span>
                            )}
                            {peer.status === 'rejected' && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="card text-center" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', color }}>{value}</h2>
      <p className="text-secondary m-0" style={{ fontSize: '0.8rem' }}>{label}</p>
    </div>
  );
}
