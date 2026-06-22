'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StatusUpdater({ id, currentStatus }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const res = await fetch('/api/manuscript/update-status', {
        method: 'POST',
        body: JSON.stringify({ id, status: newStatus }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select 
      value={currentStatus} 
      onChange={(e) => updateStatus(e.target.value)}
      disabled={loading}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '8px',
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      <option value="PENDING">Pending</option>
      <option value="ACCEPTED">Accepted</option>
      <option value="WITH_COMPILER">With Compiler</option>
      <option value="STRUCTURING">Structuring</option>
      <option value="POLISHED">Polished</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );
}
