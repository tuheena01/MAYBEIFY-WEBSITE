'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowRight, Lock, MapPin } from 'lucide-react';
import styles from './checkout.module.css';
import Link from 'next/link';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <main className={styles.checkoutContainer}>
      <div className={styles.progressHeader}>
        <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
          <MapPin size={18} /> <span>Shipping</span>
        </div>
        <div className={styles.line} />
        <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
          <CreditCard size={18} /> <span>Payment</span>
        </div>
        <div className={styles.line} />
        <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>
          <CheckCircle2 size={18} /> <span>Confirmation</span>
        </div>
      </div>

      <div className={styles.checkoutGrid}>
        <div className={styles.formArea}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={styles.stepContent}
              >
                <h2>Shipping <em>Destination</em></h2>
                <p>Provide the coordinates for your archival artifact.</p>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Full Legal Name</label>
                    <input type="text" name="fullName" placeholder="Elena Vance" value={formData.fullName} onChange={handleInputChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="elena@legacy.com" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Delivery Address</label>
                    <input type="text" name="address" placeholder="123 Archive Way, Elite District" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input type="text" name="city" placeholder="Bhubaneswar" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>ZIP / Postal Code</label>
                    <input type="text" name="zip" placeholder="751001" value={formData.zip} onChange={handleInputChange} />
                  </div>
                </div>
                <button className={styles.actionBtn} onClick={nextStep}>
                  Proceed to Payment <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={styles.stepContent}
              >
                <h2>Payment <em>Method</em></h2>
                <p>Secure your legacy with our encrypted gateway.</p>
                <div className={styles.cardPreview}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardChip} />
                    <p className={styles.cardNumber}>{formData.cardNumber || '•••• •••• •••• ••••'}</p>
                    <div className={styles.cardBottom}>
                      <span>{formData.fullName || 'HOLDER NAME'}</span>
                      <span>{formData.expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Card Number</label>
                    <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleInputChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Expiry Date</label>
                    <input type="text" name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>CVV</label>
                    <input type="text" name="cvv" placeholder="000" value={formData.cvv} onChange={handleInputChange} />
                  </div>
                </div>
                <div className={styles.btnRow}>
                  <button className={styles.ghostBtn} onClick={prevStep}>Back</button>
                  <button className={styles.actionBtn} onClick={nextStep}>
                    Complete Acquisition <Lock size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successStep}
              >
                <div className={styles.successIcon}>
                  <CheckCircle2 size={60} />
                </div>
                <h2>Acquisition <em>Successful</em></h2>
                <p>Your archival artifact is being prepared for dispatch. A confirmation has been sent to <strong>{formData.email}</strong>.</p>
                <div className={styles.summaryBox}>
                  <p>Order ID: <strong>#MBFY-{Math.floor(Math.random() * 100000)}</strong></p>
                  <p>Status: <strong>Archiving & Dispatched</strong></p>
                </div>
                <Link href="/shop" className={styles.actionBtn}>
                  Return to Boutique
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.summaryArea}>
          <div className={styles.summaryCard}>
            <h3>Order Summary</h3>
            <div className={styles.itemList}>
              <div className={styles.item}>
                <div className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>Limited Edition Artifact</p>
                  <p className={styles.itemDesc}>Archive Collection</p>
                </div>
                <p className={styles.itemPrice}>₹1,299.00</p>
              </div>
            </div>
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹1,299.00</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span className={styles.free}>Complimentary</span>
              </div>
              <div className={styles.totalRow}>
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>₹1,299.00</span>
              </div>
            </div>
            <div className={styles.secureBadge}>
              <ShieldCheck size={16} /> <span>256-bit Archival Security</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
