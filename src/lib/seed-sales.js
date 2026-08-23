const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'testauthor@maybeify.com';
  const password = 'testpassword123';
  const punitEmail = 'punit@maybeify.com';
  const punitPassword = 'punitpass123';

  // Seed Admin user
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log('Creating admin user...');
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

  // 1. Create or update test author (Jane Author)
  console.log(`Checking if user ${email} exists...`);
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        name: 'Jane Author',
        password: hashedPassword,
        role: 'AUTHOR',
        isActive: true,
        referralCode: 'TESTREF26',
        phone: '+919999988888',
        bio: 'Award-winning romance novelist exploring complex characters.',
        completionPercent: 85,
        status: 'PUBLISHED',
        upiId: 'jane@okaxis',
        bankAccount: 'Account: 9988776655 IFSC: HDFC0000123',
        panGst: 'ABCDE9876F'
      }
    });
  }

  // 2. Create or update Punit Chhatwal
  console.log(`Checking if user ${punitEmail} exists...`);
  let punit = await prisma.user.findUnique({ where: { email: punitEmail } });
  
  const hashedPunitPass = await bcrypt.hash(punitPassword, 10);
  if (!punit) {
    punit = await prisma.user.create({
      data: {
        email: punitEmail,
        name: 'Punit Chhatwal',
        password: hashedPunitPass,
        role: 'AUTHOR',
        isActive: true,
        referralCode: 'PUNIT26',
        phone: '+919876543210',
        bio: 'Bestselling novelist and storyteller specializing in romantic fiction and motivational stories.',
        completionPercent: 90,
        status: 'PUBLISHED',
        upiId: 'punit@okhdfcbank',
        bankAccount: 'Account: 1029384756 IFSC: SBIN000123',
        panGst: 'PUNIT1234K'
      }
    });
  } else {
    punit = await prisma.user.update({
      where: { id: punit.id },
      data: {
        role: 'AUTHOR',
        isActive: true,
        phone: '+919876543210',
        bio: 'Bestselling novelist and storyteller specializing in romantic fiction and motivational stories.',
        completionPercent: 90,
        status: 'PUBLISHED',
        upiId: 'punit@okhdfcbank',
        bankAccount: 'Account: 1029384756 IFSC: SBIN000123',
        panGst: 'PUNIT1234K'
      }
    });
  }

  // Clean and recreate data for Punit
  console.log('Cleaning up existing books, reports, transactions for Punit Chhatwal...');
  await prisma.salesPlatformReport.deleteMany({ where: { book: { authorId: punit.id } } });
  await prisma.bookSale.deleteMany({ where: { book: { authorId: punit.id } } });
  await prisma.withdrawalRequest.deleteMany({ where: { authorId: punit.id } });
  await prisma.transaction.deleteMany({ where: { authorId: punit.id } });
  await prisma.royalty.deleteMany({ where: { authorId: punit.id } });
  await prisma.book.deleteMany({ where: { authorId: punit.id } });
  await prisma.manuscript.deleteMany({ where: { authorId: punit.id } });

  // Seed Punit's books
  console.log('Seeding Punit\'s books...');
  const book1 = await prisma.book.create({
    data: {
      title: 'Lovestory of Siya and Tim',
      price: 12.99,
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      synopsis: 'A heartfelt romantic saga capturing the journey of two distinct souls finding connection in a chaotic world.',
      status: 'PUBLISHED',
      views: 1200,
      downloads: 85,
      reads: 210,
      rating: 4.8,
      authorId: punit.id
    }
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'Beyond Blessed',
      price: 18.50,
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      synopsis: 'An inspirational chronicle of resilience, grace, and finding positive landmarks along lifes journey.',
      status: 'PUBLISHED',
      views: 850,
      downloads: 40,
      reads: 95,
      rating: 4.9,
      authorId: punit.id
    }
  });

  // Seed Punit's sales reports
  console.log('Seeding sales platform reports...');
  // July 2026 Reports
  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'AMAZON',
      month: 'July 2026',
      year: 2026,
      mrp: 299.00,
      printingCost: 85.00,
      shippingCost: 40.00,
      royaltyPerUnit: 60.00,
      unitsSold: 30,
      revenue: 30 * 60.00,
      screenshot: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
    }
  });
  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'KINDLE',
      month: 'July 2026',
      year: 2026,
      mrp: 149.00,
      printingCost: 0.0,
      shippingCost: 0.0,
      royaltyPerUnit: 45.00,
      unitsSold: 85,
      revenue: 85 * 45.00,
      screenshot: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
    }
  });

  // August 2026 Reports
  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'AMAZON',
      month: 'August 2026',
      year: 2026,
      mrp: 299.00,
      printingCost: 85.00,
      shippingCost: 40.00,
      royaltyPerUnit: 60.00,
      unitsSold: 52,
      revenue: 52 * 60.00,
      screenshot: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
    }
  });
  await prisma.salesPlatformReport.create({
    data: {
      bookId: book1.id,
      platform: 'KINDLE',
      month: 'August 2026',
      year: 2026,
      mrp: 149.00,
      printingCost: 0.0,
      shippingCost: 0.0,
      royaltyPerUnit: 45.00,
      unitsSold: 110,
      revenue: 110 * 45.00,
      screenshot: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
    }
  });
   // Book 2 - Beyond Blessed July reports
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'AMAZON',
       month: 'June-July',
       year: 2026,
       mrp: 300.00,
       printingCost: 208.00,
       shippingCost: 33.00,
       royaltyPerUnit: 59.00,
       unitsSold: 12,
       revenue: 12 * 59.00,
       screenshot: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
     }
   });
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'MAYBEIFY',
       month: 'June-July',
       year: 2026,
       mrp: 300.00,
       printingCost: 208.00,
       shippingCost: 33.00,
       royaltyPerUnit: 59.00,
       unitsSold: 2,
       revenue: 2 * 59.00,
       screenshot: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=800'
     }
   });
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'KINDLE',
       month: 'June-July',
       year: 2026,
       mrp: 149.00,
       printingCost: 0.00,
       shippingCost: 0.00,
       royaltyPerUnit: 45.00,
       unitsSold: 28,
       revenue: 28 * 45.00,
       screenshot: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
     }
   });
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'PLAYBOOKS',
       month: 'June-July',
       year: 2026,
       mrp: 199.00,
       printingCost: 0.00,
       shippingCost: 0.00,
       royaltyPerUnit: 55.00,
       unitsSold: 15,
       revenue: 15 * 55.00,
       screenshot: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
     }
   });

   // Book 2 - Beyond Blessed August reports
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'AMAZON',
       month: 'July-August',
       year: 2026,
       mrp: 330.00,
       printingCost: 208.00,
       shippingCost: 33.00,
       royaltyPerUnit: 89.00,
       unitsSold: 2,
       revenue: 2 * 89.00,
       screenshot: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
     }
   });
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'MAYBEIFY',
       month: 'July-August',
       year: 2026,
       mrp: 330.00,
       printingCost: 208.00,
       shippingCost: 33.00,
       royaltyPerUnit: 89.00,
       unitsSold: 6,
       revenue: 6 * 89.00,
       screenshot: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=800'
     }
   });
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'KINDLE',
       month: 'July-August',
       year: 2026,
       mrp: 149.00,
       printingCost: 0.00,
       shippingCost: 0.00,
       royaltyPerUnit: 45.00,
       unitsSold: 35,
       revenue: 35 * 45.00,
       screenshot: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
     }
   });
   await prisma.salesPlatformReport.create({
     data: {
       bookId: book2.id,
       platform: 'PLAYBOOKS',
       month: 'July-August',
       year: 2026,
       mrp: 199.00,
       printingCost: 0.00,
       shippingCost: 0.00,
       royaltyPerUnit: 55.00,
       unitsSold: 22,
       revenue: 22 * 55.00,
       screenshot: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
     }
   });

  // Seed Punit's Royalties
  console.log('Seeding royalties...');
  await prisma.royalty.create({
    data: {
      amount: 850.00,
      month: 'July 2026',
      status: 'PAID',
      authorId: punit.id
    }
  });
  await prisma.royalty.create({
    data: {
      amount: 450.00,
      month: 'August 2026',
      status: 'PENDING',
      authorId: punit.id
    }
  });

  // Seed Punit's Transactions Ledger
  console.log('Seeding transactions...');
  await prisma.transaction.create({
    data: {
      description: 'Book Royalty: Lovestory of Siya and Tim',
      amount: 850.00,
      status: 'PAID',
      type: 'ROYALTY',
      authorId: punit.id,
      createdAt: new Date('2026-08-20T10:00:00Z')
    }
  });

  await prisma.transaction.create({
    data: {
      description: 'Book Sale Referral payout',
      amount: 300.00,
      status: 'PENDING',
      type: 'REFERRAL',
      authorId: punit.id,
      createdAt: new Date('2026-08-15T14:30:00Z')
    }
  });

  await prisma.transaction.create({
    data: {
      description: 'Platform Book Sale: Beyond Blessed',
      amount: 450.00,
      status: 'PAID',
      type: 'SALE',
      authorId: punit.id,
      createdAt: new Date('2026-08-10T16:00:00Z')
    }
  });

  // Seed a pending withdrawal request
  console.log('Seeding pending withdrawal request...');
  await prisma.withdrawalRequest.create({
    data: {
      amount: 500.00,
      status: 'PENDING',
      authorId: punit.id,
      createdAt: new Date('2026-08-21T11:00:00Z')
    }
  });

  // Add the corresponding transaction log
  await prisma.transaction.create({
    data: {
      description: 'Withdrawal Request: ₹500.00',
      amount: 500.00,
      status: 'PENDING',
      type: 'ROYALTY',
      authorId: punit.id,
      createdAt: new Date('2026-08-21T11:00:00Z')
    }
  });

  // Seed Manuscript
  await prisma.manuscript.create({
    data: {
      title: 'Beyond Blessed Final Proof',
      content: 'Approved layout proofs for Beyond Blessed.',
      status: 'ACCEPTED',
      progress: 100,
      packageName: 'Comprehensive Package',
      authorId: punit.id
    }
  });

  // Seed welcome message from Admin
  await prisma.message.create({
    data: {
      content: `Welcome to Maybeify, Punit! Your professional Author Portal is fully configured. You can now track monthly/yearly Amazon & Playbooks sales, request payments, and view detailed charts.`,
      senderId: admin.id,
      receiverId: punit.id
    }
  });

  console.log('\n--- Seeding Completed successfully ---');
  console.log(`Test Author Account: ${punitEmail} / ${punitPassword}`);
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
