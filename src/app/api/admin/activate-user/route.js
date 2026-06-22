import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
  }
}
