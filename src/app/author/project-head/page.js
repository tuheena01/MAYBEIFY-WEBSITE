import { prisma } from '@/lib/prisma';
import SpotlightCard from '@/components/SpotlightCard/SpotlightCard';
import ProjectEditor from '@/components/ProjectEditor/ProjectEditor';

export const dynamic = 'force-dynamic';

async function getProjectHeadManuscripts() {
  // In a real app, we would filter by the logged-in Project Head's ID
  // For this prototype, we'll show all but labeled for Project Head view
  return await prisma.manuscript.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function ProjectHeadDashboard() {
  const manuscripts = await getProjectHeadManuscripts();

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Project Management</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Managed Projects</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>{manuscripts.length}</p>
        </SpotlightCard>
        <SpotlightCard style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Compilers</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>3</p>
        </SpotlightCard>
      </div>

      <SpotlightCard style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Manuscript Specifications</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Author</th>
                <th style={{ padding: '1rem' }}>Project Name</th>
                <th style={{ padding: '1rem' }}>Package</th>
                <th style={{ padding: '1rem' }}>Progress</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {manuscripts.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem' }}>{m.author.name}</td>
                  <td style={{ padding: '1rem' }}>{m.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: 'var(--accent)' }}>{m.packageName || 'Not Set'}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '100px', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${m.progress}%`, height: '100%', background: 'var(--accent)' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>{m.progress}%</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <ProjectEditor id={m.id} currentTitle={m.title} currentPackage={m.packageName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
