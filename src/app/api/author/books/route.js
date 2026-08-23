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

    const books = await prisma.book.findMany({
      where: { authorId: payload.userId },
      include: {
        platformReports: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const booksWithStats = books.map(book => {
      const unitsSold = book.platformReports.reduce((sum, r) => sum + r.unitsSold, 0);
      const revenue = book.platformReports.reduce((sum, r) => sum + r.revenue, 0);

      return {
        id: book.id,
        title: book.title,
        price: book.price,
        cover: book.cover,
        synopsis: book.synopsis,
        status: book.status,
        views: book.views,
        downloads: book.downloads,
        reads: book.reads,
        rating: book.rating,
        unitsSold,
        revenue,
        createdAt: book.createdAt
      };
    });

    return NextResponse.json({ success: true, books: booksWithStats });
  } catch (error) {
    console.error('Fetch author books error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
