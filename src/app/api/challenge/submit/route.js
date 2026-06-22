import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { enrollmentId, dayNumber, content } = await req.json();

    // Upsert the submission for the specific day
    // Wait, prisma doesn't have a unique constraint on enrollmentId+dayNumber yet.
    // We will just find existing or create.
    const existing = await prisma.challengeSubmission.findFirst({
      where: { enrollmentId, dayNumber }
    });

    let submission;
    if (existing) {
      submission = await prisma.challengeSubmission.update({
        where: { id: existing.id },
        data: { content, submittedAt: new Date() }
      });
    } else {
      submission = await prisma.challengeSubmission.create({
        data: { enrollmentId, dayNumber, content }
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit challenge day.' }, { status: 500 });
  }
}
