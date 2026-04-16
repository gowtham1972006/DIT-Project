'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import io from 'socket.io-client';

export default function SharedChatPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId;

  // Connection states
  const [sessionInfo, setSessionInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, waiting, active, closed, error
  const [errorMsg, setErrorMsg] = useState('');
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, otherTyping]);

  // Load history and connect socket
  useEffect(() => {
    let mounted = true;

    async function initRoom() {
      try {
        // 1. Fetch history + auth check via REST
        const res = await fetch(`/api/peer-session/${sessionId}`);
        const data = await res.json();
        
        if (!mounted) return;

        if (!res.ok) {
          setConnectionStatus('error');
          setErrorMsg(data.error || 'Failed to load session.');
          return;
        }

        setSessionInfo({
          viewerRole: data.viewer_role, // 'student' or 'peer'
          topic: data.session.topic,
          isPeer: data.viewer_role === 'peer',
          label: data.viewer_label,
          anonId: data.session.student_anon_id,
        });
        
        setMessages(data.messages || []);
        
        if (data.session.status === 'closed') {
          setConnectionStatus('closed');
          return; // Don't connect socket if closed
        }

        setConnectionStatus(data.session.status); // 'waiting' or 'active'

        // 2. Connect Socket.io (no URL means same origin)
        const socket = io();
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join_room', { session_id: sessionId });
        });

        socket.on('room_joined', ({ status }) => {
          setConnectionStatus(status);
        });

        socket.on('peer_joined', ({ message }) => {
          setConnectionStatus('active');
          // Add a system message locally
          setMessages(prev => [...prev, { id: 'sys-'+Date.now(), isSystem: true, content: message }]);
        });

        socket.on('receive_message', (msg) => {
          setMessages(prev => {
            // Deduplicate just in case
            if (prev.some(m => m.id === msg.id)) return prev;
            
            // Play sound if the message is from the other user
            if (msg.sender_role !== data.viewer_role) {
              playNotificationSound();
            }
            
            return [...prev, msg];
          });
          setOtherTyping(false);
        });

        socket.on('user_typing', ({ role }) => {
          if (role !== data.viewer_role) setOtherTyping(true);
        });

        socket.on('user_stop_typing', () => {
          setOtherTyping(false);
        });

        socket.on('session_ended', ({ message }) => {
          setConnectionStatus('closed');
          setMessages(prev => [...prev, { id: 'sys-'+Date.now(), isSystem: true, content: message }]);
          if (socketRef.current) socketRef.current.disconnect();
        });

        socket.on('user_disconnected', ({ message }) => {
          setMessages(prev => [...prev, { id: 'sys-'+Date.now(), isSystem: true, content: message }]);
        });

        socket.on('error_msg', (msg) => {
          console.error("Socket error:", msg);
          // Optional: handle visual error state
        });

      } catch (err) {
        if (mounted) {
          setConnectionStatus('error');
          setErrorMsg('Network error.');
        }
      }
    }

    initRoom();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [sessionId]);

  // Web Audio API — Soft Pop Notification
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
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
    } catch(e) {
      // Ignore audio errors (e.g. browser autoplay policies)
    }
  };

  // Handle typing event
  const handleTyping = (e) => {
    setInput(e.target.value);
    
    if (socketRef.current && connectionStatus === 'active') {
      socketRef.current.emit('typing', { session_id: sessionId });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { session_id: sessionId });
      }, 1500);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || connectionStatus !== 'active' || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      session_id: sessionId,
      content: input,
    });
    
    socketRef.current.emit('stop_typing', { session_id: sessionId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setInput('');
  };

  const endSession = () => {
    if (confirm('Are you sure you want to end this session? It will be closed permanently.')) {
      if (socketRef.current) {
        socketRef.current.emit('end_session', { session_id: sessionId });
      }
      setTimeout(() => router.push('/dashboard'), 500);
    }
  };

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

  const isPeer = sessionInfo?.isPeer;
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
              {isPeer ? `Chatting with: ${sessionInfo.anonId} (${sessionInfo.topic})` : 'You are completely anonymous.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '10px', height: '10px', borderRadius: '50%', 
              backgroundColor: connectionStatus === 'active' ? 'var(--success)' : 
                               connectionStatus === 'waiting' ? '#f0a500' : 'var(--text-secondary)'
            }}></div>
            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
              {connectionStatus === 'active' ? 'Connected' : 
               connectionStatus === 'waiting' ? 'Waiting for Peer...' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {messages.length === 0 && connectionStatus === 'waiting' && !isPeer && (
            <div className="text-center text-secondary my-8">
              A peer supporter will join shortly. Hang tight...
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center text-secondary fade-in" style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '1rem 0' }}>
                  {msg.content}
                </div>
              );
            }

            const isMine = msg.sender_role === sessionInfo.viewerRole;
            
            return (
              <div key={msg.id} className="fade-in" style={{ 
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
                  {isMine ? 'You' : msg.sender_label} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div style={{
                  backgroundColor: isMine ? 'var(--primary-color)' : '#f1f5f9',
                  color: isMine ? 'white' : 'var(--text-primary)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '1.5rem',
                  borderBottomRightRadius: isMine ? '0.25rem' : '1.5rem',
                  borderBottomLeftRadius: !isMine ? '0.25rem' : '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  wordBreak: 'break-word',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          
          {otherTyping && (
            <div className="fade-in" style={{ alignSelf: 'flex-start', marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Typing...
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: '#fff' }}>
          <input 
            type="text" 
            value={input} 
            onChange={handleTyping}
            placeholder={connectionStatus === 'active' ? "Type your message..." : connectionStatus === 'waiting' ? "Waiting for peer..." : "Session closed"} 
            style={{ margin: 0, flexGrow: 1, borderRadius: '9999px', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)' }} 
            disabled={connectionStatus !== 'active'}
          />
          <button 
            type="submit" 
            disabled={connectionStatus !== 'active' || !input.trim()} 
            style={{ borderRadius: '50%', width: '3rem', height: '3rem', padding: 0, flexShrink: 0, opacity: (connectionStatus !== 'active' || !input.trim()) ? 0.6 : 1 }}
          >
            &uarr;
          </button>
        </form>
      </div>
    </main>
  );
}
