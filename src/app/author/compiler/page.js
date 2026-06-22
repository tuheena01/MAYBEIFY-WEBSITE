import { prisma } from '@/lib/prisma';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import ProgressSlider from '@/components/ProgressSlider/ProgressSlider';

export const dynamic = 'force-dynamic';

async function getAssignedManuscripts() {
  // In real app, filter by Compiler ID
  return await prisma.manuscript.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function CompilerDashboard() {
  const manuscripts = await getAssignedManuscripts();

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Compiler Workspace</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assigned Projects</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>{manuscripts.length}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Avg. Completion</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>42%</p>
        </SpotlightCard>
      </div>

      <SpotlightCard style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Project Progress</h2>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Update your progress. Reaching 50% triggers an automated CEO alert for ISBN and Cover generation.</p>
        
        <div style={{ display: 'grid', gap: '2rem' }}>
          {manuscripts.map((m) => (
            <div key={m.id} style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{m.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase' }}>Package: {m.packageName || 'Not Assigned'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{m.progress}%</div>
                  <div style={{ fontSize: '0.7rem', color: '#555' }}>CURRENT PROGRESS</div>
                </div>
              </div>
              <ProgressSlider id={m.id} currentProgress={m.progress} />
            </div>
          ))}
        </div>
      </SpotlightCard>
    </div>
  );
}
