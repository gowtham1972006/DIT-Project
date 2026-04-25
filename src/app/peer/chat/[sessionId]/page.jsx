'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

// ─── Polling intervals ────────────────────────────────────────────────────────
const MSG_POLL_MS   = 2000; // poll for new messages every 2 s
const STATUS_POLL_MS = 3000; // poll for status change every 3 s (waiting phase)

export default function SharedChatPage() {
  const router   = useRouter();
  const params   = useParams();
  const sessionId = params.sessionId;

  // ── State ────────────────────────────────────────────────────────────────────
  const [sessionInfo,       setSessionInfo]       = useState(null);
  const [connectionStatus,  setConnectionStatus]  = useState('connecting');
  // connecting → waiting | active | closed | error
  const [errorMsg,          setErrorMsg]           = useState('');
  const [messages,          setMessages]           = useState([]);
  const [input,             setInput]              = useState('');
  const [sending,           setSending]            = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const scrollRef        = useRef(null);
  const lastTimestampRef = useRef(null); // ISO string — newest message we've seen
  const msgPollRef       = useRef(null);
  const statusPollRef    = useRef(null);
  const viewerRoleRef    = useRef(null); // keep role stable across poll closures

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Message poll ─────────────────────────────────────────────────────────────
  const startMsgPoll = useCallback(() => {
    if (msgPollRef.current) return; // already running
    msgPollRef.current = setInterval(async () => {
      try {
        const since = lastTimestampRef.current
          ? `?since=${encodeURIComponent(lastTimestampRef.current)}`
          : '';
        const res  = await fetch(`/api/peer-session/${sessionId}/messages${since}`);
        if (!res.ok) return;
        const data = await res.json();

        // Sync status from server (handles session_ended scenario)
        if (data.status === 'closed') {
          setConnectionStatus('closed');
          stopPolling();
        }

        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const incoming    = data.messages.filter((m) => !existingIds.has(m.id));
            if (incoming.length === 0) return prev;

            // Play sound for incoming messages from the other party
            incoming.forEach((m) => {
              if (m.sender_role !== viewerRoleRef.current) playNotificationSound();
            });

            // Track the newest timestamp
            const newest = incoming[incoming.length - 1].timestamp;
            lastTimestampRef.current = newest;
            return [...prev, ...incoming];
          });
        }
      } catch {
        // Network hiccup — silently retry next interval
      }
    }, MSG_POLL_MS);
  }, [sessionId]);

  // ── Status poll (waiting phase only) ────────────────────────────────────────
  const startStatusPoll = useCallback(() => {
    if (statusPollRef.current) return;
    statusPollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/peer-session/${sessionId}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'active') {
          setConnectionStatus('active');
          setMessages((prev) => [
            ...prev,
            { id: 'sys-' + Date.now(), isSystem: true, content: 'A peer supporter has connected. You can now chat.' },
          ]);
          stopStatusPoll();
          startMsgPoll();
        } else if (data.status === 'closed') {
          setConnectionStatus('closed');
          stopPolling();
        }
      } catch {
        // ignore
      }
    }, STATUS_POLL_MS);
  }, [sessionId, startMsgPoll]);

  const stopMsgPoll = () => {
    if (msgPollRef.current) { clearInterval(msgPollRef.current); msgPollRef.current = null; }
  };
  const stopStatusPoll = () => {
    if (statusPollRef.current) { clearInterval(statusPollRef.current); statusPollRef.current = null; }
  };
  const stopPolling = () => { stopMsgPoll(); stopStatusPoll(); };

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const res  = await fetch(`/api/peer-session/${sessionId}`);
        const data = await res.json();
        if (!mounted) return;

        if (!res.ok) {
          setConnectionStatus('error');
          setErrorMsg(data.error || 'Failed to load session.');
          return;
        }

        viewerRoleRef.current = data.viewer_role;

        setSessionInfo({
          viewerRole: data.viewer_role,
          topic:      data.session.topic,
          isPeer:     data.viewer_role === 'peer',
          label:      data.viewer_label,
          anonId:     data.session.student_anon_id,
        });

        // Seed history
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
        }

        if (data.session.status === 'closed') {
          setConnectionStatus('closed');
          return;
        }

        setConnectionStatus(data.session.status); // 'waiting' or 'active'

        if (data.session.status === 'active') {
          startMsgPoll();
        } else {
          // waiting — poll status until peer joins, then switch to msg poll
          startStatusPoll();
        }
      } catch {
        if (mounted) {
          setConnectionStatus('error');
          setErrorMsg('Network error. Please try again.');
        }
      }
    }

    init();

    return () => {
      mounted = false;
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Peer joining their own session: skip waiting, go straight to msg poll ────
  useEffect(() => {
    if (sessionInfo?.isPeer && connectionStatus === 'waiting') {
      // Peer accepted the session from the queue — already in status 'waiting'
      // but after PATCH /status?action=join it will flip to 'active'.
      // The status poll above handles that transition.
    }
  }, [sessionInfo, connectionStatus]);

  // ── Audio notification ───────────────────────────────────────────────────────
  const playNotificationSound = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx  = new Ctx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* ignore */ }
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || connectionStatus !== 'active' || sending) return;

    setSending(true);
    setInput('');

    try {
      const res  = await fetch(`/api/peer-session/${sessionId}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        setInput(text); // restore on failure
        return;
      }
      const saved = await res.json();
      // Optimistically add own message (poll deduplicates by id)
      setMessages((prev) => {
        if (prev.some((m) => m.id === saved.id)) return prev;
        lastTimestampRef.current = saved.timestamp;
        return [...prev, saved];
      });
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  // ── End session ──────────────────────────────────────────────────────────────
  const endSession = async () => {
    if (!confirm('Are you sure you want to end this session? It will be closed permanently.')) return;
    try {
      await fetch(`/api/peer-session/${sessionId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'end' }),
      });
    } catch { /* ignore */ }
    stopPolling();
    setConnectionStatus('closed');
    setMessages((prev) => [
      ...prev,
      { id: 'sys-end-' + Date.now(), isSystem: true, content: 'The session has ended.' },
    ]);
    setTimeout(() => router.push(sessionInfo?.isPeer ? '/peer' : '/dashboard'), 1500);
  };

  // ── Render states ─────────────────────────────────────────────────────────────
  if (connectionStatus === 'error') {
    return (
      <main className="container mt-8 fade-in text-center">
        <h2>Cannot load chat</h2>
        <p className="text-secondary">{errorMsg}</p>
        <Link href="/dashboard" className="btn btn-outline mt-4">Return Home</Link>
      </main>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <main className="container mt-8 fade-in text-center">
        <p className="text-secondary mt-8">Connecting to secure room...</p>
      </main>
    );
  }

  const isPeer   = sessionInfo?.isPeer;
  const backLink = isPeer ? '/peer' : '/dashboard';

  return (
    <main className="container mt-4 fade-in flex-col items-center" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="w-full max-w-2xl text-left mb-4 flex justify-between items-center">
        <Link href={backLink} className="text-secondary" style={{ textDecoration: 'none' }}>
          &larr; Back
        </Link>
        <button
          onClick={endSession}
          className="btn-outline"
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
          disabled={connectionStatus === 'closed'}
        >
          {connectionStatus === 'closed' ? 'Session Ended' : 'End Session'}
        </button>
      </div>

      <div className="card flex-col w-full h-full p-0 overflow-hidden mx-auto max-w-2xl" style={{ flexGrow: 1, display: 'flex' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="text-primary m-0">Peer Support Chat</h2>
            <p className="text-secondary m-0" style={{ fontSize: '0.85rem' }}>
              {isPeer
                ? `Chatting with: ${sessionInfo.anonId} (${sessionInfo.topic})`
                : 'You are completely anonymous.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor:
                connectionStatus === 'active'  ? 'var(--success)' :
                connectionStatus === 'waiting' ? '#f0a500' : 'var(--text-secondary)',
            }} />
            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
              {connectionStatus === 'active'  ? 'Connected' :
               connectionStatus === 'waiting' ? 'Waiting for Peer...' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Message area */}
        <div ref={scrollRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {messages.length === 0 && connectionStatus === 'waiting' && !isPeer && (
            <div className="text-center text-secondary my-8">
              A peer supporter will join shortly. Hang tight...
            </div>
          )}

          {messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center text-secondary fade-in" style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '1rem 0' }}>
                  {msg.content}
                </div>
              );
            }

            const isMine = msg.sender_role === sessionInfo?.viewerRole;
            return (
              <div key={msg.id} className="fade-in" style={{
                alignSelf:     isMine ? 'flex-end' : 'flex-start',
                maxWidth:      '85%',
                display:       'flex',
                flexDirection: 'column',
                alignItems:    isMine ? 'flex-end' : 'flex-start',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
                  {isMine ? 'You' : msg.sender_label} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div style={{
                  backgroundColor:       isMine ? 'var(--primary-color)' : '#f1f5f9',
                  color:                 isMine ? 'white' : 'var(--text-primary)',
                  padding:               '0.75rem 1.25rem',
                  borderRadius:          '1.5rem',
                  borderBottomRightRadius: isMine  ? '0.25rem' : '1.5rem',
                  borderBottomLeftRadius:  !isMine ? '0.25rem' : '1.5rem',
                  boxShadow:             'var(--shadow-sm)',
                  wordBreak:             'break-word',
                  lineHeight:            '1.5',
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: '#fff' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              connectionStatus === 'active'  ? 'Type your message...' :
              connectionStatus === 'waiting' ? 'Waiting for peer...' : 'Session closed'
            }
            style={{ margin: 0, flexGrow: 1, borderRadius: '9999px', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)' }}
            disabled={connectionStatus !== 'active' || sending}
          />
          <button
            type="submit"
            disabled={connectionStatus !== 'active' || !input.trim() || sending}
            style={{ borderRadius: '50%', width: '3rem', height: '3rem', padding: 0, flexShrink: 0, opacity: (connectionStatus !== 'active' || !input.trim() || sending) ? 0.6 : 1 }}
          >
            &uarr;
          </button>
        </form>
      </div>
    </main>
  );
}
