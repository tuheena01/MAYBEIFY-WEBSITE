import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to sanitize strings from HTML tags
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, whatsapp, instagram, reason } = data;

    // 1. Check required fields
    if (!name || !email || !whatsapp || !reason) {
      return NextResponse.json({ error: 'Name, email, whatsapp, and reason are required' }, { status: 400 });
    }

    // 2. Sanitize and default inputs
    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanWhatsapp = sanitize(whatsapp);
    const cleanInsta = instagram ? sanitize(instagram) : null;
    const cleanReason = sanitize(reason);

    // Default fields not requested in the new form (preserving database compatibility)
    const cleanTitle = "N/A";
    const cleanGenre = "N/A";
    const cleanYear = "N/A";
    const cleanPhone = "N/A";
    const cleanSynopsis = "N/A";

    // 3. Length validations
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      (cleanInsta && cleanInsta.length > 100) ||
      cleanWhatsapp.length > 50 ||
      cleanReason.length > 5000
    ) {
      return NextResponse.json({ error: 'Input length exceeds maximum allowed limit' }, { status: 400 });
    }

    // 4. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // 5. Database Insert
    const nomination = await prisma.nomination.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        title: cleanTitle,
        genre: cleanGenre,
        yearOfPublishing: cleanYear,
        instagram: cleanInsta,
        whatsapp: cleanWhatsapp,
        phone: cleanPhone,
        reason: cleanReason,
        synopsis: cleanSynopsis,
      },
    });

    return NextResponse.json({ message: 'Nomination submitted successfully', id: nomination.id });
  } catch (error) {
    console.error('Nomination error:', error);
    return NextResponse.json({ error: 'Failed to submit nomination' }, { status: 500 });
  }
}
