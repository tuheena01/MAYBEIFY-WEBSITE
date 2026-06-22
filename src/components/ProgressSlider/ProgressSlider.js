'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ProgressSlider({ id, currentProgress }) {
  const [progress, setProgress] = useState(currentProgress);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manuscript/update-details', {
        method: 'POST',
        body: JSON.stringify({ id, progress }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={progress} 
        onChange={(e) => setProgress(e.target.value)}
        style={{
          width: '100%',
          height: '6px',
          background: '#222',
          borderRadius: '5px',
          appearance: 'none',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>Drag to update progress</span>
        <button 
          onClick={handleUpdate} 
          disabled={loading || progress == currentProgress}
          style={{
            background: progress >= 50 && currentProgress < 50 ? '#10b981' : '#d4af37',
            color: '#000',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: loading || progress == currentProgress ? 0.5 : 1,
            transition: 'all 0.3s'
          }}
        >
          {loading ? 'Updating...' : 'Update Progress'}
        </button>
      </div>
      {progress >= 50 && currentProgress < 50 && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '10px' }}
        >
          ✦ Reaching 50% will notify the CEO to generate ISBN and Cover.
        </motion.p>
      )}
    </div>
  );
}
