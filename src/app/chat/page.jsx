'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi there. This is a safe space. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPeerPrompt, setShowPeerPrompt] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        if ((data.intensity === 'medium' || data.intensity === 'high' ) && (data.emotion === 'sadness' || data.emotion === 'anger' || data.emotion === 'fear')) {
          setShowPeerPrompt(true);
        } else {
          setShowPeerPrompt(false);
        }
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't process that right now." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Network error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mt-4 fade-in flex-col items-center" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="w-full max-w-2xl text-left mb-4">
        <Link href="/dashboard" className="text-secondary" style={{ textDecoration: 'none' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="card flex-col w-full h-full p-0 overflow-hidden mx-auto max-w-2xl" style={{ flexGrow: 1, display: 'flex' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <h2 className="text-primary m-0">AI Companion</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.85rem' }}>Completely private and anonymous.</p>
        </div>

        <div ref={scrollRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? 'var(--primary-color)' : '#f1f5f9',
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              padding: '0.75rem 1.25rem',
              borderRadius: '1.5rem',
              borderBottomRightRadius: msg.sender === 'user' ? '0.25rem' : '1.5rem',
              borderBottomLeftRadius: msg.sender === 'bot' ? '0.25rem' : '1.5rem',
              maxWidth: '85%',
              boxShadow: 'var(--shadow-sm)',
              wordBreak: 'break-word',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Companion is typing...
            </div>
          )}
          
          {showPeerPrompt && (
            <div className="fade-in" style={{ alignSelf: 'center', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p className="text-secondary mb-4 text-center">Would you like to connect with a Peer Supporter?</p>
              <Link href="/peer/queue" className="btn btn-outline text-center" style={{ textDecoration: 'none' }}>
                Connect Anonymous Peer
              </Link>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: '#fff' }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Type your message here..." 
            style={{ margin: 0, flexGrow: 1, borderRadius: '9999px', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)' }} 
            disabled={loading}
          />
          <button type="submit" disabled={loading} style={{ borderRadius: '50%', width: '3rem', height: '3rem', padding: 0, flexShrink: 0 }}>
            &uarr;
          </button>
        </form>
      </div>
    </main>
  );
}
