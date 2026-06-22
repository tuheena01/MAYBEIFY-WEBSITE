import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';

export default function AuthorDashboard() {
  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Total Manuscripts</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>1</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Pending Messages</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>0</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Total Referrals</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>0</p>
        </SpotlightCard>
      </div>

      <SpotlightCard style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Recent Activity</h2>
        <ul style={{ listStyle: 'none' }}>
          <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--surface-border)', color: '#ccc' }}>
            <span style={{ color: 'var(--accent)', marginRight: '1rem' }}>Today</span> Account created and manuscript submitted.
          </li>
          <li style={{ padding: '1rem 0', color: '#ccc' }}>
            <span style={{ color: 'var(--accent)', marginRight: '1rem' }}>Today</span> Welcome to Maybeify!
          </li>
        </ul>
      </SpotlightCard>
    </div>
  );
}
