import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password, name, paymentId, orderId } = await req.json();

    // 1. Create or Find User
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password, // Ideally hashed, but keeping simple for now
          name,
          referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        }
      });
    }

    // 2. Create the enrollment with payment proof
    const enrollment = await prisma.challengeEnrollment.create({
      data: {
        userId: user.id,
        paid: true, 
        paymentId, 
        orderId,
      }
    });

    return NextResponse.json({ success: true, user, enrollment });
  } catch (error) {
    console.error('Enroll error:', error);
    return NextResponse.json({ success: false, error: 'Failed to enroll in challenge.' }, { status: 500 });
  }
}
