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
      select: {
        name: true,
        completionPercent: true,
        status: true,
        referralCode: true,
        createdAt: true
      }
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

    // 4. Books stats
    const books = await prisma.book.findMany({
      where: { authorId: payload.userId },
      include: {
        platformReports: true
      }
    });

    const totalBooks = books.length;
    const publishedBooks = books.filter(b => b.status === 'PUBLISHED').length;

    let totalUnitsSold = 0;
    let totalSalesRevenue = 0;
    books.forEach(b => {
      totalUnitsSold += b.platformReports.reduce((sum, s) => sum + s.unitsSold, 0);
      totalSalesRevenue += b.platformReports.reduce((sum, s) => sum + s.revenue, 0);
    });

    // 5. Withdrawal Requests & Transactions
    const transactions = await prisma.transaction.findMany({
      where: { authorId: payload.userId }
    });
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { authorId: payload.userId }
    });
    
    // Total earnings strictly from sales reports addition
    const totalEarnings = totalSalesRevenue;

    // 6. Recent Activity
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

    // Compute platform breakdown stats
    const platformStats = {
      AMAZON: { name: 'Amazon Store', units: 0, revenue: 0, color: '#2e7d32' },
      MAYBEIFY: { name: 'Maybeify Direct', units: 0, revenue: 0, color: '#455a64' },
      KINDLE: { name: 'Amazon Kindle', units: 0, revenue: 0, color: '#c2185b' },
      PLAYBOOKS: { name: 'Google Playbooks', units: 0, revenue: 0, color: '#f57f17' }
    };

    books.forEach(b => {
      b.platformReports.forEach(r => {
        const platformKey = r.platform.toUpperCase();
        if (platformStats[platformKey]) {
          platformStats[platformKey].units += r.unitsSold;
          platformStats[platformKey].revenue += r.revenue;
        }
      });
    });

    const breakdown = Object.values(platformStats);

    return NextResponse.json({
      success: true,
      author: {
        name: user.name,
        completionPercent: user.completionPercent,
        status: user.status
      },
      stats: {
        manuscriptsCount,
        messageCount,
        referralsCount,
        totalUnitsSold,
        totalBooks,
        publishedBooks,
        totalEarnings,
        breakdown
      },
      activities: finalActivities
    });
  } catch (error) {
    console.error('Fetch author dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
