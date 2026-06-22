'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Save, X } from 'lucide-react';

export default function ProjectEditor({ id, currentTitle, currentPackage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [packageName, setPackageName] = useState(currentPackage || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manuscript/update-details', {
        method: 'POST',
        body: JSON.stringify({ id, title, packageName }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
      >
        <Edit2 size={16} />
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Project Name"
        style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '5px', borderRadius: '4px' }}
      />
      <select 
        value={packageName} 
        onChange={(e) => setPackageName(e.target.value)}
        style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '5px', borderRadius: '4px' }}
      >
        <option value="">Select Package</option>
        <option value="Basic">Basic</option>
        <option value="Standard">Standard</option>
        <option value="Premium">Premium</option>
        <option value="Elite">Elite</option>
      </select>
      <div style={{ display: 'flex', gap: '5px' }}>
        <button onClick={handleSave} disabled={loading} style={{ background: '#d4af37', border: 'none', padding: '5px', borderRadius: '4px', color: '#000', flex: 1 }}>
          <Save size={14} />
        </button>
        <button onClick={() => setIsEditing(false)} style={{ background: '#333', border: 'none', padding: '5px', borderRadius: '4px', color: '#fff', flex: 1 }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
