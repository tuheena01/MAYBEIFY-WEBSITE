import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const payload = await verifyAuth();
    if (!payload || payload.role !== 'AUTHOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const royalties = await prisma.royalty.findMany({
      where: { authorId: payload.userId },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarned = royalties.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      success: true,
      totalEarned,
      royalties
    });
  } catch (error) {
    console.error('Fetch author royalties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
