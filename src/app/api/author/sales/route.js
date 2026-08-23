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

    // Calculate platform-specific aggregates
    let totalBooks = books.length;
    let amazonUnits = 0, amazonRev = 0;
    let kindleUnits = 0, kindleRev = 0;
    let playbooksUnits = 0, playbooksRev = 0;

    const allReports = [];

    books.forEach(book => {
      book.platformReports.forEach(report => {
        const platform = report.platform.toUpperCase();
        if (platform === 'AMAZON') {
          amazonUnits += report.unitsSold;
          amazonRev += report.revenue;
        } else if (platform === 'KINDLE') {
          kindleUnits += report.unitsSold;
          kindleRev += report.revenue;
        } else if (platform === 'PLAYBOOKS' || platform === 'GOOGLE PLAY BOOKS') {
          playbooksUnits += report.unitsSold;
          playbooksRev += report.revenue;
        }

        allReports.push({
          id: report.id,
          bookId: book.id,
          bookTitle: book.title,
          platform: report.platform,
          month: report.month,
          year: report.year,
          unitsSold: report.unitsSold,
          revenue: report.revenue,
          screenshot: report.screenshot,
          createdAt: report.createdAt
        });
      });
    });

    // Sort reports: Year desc, then Month desc
    const monthOrder = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    allReports.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      const monthNameA = a.month.split(' ')[0];
      const monthNameB = b.month.split(' ')[0];
      return (monthOrder[monthNameB] ?? 0) - (monthOrder[monthNameA] ?? 0);
    });

    const totalUnitsSold = amazonUnits + kindleUnits + playbooksUnits;
    const totalRevenue = amazonRev + kindleRev + playbooksRev;

    return NextResponse.json({
      success: true,
      metrics: {
        totalBooks,
        totalUnitsSold,
        totalRevenue,
        platformBreakdown: {
          amazon: { units: amazonUnits, revenue: amazonRev },
          kindle: { units: kindleUnits, revenue: kindleRev },
          playbooks: { units: playbooksUnits, revenue: playbooksRev }
        }
      },
      books: books.map(b => ({
        id: b.id,
        title: b.title,
        price: b.price,
        createdAt: b.createdAt
      })),
      reports: allReports
    });
  } catch (error) {
    console.error('Fetch author sales error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
