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

    // Fetch royalties
    const royalties = await prisma.royalty.findMany({
      where: { authorId: payload.userId }
    });

    // Calculate cards
    const totalEarnings = royalties.reduce((sum, r) => sum + r.amount, 0) + 
      transactions.filter(t => t.status === 'PAID' && t.type !== 'ROYALTY').reduce((sum, t) => sum + t.amount, 0);

    const pendingEarnings = royalties.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0) +
      transactions.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0);

    const paidAmount = royalties.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0) +
      transactions.filter(t => t.status === 'PAID' && t.type !== 'ROYALTY').reduce((sum, t) => sum + t.amount, 0);

    const currentMonthLabel = 'August 2026';
    const thisMonthEarnings = royalties.filter(r => r.month === currentMonthLabel).reduce((sum, r) => sum + r.amount, 0);

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
