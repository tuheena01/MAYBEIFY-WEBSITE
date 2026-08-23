import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const payload = await verifyAuth();
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Create a new Book
    if (action === 'create_book') {
      const { authorId, title, price, cover, synopsis } = body;
      if (!authorId || !title || !price) {
        return NextResponse.json({ error: 'Missing book fields' }, { status: 400 });
      }

      const book = await prisma.book.create({
        data: {
          title,
          price: parseFloat(price),
          authorId,
          cover: cover || undefined,
          synopsis: synopsis || '',
          status: 'PUBLISHED'
        }
      });
      return NextResponse.json({ success: true, book });
    }

    // 2. Add individual sales report row
    if (action === 'add_report') {
      const { bookId, platform, month, year, mrp, printingCost, shippingCost, royaltyPerUnit, unitsSold, revenue, screenshot } = body;
      if (!bookId || !platform || !month || !year) {
        return NextResponse.json({ error: 'Missing report fields' }, { status: 400 });
      }

      // Check if report already exists for this book/platform/month/year
      let report = await prisma.salesPlatformReport.findFirst({
        where: {
          bookId,
          platform: platform.toUpperCase(),
          month,
          year: parseInt(year)
        }
      });

      const parsedMRP = parseFloat(mrp) || 0.0;
      const parsedPrinting = parseFloat(printingCost) || 0.0;
      const parsedShipping = parseFloat(shippingCost) || 0.0;
      const parsedRoyaltyPerUnit = parseFloat(royaltyPerUnit) || 0.0;
      const parsedUnits = parseInt(unitsSold) || 0;
      const computedRevenue = parsedUnits * parsedRoyaltyPerUnit;

      if (report) {
        report = await prisma.salesPlatformReport.update({
          where: { id: report.id },
          data: {
            mrp: parsedMRP,
            printingCost: parsedPrinting,
            shippingCost: parsedShipping,
            royaltyPerUnit: parsedRoyaltyPerUnit,
            unitsSold: parsedUnits,
            revenue: computedRevenue || parseFloat(revenue) || 0.0,
            screenshot: screenshot || undefined
          }
        });
      } else {
        report = await prisma.salesPlatformReport.create({
          data: {
            bookId,
            platform: platform.toUpperCase(),
            month,
            year: parseInt(year),
            mrp: parsedMRP,
            printingCost: parsedPrinting,
            shippingCost: parsedShipping,
            royaltyPerUnit: parsedRoyaltyPerUnit,
            unitsSold: parsedUnits,
            revenue: computedRevenue || parseFloat(revenue) || 0.0,
            screenshot: screenshot || null
          }
        });
      }

      // Also create a transaction record for royalty log
      const bookObj = await prisma.book.findUnique({ where: { id: bookId } });
      const royaltyAmount = computedRevenue || parseFloat(revenue) || 0.0;
      
      await prisma.royalty.create({
        data: {
          amount: royaltyAmount,
          month: `${month} ${year}`,
          status: 'PENDING',
          authorId: bookObj.authorId
        }
      });

      await prisma.transaction.create({
        data: {
          description: `Royalty Accrued: "${bookObj.title}" [${platform.toUpperCase()}]`,
          amount: royaltyAmount,
          status: 'PENDING',
          type: 'ROYALTY',
          authorId: bookObj.authorId
        }
      });

      return NextResponse.json({ success: true, report });
    }

    // 3. Simulated Excel Sheet Import (Bulk Reports)
    if (action === 'bulk_import') {
      const { bookId, reportsList } = body;
      if (!bookId || !Array.isArray(reportsList)) {
        return NextResponse.json({ error: 'Invalid bulk data' }, { status: 400 });
      }

      const bookObj = await prisma.book.findUnique({ where: { id: bookId } });
      if (!bookObj) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      const results = [];
      let totalImportedRoyalty = 0;

      for (const rep of reportsList) {
        const platformStr = rep.platform.toUpperCase();
        const yearInt = parseInt(rep.year);
        const mrpVal = parseFloat(rep.mrp) || 0.0;
        const printVal = parseFloat(rep.printingCost) || 0.0;
        const shipVal = parseFloat(rep.shippingCost) || 0.0;
        const royUnitVal = parseFloat(rep.royaltyPerUnit) || 0.0;
        const unitsInt = parseInt(rep.unitsSold) || 0;
        const computedRev = unitsInt * royUnitVal;

        let report = await prisma.salesPlatformReport.findFirst({
          where: {
            bookId,
            platform: platformStr,
            month: rep.month,
            year: yearInt
          }
        });

        if (report) {
          report = await prisma.salesPlatformReport.update({
            where: { id: report.id },
            data: {
              mrp: mrpVal,
              printingCost: printVal,
              shippingCost: shipVal,
              royaltyPerUnit: royUnitVal,
              unitsSold: unitsInt,
              revenue: computedRev || parseFloat(rep.revenue) || 0.0,
              screenshot: rep.screenshot || undefined
            }
          });
        } else {
          report = await prisma.salesPlatformReport.create({
            data: {
              bookId,
              platform: platformStr,
              month: rep.month,
              year: yearInt,
              mrp: mrpVal,
              printingCost: printVal,
              shippingCost: shipVal,
              royaltyPerUnit: royUnitVal,
              unitsSold: unitsInt,
              revenue: computedRev || parseFloat(rep.revenue) || 0.0,
              screenshot: rep.screenshot || null
            }
          });
        }
        results.push(report);
        totalImportedRoyalty += (computedRev || parseFloat(rep.revenue) || 0.0);
      }

      // Add a single consolidated transaction for this bulk Excel sheet upload
      await prisma.royalty.create({
        data: {
          amount: totalImportedRoyalty,
          month: reportsList[0]?.month || 'Consolidated',
          status: 'PENDING',
          authorId: bookObj.authorId
        }
      });

      await prisma.transaction.create({
        data: {
          description: `Consolidated Royalty (Excel Import) for "${bookObj.title}"`,
          amount: totalImportedRoyalty,
          status: 'PENDING',
          type: 'ROYALTY',
          authorId: bookObj.authorId
        }
      });

      return NextResponse.json({ success: true, count: results.length, reports: results });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin sales operation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
