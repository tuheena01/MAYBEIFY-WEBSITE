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
    const { name, email, title, genre, yearOfPublishing, instagram, whatsapp, phone, reason, synopsis } = data;

    // 1. Check required fields
    if (!name || !email || !title || !genre || !yearOfPublishing || !whatsapp || !phone || !reason || !synopsis) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 2. Sanitize inputs
    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanTitle = sanitize(title);
    const cleanGenre = sanitize(genre);
    const cleanYear = sanitize(yearOfPublishing);
    const cleanInsta = instagram ? sanitize(instagram) : null;
    const cleanWhatsapp = sanitize(whatsapp);
    const cleanPhone = sanitize(phone);
    const cleanReason = sanitize(reason);
    const cleanSynopsis = sanitize(synopsis);

    // 3. Length validations
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      cleanTitle.length > 200 ||
      cleanGenre.length > 100 ||
      cleanYear.length > 50 ||
      (cleanInsta && cleanInsta.length > 100) ||
      cleanWhatsapp.length > 50 ||
      cleanPhone.length > 50 ||
      cleanReason.length > 5000 ||
      cleanSynopsis.length > 5000
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
