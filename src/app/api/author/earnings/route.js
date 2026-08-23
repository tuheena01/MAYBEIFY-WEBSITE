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
        bankAccount: true,
        upiId: true,
        paymentMethod: true,
        panGst: true
      }
    });

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: { authorId: payload.userId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch withdrawal requests
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { authorId: payload.userId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch books & sales reports
    const books = await prisma.book.findMany({
      where: { authorId: payload.userId },
      include: { platformReports: true }
    });

    let totalSalesRevenue = 0;
    let thisMonthRevenue = 0;
    const currentMonthLabels = ['August 2026', 'July-August'];

    books.forEach(b => {
      b.platformReports.forEach(r => {
        totalSalesRevenue += r.revenue;
        if (currentMonthLabels.includes(r.month) || r.month.includes('August')) {
          thisMonthRevenue += r.revenue;
        }
      });
    });

    // Calculate payouts
    const paidAmount = withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0);
    const nonRoyaltyPaid = transactions.filter(t => t.status === 'PAID' && t.type !== 'ROYALTY').reduce((sum, t) => sum + t.amount, 0);
    
    const totalEarnings = totalSalesRevenue + nonRoyaltyPaid;
    const pendingEarnings = Math.max(0, totalEarnings - paidAmount);
    const thisMonthEarnings = thisMonthRevenue;

    return NextResponse.json({
      success: true,
      paymentDetails: user,
      metrics: {
        totalEarnings,
        pendingEarnings,
        paidAmount,
        thisMonthEarnings
      },
      transactions: transactions.map(t => ({
        id: t.id,
        date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: t.description,
        amount: t.amount,
        status: t.status,
        type: t.type
      })),
      withdrawals
    });
  } catch (error) {
    console.error('Fetch earnings stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const payload = await verifyAuth();
    if (!payload || payload.role !== 'AUTHOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'update_payment') {
      const { bankAccount, upiId, paymentMethod, panGst } = body;
      const updatedUser = await prisma.user.update({
        where: { id: payload.userId },
        data: {
          bankAccount,
          upiId,
          paymentMethod,
          panGst
        }
      });
      return NextResponse.json({ success: true, paymentDetails: updatedUser });
    }

    if (action === 'request_withdrawal') {
      const { amount } = body;
      if (!amount || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
      }

      const withdrawal = await prisma.withdrawalRequest.create({
        data: {
          amount: parseFloat(amount),
          status: 'PENDING',
          authorId: payload.userId
        }
      });

      await prisma.transaction.create({
        data: {
          description: `Withdrawal Request: ₹${amount}`,
          amount: parseFloat(amount),
          status: 'PENDING',
          type: 'ROYALTY',
          authorId: payload.userId
        }
      });

      return NextResponse.json({ success: true, withdrawal });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update/request earnings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
