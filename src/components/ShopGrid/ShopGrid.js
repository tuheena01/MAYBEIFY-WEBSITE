'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import styles from '@/app/shop/shop.module.css';

export default function ShopGrid({ merchandise }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const handleImageError = (e, fallback) => {
    e.target.src = fallback;
    e.target.style.opacity = '0.7';
    e.target.style.filter = 'grayscale(0.5)';
  };

  const handlePurchase = (item) => {
    setActiveItem(item);
    setIsProcessing(true);
    
    // Simulate cinematic unboxing/preparation
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2500);
  };

  return (
    <div className={styles.merchContainer}>
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.unboxingCard}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <Loader2 className={styles.spinner} size={40} />
              <h2>Preparing your <em>Artifact</em></h2>
              <p>Ensuring the highest standard of archival quality for {activeItem?.title}...</p>
            </motion.div>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.successCard}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className={styles.successIcon}>
                <Sparkles size={40} />
              </div>
              <h2>Legacy Secured</h2>
              <p>{activeItem?.title} has been added to your collection.</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={() => setShowSuccess(false)} className={styles.ghostBtn}>
                  Continue Browsing
                </button>
                <Link href="/checkout" className={styles.boutiqueBtn}>
                  Finalize Acquisition
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {merchandise && merchandise.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Limited Merchandise</h2>
          <div className={styles.grid}>
            {merchandise.map((item) => (
              <div key={item.id} className={styles.merchCard}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={item.image.startsWith('http') ? `/api/image-proxy?url=${encodeURIComponent(item.image)}` : item.image} 
                    alt={item.title} 
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop')}
                  />
                </div>
                <div className={styles.merchInfo}>
                  <h3>{item.title}</h3>
                  <p className={styles.author}>{item.description}</p>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{item.price.toFixed(2)}</span>
                  <button 
                    className={styles.boutiqueBtn}
                    onClick={() => handlePurchase(item)}
                  >
                    Acquire Artifact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className={styles.emptyState}>
          <p>New limited drops coming soon. Stay tuned.</p>
        </div>
      )}
    </div>
  );
}
