'use client';

import { useState, useEffect } from 'react';
import { CHALLENGE_PROMPTS } from '@/lib/challengePrompts';
import styles from './page.module.css';

export default function ChallengeDashboard() {
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editorText, setEditorText] = useState('');
  const [savedDays, setSavedDays] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [compiled, setCompiled] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const id = sessionStorage.getItem('challengeEnrollmentId') || 'demo-id';
    const start = sessionStorage.getItem('challengeStartDate') || new Date().toISOString();
    const name = sessionStorage.getItem('challengeUserName') || 'Author';

    setEnrollmentId(id);
    setUserName(name);

    const daysSinceStart = Math.floor((Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    setCurrentDay(Math.min(daysSinceStart, 21));

    // Load saved submissions from localStorage for demo
    const saved = JSON.parse(localStorage.getItem('challengeSubmissions') || '{}');
    setSavedDays(saved);
  }, []);

  const handleDaySelect = (day) => {
    if (day > currentDay) return;
    setSelectedDay(day);
    setEditorText(savedDays[day] || '');
    setSaved(false);
  };

  const handleTextChange = (e) => {
    setEditorText(e.target.value);
    setWordCount(e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Save to localStorage for demo
    const updated = { ...savedDays, [selectedDay]: editorText };
    localStorage.setItem('challengeSubmissions', JSON.stringify(updated));
    setSavedDays(updated);

    // Also push to API
    try {
      await fetch('/api/challenge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, dayNumber: selectedDay, content: editorText }),
      });
    } catch {}

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 800);
  };

  const handleCompile = () => {
    setCompiled(true);
    setSelectedDay(null);
  };

  const completedDays = Object.keys(savedDays).length;
  const allComplete = completedDays === 21;
  const prompt = selectedDay ? CHALLENGE_PROMPTS[selectedDay - 1] : null;

  return (
    <div className={styles.page}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <span className={styles.sidebarLabel}>THE 21-DAY CHALLENGE</span>
          <h2 className="serif">Your Vault</h2>
          <p className={styles.welcomeText}>Welcome back, {userName}.</p>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(completedDays / 21) * 100}%` }}></div>
          </div>
          <p className={styles.progressText}>{completedDays} of 21 days complete</p>
        </div>

        {/* 21-NODE MAP */}
        <div className={styles.nodeMap}>
          {CHALLENGE_PROMPTS.map((p) => {
            const isDone = !!savedDays[p.day];
            const isUnlocked = p.day <= currentDay;
            const isSelected = selectedDay === p.day;

            return (
              <button
                key={p.day}
                className={`${styles.nodeBtn} ${isDone ? styles.nodeDone : ''} ${!isUnlocked ? styles.nodeLocked : ''} ${isSelected ? styles.nodeSelected : ''}`}
                onClick={() => handleDaySelect(p.day)}
                title={isUnlocked ? `Day ${p.day}: ${p.theme}` : 'Locked — not yet unlocked'}
              >
                <span className={styles.nodeDayNum}>{p.day}</span>
                {isDone && <span className={styles.nodeTick}>✓</span>}
                {!isUnlocked && <span className={styles.nodeLock}>🔒</span>}
              </button>
            );
          })}
        </div>

        {allComplete && (
          <button className={styles.compileBtn} onClick={handleCompile}>
            ✦ Compile My Masterpiece
          </button>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>

        {/* Welcome state */}
        {!selectedDay && !compiled && (
          <div className={styles.welcomeState}>
            <span className={styles.welcomeDay}>Day {currentDay} of 21</span>
            <h1 className="serif">
              {allComplete ? 'You did it.' : `Today\'s Chapter Awaits.`}
            </h1>
            <p>{allComplete ? 'All 21 chapters are written. Your manuscript is ready to be compiled.' : 'Select today\'s node to unlock your writing prompt and begin.'}</p>
            {currentDay <= 21 && !allComplete && (
              <button className={styles.todayBtn} onClick={() => handleDaySelect(currentDay)}>
                Open Day {currentDay} →
              </button>
            )}
          </div>
        )}

        {/* Compiled masterpiece */}
        {compiled && (
          <div className={styles.compiledState}>
            <span className={styles.compiledIcon}>✦</span>
            <h1 className="serif">Your Manuscript</h1>
            <p className={styles.compiledSubtext}>All 21 chapters, compiled into your first draft.</p>
            <div className={styles.manuscript}>
              {CHALLENGE_PROMPTS.map((p) => (
                savedDays[p.day] && (
                  <div key={p.day} className={styles.manuscriptChapter}>
                    <h3 className="serif">Chapter {p.day}: {p.theme}</h3>
                    <p>{savedDays[p.day]}</p>
                  </div>
                )
              ))}
            </div>
            <button className={styles.submitManuscriptBtn} onClick={() => alert('Your manuscript has been submitted to the Maybeify acquisitions board!')}>
              Submit to Acquisitions Board →
            </button>
          </div>
        )}

        {/* EDITOR */}
        {selectedDay && prompt && (
          <div className={styles.editorPane}>
            <div className={styles.editorHeader}>
              <div>
                <span className={styles.editorDayLabel}>DAY {selectedDay} · THE VAULT</span>
                <h2 className="serif">{prompt.theme}</h2>
              </div>
              <div className={styles.editorMeta}>
                <span className={styles.wordCount}>{wordCount} words</span>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !editorText.trim()}>
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Entry'}
                </button>
              </div>
            </div>

            <div className={styles.promptCard}>
              <span className={styles.promptIcon}>✦</span>
              <p>{prompt.prompt}</p>
            </div>

            <textarea
              className={styles.editor}
              value={editorText}
              onChange={handleTextChange}
              placeholder="Begin writing..."
              spellCheck={true}
            />

            <div className={styles.editorFooter}>
              <button className={styles.closeEditorBtn} onClick={() => setSelectedDay(null)}>← Back to Map</button>
              {saved && <span className={styles.savedBadge}>✓ Entry saved to your vault</span>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
