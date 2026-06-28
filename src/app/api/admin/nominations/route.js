import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const nominations = await prisma.nomination.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(nominations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch nominations' }, { status: 500 });
  }
}
