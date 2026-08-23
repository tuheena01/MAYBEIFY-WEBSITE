'use client';

import { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import Link from 'next/link';

export default function BooksLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/author/books')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load books');
        return res.json();
      })
      .then((data) => {
        setBooks(data.books);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading books library...</p>
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
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2.5rem' }}>My Books</h1>

      {books.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#888' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>You have no registered books in the portal yet.</p>
          <Link href="/author/communications" className="btn-primary" style={{ padding: '0.8rem 1.8rem', borderRadius: '20px' }}>
            Submit a Manuscript
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {books.map((book) => (
            <SpotlightCard 
              key={book.id} 
              className="glass" 
              style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                borderBottom: book.status === 'PUBLISHED' ? '4px solid var(--success)' : 
                              book.status === 'UNDER_REVIEW' ? '4px solid var(--accent)' : '4px solid #555'
              }}
            >
              {/* Cover Container */}
              <div style={{ height: '240px', background: '#0d0e12', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={book.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'} 
                  alt={book.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem',
                  padding: '0.3rem 0.7rem', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold',
                  background: book.status === 'PUBLISHED' ? 'rgba(0, 230, 118, 0.85)' : 
                              book.status === 'UNDER_REVIEW' ? 'rgba(212, 175, 55, 0.85)' : 'rgba(0,0,0,0.7)',
                  color: '#000'
                }}>
                  {book.status}
                </span>
              </div>

              {/* Details */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)', lineHeight: '1.3' }}>
                    {book.title}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '1rem' }}>
                    ₹{book.price.toFixed(2)}
                  </p>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {book.synopsis || 'No synopsis added for this book.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <Link 
                    href={`/author/books/${book.id}`} 
                    className="btn-primary" 
                    style={{ flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: '15px', fontSize: '0.85rem' }}
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/author/books/${book.id}#analytics`} 
                    style={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      padding: '0.5rem', 
                      borderRadius: '15px', 
                      fontSize: '0.85rem', 
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--surface-border)',
                      color: 'white'
                    }}
                  >
                    Analytics
                  </Link>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}
