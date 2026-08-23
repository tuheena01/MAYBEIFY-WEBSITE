import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const payload = await verifyAuth();
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authors = await prisma.user.findMany({
      where: { role: 'AUTHOR' },
      include: {
        books: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, authors });
  } catch (error) {
    console.error('Fetch authors failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
