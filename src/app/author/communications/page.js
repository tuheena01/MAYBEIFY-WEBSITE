'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function AuthorCommunications() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to Maybeify. We have received your manuscript and it is currently under review.', sender: 'admin', time: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: input,
      sender: 'author',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="animate-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Communications</h1>
      
      <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0 }}>Maybeify Editorial Team</h3>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              alignSelf: msg.sender === 'author' ? 'flex-end' : 'flex-start',
              maxWidth: '70%'
            }}>
              <div style={{
                background: msg.sender === 'author' ? 'var(--accent)' : 'var(--surface)',
                color: msg.sender === 'author' ? '#000' : 'var(--foreground)',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                borderBottomRightRadius: msg.sender === 'author' ? '4px' : '16px',
                borderBottomLeftRadius: msg.sender === 'admin' ? '4px' : '16px',
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', textAlign: msg.sender === 'author' ? 'right' : 'left' }}>
                {msg.time}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..." 
              style={{ flex: 1, padding: '1rem', borderRadius: '30px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
