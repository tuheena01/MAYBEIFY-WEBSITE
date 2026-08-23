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

    const authors = await prisma.user.findMany({
      where: { role: 'AUTHOR' },
      include: {
        books: {
          include: {
            platformReports: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, authors });
  } catch (error) {
    console.error('Fetch authors failed:', error);
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
    const { id, name, email, phone, bio, status, completionPercent, awards, publications } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing author ID' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        bio,
        status,
        completionPercent: completionPercent !== undefined ? parseInt(completionPercent) : undefined,
        awards,
        publications
      }
    });

    return NextResponse.json({ success: true, author: updatedUser });
  } catch (error) {
    console.error('Update author profile failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
