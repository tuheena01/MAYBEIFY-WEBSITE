'use client';

import { useModal } from '@/context/ModalContext';
import { useState, useRef, useEffect } from 'react';
import { X, Gift, Compass, Volume2, VolumeX, Copy, Check, BookOpen, Sparkles, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WritersKitModal.module.css';

const PROMPTS = {
  fiction: [
    "An antiquarian bookshop owner discovers that the margins of a newly acquired first edition contain messages written by their future self.",
    "Two astronomers detect a signal from space, but it is not mathematical—it is a sequence of heartbeats from a known person on Earth.",
    "A clockmaker in 19th-century Paris is commissioned to build a device that can measure the weight of a secret.",
    "In a city where memories can be bought and sold, someone begins receiving recollections of a crime they did not commit.",
    "A deep-sea diver discovers a fully furnished Victorian library preserved inside a deep ocean trench."
  ],
  poetry: [
    "Write a poem starting with the phrase: 'The ink remembers what the hand forgot...'",
    "Focus on the sound of winter rain hitting a copper roof. Explore themes of silence and heritage.",
    "Compose a piece where every stanza begins with a color that does not exist.",
    "Write about a vintage typewriter that only works under the light of a crescent moon.",
    "Draft a sonnet on the geometry of shadows at sunset in an abandoned bookstore."
  ],
  memoir: [
    "Recall a conversation you overheard in a kitchen during a power outage. What was left unsaid?",
    "Describe the scent of a house you lived in but can no longer return to. Focus on the sensory details.",
    "Write about a souvenir that lost its meaning over time, and why you still keep it.",
    "Reflect on a moment where a complete stranger gave you advice that altered the course of your year.",
    "Explore the history of your own hands. What have they built, held, or let go of?"
  ]
};

export default function WritersKitModal() {
  const { isWritersKitOpen, setWritersKitOpen } = useModal();
  const [isOpenSurprise, setIsOpenSurprise] = useState(false);
  const [activeCategory, setActiveCategory] = useState('fiction');
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS.fiction[0]);
  const [copied, setCopied] = useState(false);

  // Audio States
  const [audioStates, setAudioStates] = useState({
    rain: false,
    fire: false,
    typewriter: false
  });

  const rainRef = useRef(null);
  const fireRef = useRef(null);
  const typewriterRef = useRef(null);

  // Draw new prompt
  const drawPrompt = (category) => {
    const list = PROMPTS[category || activeCategory];
    let nextIndex = Math.floor(Math.random() * list.length);
    // Avoid drawing the same prompt twice in a row if possible
    while (list[nextIndex] === currentPrompt && list.length > 1) {
      nextIndex = Math.floor(Math.random() * list.length);
    }
    setCurrentPrompt(list[nextIndex]);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    drawPrompt(cat);
  };

  // Copy code
  const handleCopy = () => {
    navigator.clipboard.writeText('LEGACY50');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle Audio
  const toggleAudio = (type) => {
    let audio = null;
    if (type === 'rain') audio = rainRef.current;
    if (type === 'fire') audio = fireRef.current;
    if (type === 'typewriter') audio = typewriterRef.current;

    if (audio) {
      if (audioStates[type]) {
        audio.pause();
      } else {
        audio.play().catch(e => console.log("Audio play blocked: user interaction required first."));
      }
      setAudioStates(prev => ({ ...prev, [type]: !prev[type] }));
    }
  };

  // Clean up audio on close
  const handleClose = () => {
    // Stop all audio
    if (rainRef.current) rainRef.current.pause();
    if (fireRef.current) fireRef.current.pause();
    if (typewriterRef.current) typewriterRef.current.pause();
    
    setAudioStates({ rain: false, fire: false, typewriter: false });
    setIsOpenSurprise(false);
    setWritersKitOpen(false);
  };

  if (!isWritersKitOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {/* Hidden Audio Elements */}
      <audio ref={rainRef} loop src="https://soundbible.com/mp3/Rain-Noise-Free-Soundbible.com-2122340336.mp3" />
      <audio ref={fireRef} loop src="https://soundbible.com/mp3/Fireplace-Crackling-Soundbible.com-2101569766.mp3" />
      <audio ref={typewriterRef} loop src="https://soundbible.com/mp3/Typing-On-A-Typewriter-Soundbible.com-608678077.mp3" />

      <div className={styles.card}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <X size={20} strokeWidth={1} />
        </button>
        <div className={styles.grain}></div>

        <AnimatePresence mode="wait">
          {!isOpenSurprise ? (
            /* STAGE 1: THE UNOPENED SECRET VAULT */
            <motion.div 
              key="closed-vault"
              className={styles.unopenedContainer}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.vaultIconWrapper}>
                <div className={styles.glowingRing}></div>
                <Gift className={styles.vaultIcon} size={50} strokeWidth={1.2} />
              </div>
              <span className={styles.eyebrow}>Exclusive Gift Vault</span>
              <h2 className={styles.unopenedTitle}>The Maybeify Writer's Vault</h2>
              <p className={styles.unopenedText}>
                We have prepared a creative package for our incoming authors. Click below to unlock your creative writing prompts, focus soundboard, and a premium publishing voucher.
              </p>
              <button className={styles.openBtn} onClick={() => setIsOpenSurprise(true)}>
                <span>Unlock Secret Vault ✦</span>
              </button>
            </motion.div>
          ) : (
            /* STAGE 2: THE REVEALED WRITERS KIT */
            <motion.div 
              key="opened-vault"
              className={styles.openedContainer}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Sidebar Header */}
              <div className={styles.header}>
                <span className={styles.eyebrow}>Unlocked Creator Kit</span>
                <h2>Your Publishing Companion</h2>
                <p>Equipped with writing prompts, focus environments, and vouchers to accelerate your manuscript journey.</p>
              </div>

              <div className={styles.grid}>
                {/* COLUMN 1: PROMPT GENERATOR & SOUNDBOARD */}
                <div className={styles.leftCol}>
                  {/* PROMPT GENERATOR */}
                  <div className={styles.moduleCard}>
                    <div className={styles.moduleTitle}>
                      <Compass size={18} className={styles.moduleIcon} />
                      <h3>Creative Prompt Generator</h3>
                    </div>
                    <div className={styles.categoryTabs}>
                      <button 
                        className={activeCategory === 'fiction' ? styles.activeTab : styles.tab} 
                        onClick={() => handleCategoryChange('fiction')}
                      >
                        Fiction
                      </button>
                      <button 
                        className={activeCategory === 'poetry' ? styles.activeTab : styles.tab} 
                        onClick={() => handleCategoryChange('poetry')}
                      >
                        Poetry
                      </button>
                      <button 
                        className={activeCategory === 'memoir' ? styles.activeTab : styles.tab} 
                        onClick={() => handleCategoryChange('memoir')}
                      >
                        Memoir
                      </button>
                    </div>
                    <div className={styles.promptBox}>
                      <p>"{currentPrompt}"</p>
                    </div>
                    <button className={styles.drawBtn} onClick={() => drawPrompt()}>
                      Draw New Prompt <span>✦</span>
                    </button>
                  </div>

                  {/* SOUNDBOARD */}
                  <div className={styles.moduleCard}>
                    <div className={styles.moduleTitle}>
                      <Music size={18} className={styles.moduleIcon} />
                      <h3>Focus Ambience Soundboard</h3>
                    </div>
                    <p className={styles.moduleSubtitle}>Set the mood. Turn on focus loops for writing.</p>
                    <div className={styles.audioGrid}>
                      {[
                        { id: 'rain', label: 'Rainy Library' },
                        { id: 'fire', label: 'Cozy Fire' },
                        { id: 'typewriter', label: 'Typewriter click' }
                      ].map(sound => (
                        <button 
                          key={sound.id}
                          className={`${styles.soundBtn} ${audioStates[sound.id] ? styles.soundBtnActive : ''}`}
                          onClick={() => toggleAudio(sound.id)}
                        >
                          {audioStates[sound.id] ? <Volume2 size={16} /> : <VolumeX size={16} />}
                          <span>{sound.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: CHECKLIST & VOUCHER */}
                <div className={styles.rightCol}>
                  {/* CHECKLIST */}
                  <div className={styles.moduleCard}>
                    <div className={styles.moduleTitle}>
                      <BookOpen size={18} className={styles.moduleIcon} />
                      <h3>Manuscript Architecture</h3>
                    </div>
                    <div className={styles.checklist}>
                      <div className={styles.checkItem}>
                        <input type="checkbox" defaultChecked disabled />
                        <span>Act I: Introduce Core Conflict & Stakes</span>
                      </div>
                      <div className={styles.checkItem}>
                        <input type="checkbox" defaultChecked disabled />
                        <span>Act II: Rising Confrontation & Midpoint Shift</span>
                      </div>
                      <div className={styles.checkItem}>
                        <input type="checkbox" defaultChecked disabled />
                        <span>Act III: Climax & Resolution</span>
                      </div>
                      <div className={styles.checkItem}>
                        <input type="checkbox" disabled />
                        <span>Vetted & Polish Pitch/Synopsis (Max 300 words)</span>
                      </div>
                      <div className={styles.checkItem}>
                        <input type="checkbox" disabled />
                        <span>Drafting complete manuscript files (PDF/DOCX)</span>
                      </div>
                    </div>
                  </div>

                  {/* VOUCHER CARD */}
                  <div className={styles.voucherCard}>
                    <div className={styles.voucherGlow}></div>
                    <Sparkles className={styles.voucherSparkle} size={24} />
                    <span className={styles.voucherEyebrow}>Exclusive Publishing Grant</span>
                    <h3 className={styles.voucherTitle}>50% OFF</h3>
                    <p className={styles.voucherDesc}>Apply to the 21-Day Author Transformation Program</p>
                    <div className={styles.codeWrapper} onClick={handleCopy}>
                      <span>LEGACY50</span>
                      <button className={styles.copyBtn}>
                        {copied ? <Check size={14} className={styles.copiedIcon} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span className={styles.voucherHint}>Click code to copy to clipboard</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
