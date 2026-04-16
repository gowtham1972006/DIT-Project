'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PeerChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { sender: 'peer', text: "Hi, I'm a trained peer supporter. I'm here to listen. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'me', text: userMessage }]);
    setInput('');

    // Mock response from peer
    setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'peer', text: "I hear you. That sounds really challenging. I'm glad you reached out. Would it help to talk more about what's making you feel that way?" }]);
    }, 2500);
  };

  const endSession = () => {
      if(confirm('Are you sure you want to end this session?')) {
          router.push('/dashboard');
      }
  };

  return (
    <main className="container mt-4 fade-in flex-col items-center" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="w-full max-w-2xl text-left mb-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-secondary" style={{ textDecoration: 'none' }}>
          &larr; Back to Dashboard
        </Link>
        <button onClick={endSession} className="btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
            End Session
        </button>
      </div>

      <div className="card flex-col w-full h-full p-0 overflow-hidden mx-auto max-w-2xl" style={{ flexGrow: 1, display: 'flex' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
              <h2 className="text-primary m-0">Peer Support Chat</h2>
              <p className="text-secondary m-0" style={{ fontSize: '0.85rem' }}>You are completely anonymous (Anon-1A2B).</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Peer Connected</span>
          </div>
        </div>

        <div ref={scrollRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'me' ? 'var(--primary-color)' : '#f1f5f9',
              color: msg.sender === 'me' ? 'white' : 'var(--text-primary)',
              padding: '0.75rem 1.25rem',
              borderRadius: '1.5rem',
              borderBottomRightRadius: msg.sender === 'me' ? '0.25rem' : '1.5rem',
              borderBottomLeftRadius: msg.sender === 'peer' ? '0.25rem' : '1.5rem',
              maxWidth: '85%',
              boxShadow: 'var(--shadow-sm)',
              wordBreak: 'break-word',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: '#fff' }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Type your message..." 
            style={{ margin: 0, flexGrow: 1, borderRadius: '9999px', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)' }} 
          />
          <button type="submit" style={{ borderRadius: '50%', width: '3rem', height: '3rem', padding: 0, flexShrink: 0 }}>
            &uarr;
          </button>
        </form>
      </div>
    </main>
  );
}
