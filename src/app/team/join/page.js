'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, BookOpen, Send, UserCheck, Briefcase, FileText } from 'lucide-react';
import styles from './join.module.css';
import Link from 'next/link';

export default function JoinTeamPage() {
  const [formState, setFormState] = useState('choice'); // 'choice', 'login', 'apply'
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="serif"
        >
          Curate the <em>Future.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Join the elite editorial force behind the Maybeify Archive.
        </motion.p>
      </header>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {formState === 'choice' && (
            <motion.div 
              key="choice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.choiceGrid}
            >
              <div className={styles.choiceCard} onClick={() => setFormState('login')}>
                <UserCheck size={40} className={styles.icon} />
                <h2>Already a Custodian?</h2>
                <p>Login to your management dashboard to handle your active projects.</p>
                <button className={styles.actionBtn}>Enter Portal</button>
              </div>

              <div className={styles.choiceCard} onClick={() => setFormState('apply')}>
                <Briefcase size={40} className={styles.icon} />
                <h2>Apply to Join</h2>
                <p>Submit your credentials to join our board of Project Heads and Compilers.</p>
                <button className={styles.actionBtn}>Apply Now</button>
              </div>
            </motion.div>
          )}

          {formState === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.loginCard}
            >
              <button className={styles.backBtn} onClick={() => setFormState('choice')}>← Back</button>
              <h2>Custodian <em>Login</em></h2>
              <div className={styles.loginButtons}>
                <Link href="/author/project-head" className={styles.roleBtn}>
                  <ShieldAlert size={24} />
                  <div>
                    <span>Login as</span>
                    <strong>Project Head</strong>
                  </div>
                </Link>
                <Link href="/author/compiler" className={styles.roleBtn}>
                  <BookOpen size={24} />
                  <div>
                    <span>Login as</span>
                    <strong>Compiler</strong>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          {formState === 'apply' && !isSubmitted && (
            <motion.div 
              key="apply"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.formCard}
            >
              <button className={styles.backBtn} onClick={() => setFormState('choice')}>← Back</button>
              <h2>Archival <em>Application</em></h2>
              <p>Your journey toward becoming a custodian of legacy starts here.</p>
              
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label>Full Legal Name</label>
                  <input type="text" placeholder="Julian Draxler" required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <input type="email" placeholder="julian@archive.com" required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Desired Role</label>
                  <select required>
                    <option value="">Select a role</option>
                    <option value="project_head">Project Head</option>
                    <option value="compiler">Compiler</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Relevant Experience (Brief)</label>
                  <textarea placeholder="Tell us about your background in literature or production..." required />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Submit Application <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}

          {isSubmitted && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.successCard}
            >
              <div className={styles.successIcon}>
                <FileText size={50} />
              </div>
              <h2>Application <em>Received</em></h2>
              <p>Our board will review your credentials meticulously. You will receive an invitation for an interview if your profile aligns with our standards.</p>
              <button onClick={() => setIsSubmitted(false)} className={styles.actionBtn}>Return</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
