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
    const { name, email, title, genre, synopsis, discount } = data;

    // 1. Check required fields
    if (!name || !email || !title || !genre || !synopsis) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 2. Sanitize inputs
    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanTitle = sanitize(title);
    const cleanGenre = sanitize(genre);
    const cleanSynopsis = sanitize(synopsis);
    const cleanDiscount = discount ? sanitize(discount) : null;

    // 3. Length validations
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      cleanTitle.length > 200 ||
      cleanGenre.length > 100 ||
      cleanSynopsis.length > 5000 ||
      (cleanDiscount && cleanDiscount.length > 50)
    ) {
      return NextResponse.json({ error: 'Input length exceeds maximum allowed limit' }, { status: 400 });
    }

    // 4. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // 5. Database Insert
    const application = await prisma.application.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        title: cleanTitle,
        genre: cleanGenre,
        synopsis: cleanSynopsis,
        discount: cleanDiscount,
      },
    });

    return NextResponse.json({ message: 'Application submitted successfully', id: application.id });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
