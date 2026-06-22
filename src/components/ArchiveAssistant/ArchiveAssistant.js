'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, X, Sparkles } from 'lucide-react';
import styles from './ArchiveAssistant.module.css';

export default function ArchiveAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Greetings, seeker of legacy. I am the Voice of the Archive. How may I assist your literary journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Mocking AI response for now, can be connected to real API
      setTimeout(() => {
        const responses = [
          "To achieve the elite 1% status, focus on the structural integrity of your second act. The Archive values depth over breadth.",
          "Your manuscript is a reflection of your potential. Have you considered the 21-Day Transformation to sharpen your voice?",
          "Legacy is built word by word. The Archive suggests focusing on character-driven narratives for your next chapter.",
          "Welcome back. Your royalties are being processed with the precision the Maybeify standard demands."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Sparkles size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
          >
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3>Voice of the Archive</h3>
                  <span>Online · AI Assistant</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.messages} ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                  <div className={styles.icon}>
                    {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className={styles.content}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typing}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                placeholder="Ask the Archive..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={isLoading}>
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
