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

    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
            upiId: true,
            bankAccount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, withdrawals });
  } catch (error) {
    console.error('Fetch admin withdrawals failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const payload = await verifyAuth();
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body; // status can be 'APPROVED' or 'REJECTED'

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const request = await prisma.withdrawalRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updatedRequest = await prisma.withdrawalRequest.update({
      where: { id },
      data: { status }
    });

    // Update the transaction in history
    // We search for a transaction for the author with similar amount and PENDING status
    const transaction = await prisma.transaction.findFirst({
      where: {
        authorId: request.authorId,
        amount: request.amount,
        status: 'PENDING'
      }
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status === 'APPROVED' ? 'PAID' : 'REJECTED',
          description: status === 'APPROVED' 
            ? `Withdrawal Approved: ₹${request.amount.toFixed(2)}` 
            : `Withdrawal Declined: ₹${request.amount.toFixed(2)}`
        }
      });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Update withdrawal status failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
