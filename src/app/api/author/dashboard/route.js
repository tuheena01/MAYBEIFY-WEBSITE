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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { referralCode: true, createdAt: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Total manuscripts count
    const manuscriptsCount = await prisma.manuscript.count({
      where: { authorId: payload.userId }
    });

    // 2. Message count
    const messageCount = await prisma.message.count({
      where: {
        OR: [
          { senderId: payload.userId },
          { receiverId: payload.userId }
        ]
      }
    });

    // 3. Referrals count
    const referralsCount = await prisma.user.count({
      where: { referredBy: user.referralCode }
    });

    // 4. Sales count
    const books = await prisma.book.findMany({
      where: { authorId: payload.userId },
      include: {
        platformReports: true
      }
    });

    let totalUnitsSold = 0;
    books.forEach(b => {
      totalUnitsSold += b.platformReports.reduce((sum, s) => sum + s.unitsSold, 0);
    });

    // 5. Recent Activity
    const activities = [];

    // Add welcome activity
    activities.push({
      date: new Date(user.createdAt).toLocaleDateString(),
      text: 'Welcome to Maybeify! Your profile has been initialized.',
      type: 'system'
    });

    // Add manuscript activities
    const manuscripts = await prisma.manuscript.findMany({
      where: { authorId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    manuscripts.forEach(m => {
      activities.push({
        date: new Date(m.createdAt).toLocaleDateString(),
        text: `Manuscript "${m.title}" submitted. Status: ${m.status}.`,
        type: 'manuscript'
      });
    });

    // Add sales activities
    const sales = [];
    books.forEach(b => {
      b.platformReports.forEach(s => {
        sales.push({
          date: s.month,
          text: `[${s.platform}] Sold ${s.unitsSold} unit(s) of "${b.title}" for $${s.revenue.toFixed(2)}.`,
          purchasedAt: s.createdAt,
          type: 'sale'
        });
      });
    });

    // Sort and take latest 5 activities
    sales.forEach(s => activities.push(s));
    activities.sort((a, b) => {
      const dateA = a.purchasedAt ? new Date(a.purchasedAt) : new Date(0);
      const dateB = b.purchasedAt ? new Date(b.purchasedAt) : new Date(0);
      return dateB - dateA;
    });

    const finalActivities = activities.slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        manuscriptsCount,
        messageCount,
        referralsCount,
        totalUnitsSold,
      },
      activities: finalActivities
    });
  } catch (error) {
    console.error('Fetch author dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
