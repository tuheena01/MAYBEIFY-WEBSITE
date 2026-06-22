import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { id, status } = await req.json();
    
    const updated = await prisma.manuscript.update({
      where: { id },
      data: { status }
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error('Update Status Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update status' }), { status: 500 });
  }
}
