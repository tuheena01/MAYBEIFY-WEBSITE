'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ChallengePage() {
  const router = useRouter();
  const [step, setStep] = useState('register'); // 'register' | 'checkout' | 'processing'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [error, setError] = useState('');

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setStep('checkout');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setStep('processing');

    try {
      const { initializePayment } = await import('@/lib/razorpay');
      
      await initializePayment({
        amount: 1699,
        name: formData.name,
        email: formData.email,
        description: '21-Day Manuscript Challenge Enrollment',
        onSuccess: async (response) => {
          // Now enroll the user in the database
          const res = await fetch('/api/challenge/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id
            }),
          });
          
          const data = await res.json();
          if (data.success) {
            sessionStorage.setItem('challengeEnrollmentId', data.enrollment.id);
            sessionStorage.setItem('challengeStartDate', data.enrollment.startDate);
            sessionStorage.setItem('challengeUserName', data.user.name);
            router.push('/challenge/dashboard');
          } else {
            setError(data.error || 'Enrollment failed.');
            setStep('checkout');
          }
        },
        onError: (msg) => {
          setError(msg || 'Payment failed.');
          setStep('checkout');
        }
      });
    } catch (err) {
      console.error(err);
      setError('Could not initialize payment gateway.');
      setStep('checkout');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.bgGlow}></div>
      </div>

      <div className={styles.container}>
        {/* LEFT PANEL: Info */}
        <div className={styles.infoPanel}>
          <span className={styles.label}>MAYBEIFY PRESENTS</span>
          <h1 className="serif">The 21-Day<br />Manuscript<br />Challenge</h1>
          <p>Join an elite cohort of writers who will write, refine, and publish their manuscript in just 21 days — one chapter at a time, guided by our acquisitions board.</p>

          <div className={styles.included}>
            <p className={styles.includedTitle}>What&apos;s Included</p>
            {[
              ['21 curated daily prompts', 'Crafted by our editorial board to unlock your narrative potential.'],
              ['Private Writing Vault', 'Your words, secured and beautifully displayed in your personal dashboard.'],
              ['Progress Map', 'A glowing 21-node journey tracker updated as you complete each day.'],
              ['Manuscript Compilation', 'All 21 entries merged into a formatted manuscript after Day 21.'],
              ['Publication Pathway', 'Exceptional manuscripts are flagged for acquisition by Maybeify.'],
              ['Certificate of Mastery', 'A digital certificate of completion for finishing the challenge.'],
            ].map(([title, desc]) => (
              <div key={title} className={styles.includedItem}>
                <div className={styles.checkIcon}>✦</div>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.priceTag}>₹1,699</span>
            <span className={styles.priceTagNote}>One-time, lifetime access</span>
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className={styles.formPanel}>
          {step === 'register' && (
            <div className={styles.card}>
              <h2 className="serif">Create Your Account</h2>
              <p>Step 1 of 2 — Author Registration</p>
              {error && <p className={styles.error}>{error}</p>}
              <form className={styles.form} onSubmit={handleRegisterSubmit}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input type="text" placeholder="Arjun Sharma" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <input type="email" placeholder="arjun@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Password</label>
                  <input type="password" placeholder="Create a secure password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Continue to Payment →
                </button>
              </form>
            </div>
          )}

          {step === 'checkout' && (
            <div className={styles.card}>
              <h2 className="serif">Secure Checkout</h2>
              <p>Step 2 of 2 — Payment Details</p>
              <div className={styles.orderSummary}>
                <div className={styles.orderRow}>
                  <span>The 21-Day Manuscript Challenge</span>
                  <span>₹1,699</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Taxes</span>
                  <span>₹0</span>
                </div>
                <div className={`${styles.orderRow} ${styles.orderTotal}`}>
                  <span>Total</span>
                  <span>₹1,699</span>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <form className={styles.form} onSubmit={handlePayment}>
                <div className={styles.field}>
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="As on card" value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })} required />
                </div>
                <div className={styles.field}>
                  <label>Card Number</label>
                  <input type="text" placeholder="4242 4242 4242 4242" maxLength={19} value={cardData.number}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setCardData({ ...cardData, number: formatted });
                    }} required />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label>Expiry</label>
                    <input type="text" placeholder="MM / YY" maxLength={7} value={cardData.expiry}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (val.length > 2) val = val.slice(0, 2) + ' / ' + val.slice(2);
                        setCardData({ ...cardData, expiry: val });
                      }} required />
                  </div>
                  <div className={styles.field}>
                    <label>CVV</label>
                    <input type="password" placeholder="•••" maxLength={4} value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })} required />
                  </div>
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Pay ₹1,699 & Unlock Challenge
                </button>
                <button type="button" className={styles.backBtn} onClick={() => setStep('register')}>← Back</button>
              </form>
            </div>
          )}

          {step === 'processing' && (
            <div className={styles.card} style={{ textAlign: 'center', padding: '5rem 3rem' }}>
              <div className={styles.spinner}></div>
              <h2 className="serif" style={{ marginTop: '2rem' }}>Processing...</h2>
              <p>Verifying your payment and unlocking the vault.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
