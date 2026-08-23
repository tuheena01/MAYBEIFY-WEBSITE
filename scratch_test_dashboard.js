const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'punit@maybeify.com' }
  });

  if (!user) {
    console.error('Punit not found in DB!');
    return;
  }

  console.log('User found:', user.name);

  // 1. Total manuscripts count
  const manuscriptsCount = await prisma.manuscript.count({
    where: { authorId: user.id }
  });
  console.log('Manuscripts count:', manuscriptsCount);

  // 2. Message count
  const messageCount = await prisma.message.count({
    where: {
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    }
  });
  console.log('Messages count:', messageCount);

  // 3. Referrals count
  const referralsCount = await prisma.user.count({
    where: { referredBy: user.referralCode }
  });
  console.log('Referrals count:', referralsCount);

  // 4. Books stats
  const books = await prisma.book.findMany({
    where: { authorId: user.id },
    include: {
      platformReports: true
    }
  });
  console.log('Books count:', books.length);

  let totalUnitsSold = 0;
  let totalSalesRevenue = 0;
  books.forEach(b => {
    totalUnitsSold += b.platformReports.reduce((sum, s) => sum + s.unitsSold, 0);
    totalSalesRevenue += b.platformReports.reduce((sum, s) => sum + s.revenue, 0);
  });
  console.log('Units sold:', totalUnitsSold, 'Revenue:', totalSalesRevenue);

  // 5. Royalties total earnings
  const royalties = await prisma.royalty.findMany({
    where: { authorId: user.id }
  });
  const transactions = await prisma.transaction.findMany({
    where: { authorId: user.id }
  });
  
  const totalEarnings = royalties.reduce((sum, r) => sum + r.amount, 0) +
    transactions.filter(t => t.status === 'PAID' && t.type !== 'ROYALTY').reduce((sum, t) => sum + t.amount, 0);
  console.log('Total earnings:', totalEarnings);

  // 6. Recent Activity
  const activities = [];
  activities.push({
    date: new Date(user.createdAt).toLocaleDateString(),
    text: 'Welcome to Maybeify! Your profile has been initialized.',
    type: 'system'
  });

  const manuscripts = await prisma.manuscript.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  manuscripts.forEach(m => {
    activities.push({
      date: new Date(m.createdAt).toLocaleDateString(),
      text: `Manuscript "${m.title}" submitted. Status: ${m.status}.`,
      type: 'manuscript'
    });
  });

  const sales = [];
  books.forEach(b => {
    b.platformReports.forEach(s => {
      sales.push({
        date: s.month,
        text: `[${s.platform}] Sold ${s.unitsSold} unit(s) of "${b.title}" for $${s.revenue.toFixed(2)}.`,
        purchasedAt: s.createdAt,
        type: 'sale'
      });
    });
  });

  sales.forEach(s => activities.push(s));
  activities.sort((a, b) => {
    const dateA = a.purchasedAt ? new Date(a.purchasedAt) : new Date(0);
    const dateB = b.purchasedAt ? new Date(b.purchasedAt) : new Date(0);
    return dateB - dateA;
  });

  const finalActivities = activities.slice(0, 5);
  console.log('Activities count:', finalActivities.length);
  console.log('Dashboard logic executes perfectly for Punit!');
}

main()
  .catch(e => {
    console.error('Error running logic:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
