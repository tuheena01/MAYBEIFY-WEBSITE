'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

export default function AuthorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    photo: '',
    awards: '',
    publications: ''
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchProfile = () => {
    fetch('/api/author/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((data) => {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          bio: data.profile.bio || '',
          photo: data.profile.photo || '',
          awards: data.profile.awards || '',
          publications: data.profile.publications || ''
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/author/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaveStatus('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        const err = await res.json();
        setSaveStatus(`Error: ${err.error || 'Failed to update profile'}`);
      }
    } catch (err) {
      setSaveStatus('Network error occurred.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Avatar & Bio Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SpotlightCard className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
              <img 
                src={profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt={profile.name} 
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--accent)',
                  background: 'var(--surface)'
                }}
              />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: 0 }}>{profile.name}</h2>
            <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0' }}>
              Author Since {new Date(profile.authorSince).getFullYear()}
            </p>
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5', marginTop: '1rem', fontStyle: 'italic' }}>
              {profile.bio || '"No bio written yet. Click Edit Profile to add one."'}
            </p>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-primary" 
                style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', marginTop: '1.5rem', cursor: 'pointer' }}
              >
                Edit Profile
              </button>
            )}
          </SpotlightCard>
        </div>

        {/* Right Side: Profile Details & Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SpotlightCard className="glass" style={{ padding: '2rem' }}>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                  Update Profile Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>Display Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>Contact Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>Profile Photo URL</label>
                    <input 
                      type="text" 
                      name="photo" 
                      value={formData.photo} 
                      onChange={handleChange}
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>Short Bio</label>
                    <textarea 
                      name="bio" 
                      rows={3} 
                      value={formData.bio} 
                      onChange={handleChange}
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>Awards & Achievements (comma-separated)</label>
                    <input 
                      type="text" 
                      name="awards" 
                      value={formData.awards} 
                      onChange={handleChange}
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>Publications & Press (comma-separated)</label>
                    <input 
                      type="text" 
                      name="publications" 
                      value={formData.publications} 
                      onChange={handleChange}
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', cursor: 'pointer' }}>
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setSaveStatus(null); }}
                    style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'white', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
                {saveStatus && <p style={{ color: 'var(--accent)', marginTop: '1rem', fontSize: '0.9rem' }}>{saveStatus}</p>}
              </form>
            ) : (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  Profile Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ color: '#888', display: 'block', marginBottom: '0.2rem' }}>Email Address</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{profile.email}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888', display: 'block', marginBottom: '0.2rem' }}>Contact Number</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{profile.phone || 'Not provided'}</span>
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginTop: '2.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  Professional Records
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ color: '#888', display: 'block', marginBottom: '0.2rem' }}>Awards & Recognitions</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{profile.awards || 'None listed'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888', display: 'block', marginBottom: '0.2rem' }}>Key Publications</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{profile.publications || 'None listed'}</span>
                  </div>
                </div>
              </div>
            )}
          </SpotlightCard>
        </div>

      </div>
    </div>
  );
}
