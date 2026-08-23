const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'testauthor@maybeify.com';
  const password = 'testpassword123';
  
  console.log(`Checking if user ${email} exists...`);
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`Creating test author user...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = 'TESTREF26';
    user = await prisma.user.create({
      data: {
        email,
        name: 'Jane Author',
        password: hashedPassword,
        role: 'AUTHOR',
        isActive: true,
        referralCode
      }
    });
    console.log('Test author created!');
  } else {
    console.log('Test author already exists. Updating to active role "AUTHOR"...');
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'AUTHOR', isActive: true }
    });
  }

  // Clear existing books, reports, royalties, and manuscripts to avoid duplicate key issues
  console.log('Cleaning up existing books, reports, and data for the author...');
  await prisma.salesPlatformReport.deleteMany({
    where: {
      book: {
        authorId: user.id
      }
    }
  });
  await prisma.bookSale.deleteMany({
    where: {
      book: {
        authorId: user.id
      }
    }
  });
  await prisma.book.deleteMany({ where: { authorId: user.id } });
  await prisma.royalty.deleteMany({ where: { authorId: user.id } });
  await prisma.manuscript.deleteMany({ where: { authorId: user.id } });
  
  // Seed a manuscript
  console.log('Seeding manuscript...');
  await prisma.manuscript.create({
    data: {
      title: 'The Future of AI and Books',
      content: 'This book explores how artificial intelligence shapes creative writing.',
      status: 'ACCEPTED',
      progress: 100,
      packageName: 'Premium',
      authorId: user.id
    }
  });

  // Seed books
  console.log('Seeding books...');
  const book1 = await prisma.book.create({
    data: {
      title: 'The Mystery of Maybeify',
      price: 15.99,
      authorId: user.id,
    }
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'A Guide to Agentic Coding',
      price: 24.50,
      authorId: user.id,
    }
  });

  // Seed platform-specific sales reports with screenshot proofs
  console.log('Seeding platform-specific sales reports...');
  
  // July 2026 reports
  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'AMAZON',
      month: 'July 2026',
      year: 2026,
      unitsSold: 45,
      revenue: 45 * book1.price,
      screenshot: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
    }
  });

  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'KINDLE',
      month: 'July 2026',
      year: 2026,
      unitsSold: 120,
      revenue: 120 * (book1.price * 0.7), // eBook discount
      screenshot: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
    }
  });

  await prisma.salesPlatformReport.create({
    data: {
      bookId: book2.id,
      platform: 'PLAYBOOKS',
      month: 'July 2026',
      year: 2026,
      unitsSold: 32,
      revenue: 32 * book2.price,
      screenshot: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
    }
  });

  // August 2026 reports
  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'AMAZON',
      month: 'August 2026',
      year: 2026,
      unitsSold: 60,
      revenue: 60 * book1.price,
      screenshot: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
    }
  });

  await prisma.salesPlatformReport.create({
    data: {
      bookId: book2.id,
      platform: 'KINDLE',
      month: 'August 2026',
      year: 2026,
      unitsSold: 145,
      revenue: 145 * (book2.price * 0.7), // eBook discount
      screenshot: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
    }
  });

  await prisma.salesPlatformReport.create({
    data: {
      bookId: book2.id,
      platform: 'PLAYBOOKS',
      month: 'August 2026',
      year: 2026,
      unitsSold: 50,
      revenue: 50 * book2.price,
      screenshot: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
    }
  });

  // Seed royalties
  console.log('Seeding royalties...');
  await prisma.royalty.create({
    data: {
      amount: 145.50,
      month: 'July 2026',
      status: 'PAID',
      authorId: user.id
    }
  });

  await prisma.royalty.create({
    data: {
      amount: 220.00,
      month: 'August 2026',
      status: 'PENDING',
      authorId: user.id
    }
  });

  // Clean and seed messages
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    }
  });

  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log('Creating dummy admin user for messaging...');
    const hashedAdminPass = await bcrypt.hash('adminpass123', 10);
    admin = await prisma.user.create({
      data: {
        email: 'admin@maybeify.com',
        name: 'Maybeify Admin',
        password: hashedAdminPass,
        role: 'ADMIN',
        isActive: true,
        referralCode: 'ADMINREF'
      }
    });
  }

  console.log('Seeding message...');
  await prisma.message.create({
    data: {
      content: 'Hello Jane, your Amazon, Kindle KDP, and Google Playbooks sales reports for July and August 2026 have been uploaded successfully. You can now view them and check screenshots on your Book Sales tab.',
      senderId: admin.id,
      receiverId: user.id
    }
  });

  console.log('Seed completed successfully!');
  console.log('\n--- Test Credentials ---');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch(e => {
    console.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
