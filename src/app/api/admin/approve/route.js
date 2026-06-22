import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { appId } = await req.json();

    const app = await prisma.application.findUnique({
      where: { id: appId },
    });

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create the User
    const user = await prisma.user.create({
      data: {
        email: app.email,
        name: app.name,
        password: tempPassword, // Should be hashed with bcrypt in production
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        role: 'AUTHOR',
        isActive: true, // Admin-created accounts are active immediately
      },
    });

    // Update application status
    await prisma.application.update({
      where: { id: appId },
      data: { status: 'APPROVED' },
    });

    return NextResponse.json({ message: 'Author approved', password: tempPassword });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Failed to approve author' }, { status: 500 });
  }
}
