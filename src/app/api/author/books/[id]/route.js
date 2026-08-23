import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const payload = await verifyAuth();
    if (!payload || payload.role !== 'AUTHOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: {
        id,
        authorId: payload.userId
      },
      include: {
        platformReports: true
      }
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const unitsSold = book.platformReports.reduce((sum, r) => sum + r.unitsSold, 0);
    const revenue = book.platformReports.reduce((sum, r) => sum + r.revenue, 0);

    const result = {
      ...book,
      unitsSold,
      revenue,
      reviewsCount: 15, // Mock reviews count
    };

    return NextResponse.json({ success: true, book: result });
  } catch (error) {
    console.error('Fetch author book details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
