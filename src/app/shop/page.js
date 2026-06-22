import { prisma } from '@/lib/prisma';
import styles from './shop.module.css';
import ShopGrid from '@/components/ShopGrid/ShopGrid';

export const dynamic = 'force-dynamic';

async function getMerchandise() {
  try {
    const merch = await prisma.merchandise.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return merch;
  } catch (error) {
    console.error('Failed to fetch merch:', error);
    return [];
  }
}

export default async function ShopPage() {
  const merchandise = await getMerchandise();

  const displayMerch = merchandise.length > 0 ? merchandise : [
    {
      id: 'merch-1',
      title: 'Limited Edition Notebook',
      description: 'Handcrafted leather notebook for the modern author.',
      price: 899.00,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'merch-2',
      title: 'Premium Writing Kit',
      description: 'Elegance in every stroke with our signature pen and ink set.',
      price: 1299.00,
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'merch-3',
      title: 'Author\'s Coffee Mug',
      description: 'Fuel your creativity with our matte-finish ceramic mug.',
      price: 499.00,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop'
    }
  ];

  return (
    <main className={styles.shopContainer}>
      <header className={styles.header}>
        <div className={styles.syncIndicator}>
          <span className={styles.pulse}></span>
          Limited Drop
        </div>
        <h1>The Boutique</h1>
        <p>Exclusive Maybeify merchandise for the literary elite. Hand-picked, limited editions designed for creators.</p>
      </header>

      <ShopGrid merchandise={displayMerch} />
    </main>
  );
}
