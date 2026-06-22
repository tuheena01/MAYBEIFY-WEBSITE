import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { id, title, packageName, progress } = await req.json();
    
    const data = {};
    if (title !== undefined) data.title = title;
    if (packageName !== undefined) data.packageName = packageName;
    if (progress !== undefined) data.progress = parseInt(progress);

    const updated = await prisma.manuscript.update({
      where: { id },
      data
    });

    // Check for CEO Alert (Mock)
    if (progress >= 50) {
      console.log(`[CEO ALERT] Manuscript ${id} reached ${progress}%. Action required: Generate ISBN and Cover.`);
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error('Update Manuscript Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update manuscript' }), { status: 500 });
  }
}
