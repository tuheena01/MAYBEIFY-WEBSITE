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
        id: true,
        email: true,
        name: true,
        phone: true,
        photo: true,
        bio: true,
        authorSince: true,
        awards: true,
        publications: true,
        completionPercent: true,
        status: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error('Fetch profile error:', error);
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
    const { name, phone, bio, photo, awards, publications } = body;

    // Calculate dynamic completion percentage
    let completedFields = 0;
    const fields = [name, phone, bio, photo, awards, publications];
    fields.forEach(f => {
      if (f && f.toString().trim().length > 0) completedFields++;
    });
    const completionPercent = Math.min(100, Math.max(30, Math.round((completedFields / fields.length) * 100)));

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name,
        phone,
        bio,
        photo: photo || undefined,
        awards,
        publications,
        completionPercent
      }
    });

    return NextResponse.json({ success: true, profile: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
