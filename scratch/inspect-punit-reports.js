const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const punit = await prisma.user.findFirst({
    where: { email: 'punit@maybeify.com' }
  });

  const books = await prisma.book.findMany({
    where: { authorId: punit.id },
    include: { platformReports: true }
  });

  console.log(`Punit has ${books.length} books.`);
  let overallRevenue = 0;
  let overallUnits = 0;

  for (const b of books) {
    let bookRevenue = 0;
    let bookUnits = 0;
    console.log(`\nBook: "${b.title}" (ID: ${b.id})`);
    for (const r of b.platformReports) {
      console.log(`  - Month: ${r.month} | Platform: ${r.platform} | Units: ${r.unitsSold} | Royalty/Unit: ${r.royaltyPerUnit} | Revenue: ${r.revenue}`);
      bookRevenue += r.revenue;
      bookUnits += r.unitsSold;
    }
    console.log(`  Book Total Units: ${bookUnits} | Book Total Revenue: ${bookRevenue}`);
    overallRevenue += bookRevenue;
    overallUnits += bookUnits;
  }

  console.log(`\nOverall Units: ${overallUnits} | Overall Revenue: ${overallRevenue}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
