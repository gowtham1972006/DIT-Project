'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ── Data ──────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "You don't have to control your thoughts. Just observe them.", author: "— Jon Kabat-Zinn" },
  { text: "Slow down. You are doing better than you think.", author: "— Unknown" },
  { text: "Peace begins with a deep breath.", author: "— Unknown" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "— Anne Lamott" },
  { text: "Within you there is a stillness and a sanctuary to which you can retreat at any time.", author: "— Hermann Hesse" },
  { text: "Your present moment is the only moment available to you, and it is the home of love.", author: "— Thich Nhat Hanh" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "— Oprah Winfrey" },
  { text: "The quieter you become, the more you can hear.", author: "— Ram Dass" },
];

const BODY_SCAN_STEPS = [
  { area: "Head & Scalp", icon: "🧠", tip: "Soften your forehead. Let your jaw unclench. Feel any tension melt away." },
  { area: "Shoulders & Neck", icon: "💆", tip: "Drop your shoulders away from your ears. Roll your neck gently." },
  { area: "Chest & Heart", icon: "❤️", tip: "Notice your heartbeat. With each breath, feel your chest expand and soften." },
  { area: "Arms & Hands", icon: "🤲", tip: "Relax your hands completely. Let your arms feel heavy and supported." },
  { area: "Belly & Core", icon: "🌿", tip: "Allow your belly to rise and fall freely. No need to hold it in." },
  { area: "Legs & Feet", icon: "🦶", tip: "Feel the weight of your legs. Wiggle your toes and release any tension." },
];

const MOODS = [
  { emoji: "😞", label: "Struggling", value: 1 },
  { emoji: "😐", label: "Neutral",   value: 2 },
  { emoji: "🙂", label: "Good",      value: 3 },
  { emoji: "😄", label: "Great",     value: 4 },
];

const SOUNDS = [
  { label: "🌧️ Rain",        src: "/sounds/rain.wav" },
  { label: "🌊 Ocean",       src: "/sounds/ocean.wav" },
  { label: "🔥 Fireplace",   src: "/sounds/fireplace.wav" },
  { label: "🐦 Forest Birds",src: "/sounds/bird.wav" },
];

const BREATHING_PATTERNS = [
  { label: "4-4-4 Box", inhale: 4, hold: 4, exhale: 4, description: "Equal breathing for focus" },
  { label: "4-7-8 Calm", inhale: 4, hold: 7, exhale: 8, description: "Deep relaxation & sleep" },
  { label: "5-0-5 Simple", inhale: 5, hold: 0, exhale: 5, description: "Simple natural breathing" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RelaxationPage() {
  // Breathing
  const [breathPattern, setBreathPattern] = useState(0);
  const [breathPhase, setBreathPhase]     = useState('inhale');
  const [breathCount, setBreathCount]     = useState(4);
  const [breathActive, setBreathActive]   = useState(false);
  const [breathScale, setBreathScale]     = useState(1);
  const [totalBreaths, setTotalBreaths]   = useState(0);

  // Timer
  const [timerSecs, setTimerSecs]   = useState(300);
  const [timerInput, setTimerInput] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone]   = useState(false);

  // Mood
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter]   = useState(null);
  const [moodResult, setMoodResult] = useState('');

  // Quote
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Body Scan
  const [scanStep, setScanStep] = useState(0);
  const [scanActive, setScanActive] = useState(false);

  // Sound
  const [currentSound, setCurrentSound] = useState(null);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const audioRef = useRef(null);

  // ── Breathing engine ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!breathActive) return;
    const pattern = BREATHING_PATTERNS[breathPattern];

    const runCycle = () => {
      // Inhale
      setBreathPhase('inhale');
      setBreathCount(pattern.inhale);
      setBreathScale(1.45);

      const holdTimer = setTimeout(() => {
        if (pattern.hold > 0) {
          setBreathPhase('hold');
          setBreathCount(pattern.hold);
          setBreathScale(1.45);
        }

        const exhaleDelay = pattern.hold > 0 ? pattern.hold * 1000 : 0;
        const exhaleTimer = setTimeout(() => {
          setBreathPhase('exhale');
          setBreathCount(pattern.exhale);
          setBreathScale(0.75);
          setTotalBreaths(b => b + 1);
        }, exhaleDelay);

        return () => clearTimeout(exhaleTimer);
      }, pattern.inhale * 1000);

      return () => clearTimeout(holdTimer);
    };

    const totalCycle = (pattern.inhale + pattern.hold + pattern.exhale) * 1000;
    runCycle();
    const interval = setInterval(runCycle, totalCycle);
    return () => clearInterval(interval);
  }, [breathActive, breathPattern]);

  const toggleBreath = () => {
    if (!breathActive) {
      setBreathPhase('inhale');
      setBreathScale(1.45);
    } else {
      setBreathScale(1);
      setBreathPhase('inhale');
    }
    setBreathActive(p => !p);
  };

  // ── Timer engine ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive) return;
    if (timerSecs <= 0) {
      setTimerActive(false);
      setTimerDone(true);
      return;
    }
    const t = setInterval(() => setTimerSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timerSecs]);

  const startTimer  = () => { setTimerDone(false); setTimerActive(true); };
  const pauseTimer  = () => setTimerActive(false);
  const resetTimer  = () => { setTimerActive(false); setTimerDone(false); setTimerSecs(timerInput); };

  // ── Quote rotation ────────────────────────────────────────────────────────────
  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 500);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // ── Body scan ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scanActive) return;
    if (scanStep >= BODY_SCAN_STEPS.length) { setScanActive(false); return; }
    const t = setTimeout(() => setScanStep(s => s + 1), 8000);
    return () => clearTimeout(t);
  }, [scanActive, scanStep]);

  const startScan = () => { setScanStep(0); setScanActive(true); };
  const stopScan  = () => { setScanActive(false); setScanStep(0); };

  // ── Sound player ──────────────────────────────────────────────────────────────
  const playSound = (idx) => {
    if (currentSound === idx && soundPlaying) {
      audioRef.current?.pause();
      setSoundPlaying(false);
      return;
    }
    setCurrentSound(idx);
    setSoundPlaying(true);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (soundPlaying && currentSound !== null) {
      audioRef.current.src = SOUNDS[currentSound].src;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [soundPlaying, currentSound]);

  // ── Mood result ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (moodBefore && moodAfter) {
      const before = MOODS.find(m => m.value === moodBefore);
      const after  = MOODS.find(m => m.value === moodAfter);
      if (moodAfter > moodBefore) {
        setMoodResult(`✨ You rose from ${before.emoji} to ${after.emoji}! That's real progress. 💙`);
      } else if (moodAfter === moodBefore) {
        setMoodResult(`${after.emoji} You're holding steady. Every calm breath matters.`);
      } else {
        setMoodResult(`🤍 It's okay. Some days are harder. Keep breathing — you showed up.`);
      }
    }
  }, [moodBefore, moodAfter]);

  // ── Phase label ───────────────────────────────────────────────────────────────
  const phaseLabel  = breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out';
  const phaseColor  = breathPhase === 'inhale'
    ? 'linear-gradient(135deg, #79a3b1, #5d8c9c)'
    : breathPhase === 'hold'
    ? 'linear-gradient(135deg, #81b29a, #5f9e7e)'
    : 'linear-gradient(135deg, #b1a0c8, #8e79b1)';
  const glowColor   = breathPhase === 'inhale' ? 'rgba(121,163,177,0.55)' : breathPhase === 'hold' ? 'rgba(129,178,154,0.55)' : 'rgba(177,160,200,0.55)';
  const timerPct    = Math.round((timerSecs / timerInput) * 100);

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      <main style={{
        background: 'linear-gradient(160deg, #e8f4f8 0%, #f0f7f0 50%, #ede8f7 100%)',
        minHeight: '100vh',
        paddingBottom: '4rem',
      }}>
        <div className="container" style={{ maxWidth: '860px', paddingTop: '2rem' }}>

          {/* ── Back link ── */}
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>

          {/* ── Hero Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🧘</div>
            <h1 style={{ fontSize: '2.4rem', background: 'linear-gradient(135deg, #79a3b1, #b1a0c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem' }}>
              Relaxation Room
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
              A sanctuary for your mind. Breathe, reset, and gently return to yourself.
            </p>
          </div>

          {/* ── Mood Before ── */}
          <GlassCard mb>
            <SectionTitle icon="🌡️" title="How are you feeling right now?" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              Select your current mood before you begin:
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setMoodBefore(m.value)} style={{
                  fontSize: '2rem', padding: '0.6rem 1.2rem', borderRadius: '16px', cursor: 'pointer',
                  border: moodBefore === m.value ? '2px solid var(--primary-color)' : '2px solid transparent',
                  background: moodBefore === m.value ? 'rgba(121,163,177,0.15)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s', transform: moodBefore === m.value ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: moodBefore === m.value ? '0 4px 16px rgba(121,163,177,0.35)' : 'none',
                }}>
                  <div>{m.emoji}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{m.label}</div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* ── Motivational Quote ── */}
          <GlassCard mb center style={{ background: 'linear-gradient(135deg, rgba(121,163,177,0.12), rgba(177,160,200,0.12))' }}>
            <div style={{ opacity: quoteVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✨</div>
              <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.7, margin: '0 0 0.5rem' }}>
                &ldquo;{QUOTES[quoteIdx].text}&rdquo;
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{QUOTES[quoteIdx].author}</p>
            </div>
          </GlassCard>

          {/* ── 2-column grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* ── Breathing Circle ── */}
            <GlassCard style={{ textAlign: 'center' }}>
              <SectionTitle icon="🌬️" title="Breathing Exercise" />

              {/* Pattern selector */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {BREATHING_PATTERNS.map((p, i) => (
                  <button key={i} onClick={() => { setBreathPattern(i); setBreathActive(false); setBreathScale(1); }} style={{
                    padding: '0.35rem 0.85rem', fontSize: '0.78rem', borderRadius: '20px',
                    background: breathPattern === i ? 'var(--primary-color)' : 'rgba(255,255,255,0.6)',
                    color: breathPattern === i ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s',
                  }}>{p.label}</button>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {BREATHING_PATTERNS[breathPattern].description}
              </p>

              {/* Animated circle */}
              <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 1.5rem' }}>
                {/* Outer glow ring */}
                <div style={{
                  position: 'absolute', inset: '-12px', borderRadius: '50%',
                  background: glowColor,
                  filter: 'blur(18px)',
                  transform: `scale(${breathScale})`,
                  transition: `transform ${breathPhase === 'inhale' ? BREATHING_PATTERNS[breathPattern].inhale : breathPhase === 'hold' ? 0.1 : BREATHING_PATTERNS[breathPattern].exhale}s ease-in-out`,
                  opacity: breathActive ? 1 : 0.3,
                }} />
                {/* Main circle */}
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: phaseColor,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 600, fontSize: '1rem',
                  transform: `scale(${breathScale})`,
                  transition: `transform ${breathPhase === 'inhale' ? BREATHING_PATTERNS[breathPattern].inhale : breathPhase === 'hold' ? 0.1 : BREATHING_PATTERNS[breathPattern].exhale}s ease-in-out`,
                  boxShadow: `0 8px 30px ${glowColor}`,
                  cursor: 'pointer',
                  position: 'relative',
                }} onClick={toggleBreath}>
                  <span style={{ fontSize: '0.9rem' }}>{breathActive ? phaseLabel : 'Tap to Start'}</span>
                  {breathActive && <span style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{breathCount}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
                <button onClick={toggleBreath} style={{ padding: '0.6rem 1.8rem', borderRadius: '24px', fontSize: '0.9rem', background: breathActive ? 'rgba(224,122,95,0.8)' : 'var(--primary-color)' }}>
                  {breathActive ? '⏸ Pause' : '▶ Start'}
                </button>
              </div>
              {totalBreaths > 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  🌿 {totalBreaths} breath{totalBreaths !== 1 ? 's' : ''} completed
                </p>
              )}
            </GlassCard>

            {/* ── Relaxation Timer ── */}
            <GlassCard style={{ textAlign: 'center' }}>
              <SectionTitle icon="⏱️" title="Relaxation Timer" />

              {/* Duration presets */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {[60, 180, 300, 600].map(s => (
                  <button key={s} onClick={() => { setTimerInput(s); setTimerSecs(s); setTimerActive(false); setTimerDone(false); }} style={{
                    padding: '0.3rem 0.75rem', fontSize: '0.78rem', borderRadius: '20px', cursor: 'pointer',
                    background: timerInput === s ? 'var(--primary-color)' : 'rgba(255,255,255,0.6)',
                    color: timerInput === s ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)', transition: 'all 0.2s',
                  }}>{formatTime(s)}</button>
                ))}
              </div>

              {/* Circular progress */}
              <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1.5rem' }}>
                <svg viewBox="0 0 160 160" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="80" cy="80" r="68" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                  <circle cx="80" cy="80" r="68" fill="none"
                    stroke={timerDone ? 'var(--success)' : 'var(--primary-color)'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 68}`}
                    strokeDashoffset={`${2 * Math.PI * 68 * (1 - timerPct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: timerDone ? 'var(--success)' : 'var(--text-primary)' }}>{formatTime(timerSecs)}</span>
                  {timerDone && <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Complete! 🎉</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {!timerActive
                  ? <button onClick={startTimer} style={{ padding: '0.6rem 1.4rem', borderRadius: '24px', fontSize: '0.88rem' }} disabled={timerDone || timerSecs <= 0}>▶ Start</button>
                  : <button onClick={pauseTimer} style={{ padding: '0.6rem 1.4rem', borderRadius: '24px', fontSize: '0.88rem', background: '#f0a500' }}>⏸ Pause</button>
                }
                <button onClick={resetTimer} style={{ padding: '0.6rem 1.2rem', borderRadius: '24px', fontSize: '0.88rem', background: 'rgba(255,255,255,0.7)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>↺ Reset</button>
              </div>
            </GlassCard>
          </div>

          {/* ── Ambient Sounds ── */}
          <GlassCard mb>
            <SectionTitle icon="🎧" title="Ambient Sounds" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Choose a calming soundscape to enhance your relaxation:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {SOUNDS.map((s, i) => (
                <button key={i} onClick={() => playSound(i)} style={{
                  padding: '1rem 0.75rem', borderRadius: '16px', cursor: 'pointer',
                  background: currentSound === i && soundPlaying ? 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))' : 'rgba(255,255,255,0.6)',
                  color: currentSound === i && soundPlaying ? 'white' : 'var(--text-primary)',
                  border: currentSound === i && soundPlaying ? 'none' : '1px solid var(--border-color)',
                  fontWeight: 500, fontSize: '0.88rem',
                  transition: 'all 0.25s',
                  boxShadow: currentSound === i && soundPlaying ? '0 4px 16px rgba(121,163,177,0.4)' : 'none',
                  transform: currentSound === i && soundPlaying ? 'translateY(-2px)' : 'none',
                }}>
                  {s.label}
                  {currentSound === i && soundPlaying && <div style={{ fontSize: '0.7rem', marginTop: '0.3rem', opacity: 0.85 }}>▐▐ Playing</div>}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem', marginBottom: 0 }}>
              Click the same sound again to pause it.
            </p>
          </GlassCard>

          {/* ── Body Scan ── */}
          <GlassCard mb>
            <SectionTitle icon="💆" title="Guided Body Scan" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Slowly bring awareness to each area of your body, releasing tension as you go. Each step lasts 8 seconds.
            </p>

            {!scanActive && scanStep === 0 ? (
              <button onClick={startScan} style={{ padding: '0.75rem 2rem', borderRadius: '24px' }}>
                Begin Body Scan
              </button>
            ) : scanStep >= BODY_SCAN_STEPS.length ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                <p style={{ color: 'var(--success)', fontWeight: 600 }}>Body scan complete. Well done.</p>
                <button onClick={stopScan} style={{ borderRadius: '24px', padding: '0.5rem 1.5rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.7)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  Start Over
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {BODY_SCAN_STEPS.map((_, i) => (
                    <div key={i} style={{
                      height: '5px', flex: 1, borderRadius: '3px',
                      background: i < scanStep ? 'var(--success)' : i === scanStep ? 'var(--primary-color)' : 'var(--border-color)',
                      transition: 'background 0.5s',
                    }} />
                  ))}
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(121,163,177,0.08)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>{BODY_SCAN_STEPS[scanStep].icon}</div>
                  <h3 style={{ color: 'var(--primary-color)', margin: '0 0 0.5rem' }}>{BODY_SCAN_STEPS[scanStep].area}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>{BODY_SCAN_STEPS[scanStep].tip}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
                  <button onClick={stopScan} style={{ padding: '0.5rem 1.25rem', borderRadius: '24px', background: 'rgba(255,255,255,0.7)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    Stop
                  </button>
                  <button onClick={() => setScanStep(s => Math.min(s + 1, BODY_SCAN_STEPS.length))} style={{ padding: '0.5rem 1.25rem', borderRadius: '24px', fontSize: '0.85rem' }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* ── Peaceful Visualization ── */}
          <GlassCard mb style={{ background: 'linear-gradient(135deg, rgba(129,178,154,0.1), rgba(121,163,177,0.1))' }}>
            <SectionTitle icon="🌊" title="Peaceful Visualization" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Close your eyes and follow this guided imagery. Read slowly.
            </p>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {[
                { step: 1, text: "Find a comfortable position and gently close your eyes. Take three slow, deep breaths." },
                { step: 2, text: "Imagine you are standing at the edge of a calm, sunlit beach. Feel warm sand between your toes." },
                { step: 3, text: "Hear the gentle rhythm of waves rolling in and out. Each wave carries your worries away." },
                { step: 4, text: "Feel a gentle breeze on your face. Smell the fresh, salty air. Your body is completely at ease." },
                { step: 5, text: "You are safe, peaceful, and free. Stay here as long as you need. This place is always within you." },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ── Grounding 5-4-3-2-1 ── */}
          <GlassCard mb>
            <SectionTitle icon="🌱" title="5-4-3-2-1 Grounding" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              When overwhelmed, anchor yourself to the present moment:
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                { n: 5, sense: "See",   tip: "Look around. Name 5 things you can see right now.", icon: "👁️" },
                { n: 4, sense: "Touch",  tip: "Feel 4 things physically — the chair, your clothing, the air.", icon: "✋" },
                { n: 3, sense: "Hear",   tip: "Listen. What are 3 sounds you can notice right now?", icon: "👂" },
                { n: 2, sense: "Smell",  tip: "Breathe in. Can you identify 2 different smells?", icon: "👃" },
                { n: 1, sense: "Taste",  tip: "What is 1 taste you can notice in your mouth?", icon: "👅" },
              ].map(item => (
                <div key={item.n} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.55)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{item.n} </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>things to {item.sense}</span>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ── Guided Video ── */}
          <GlassCard mb>
            <SectionTitle icon="🎥" title="Guided Meditation Video" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              Follow along with this guided mindfulness session:
            </p>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/inpok4MKVLM?si=BqeolTvlolTsVbOd"
                title="Guided Meditation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block', border: 'none' }}
              />
            </div>
          </GlassCard>

          {/* ── Mood After ── */}
          <GlassCard mb>
            <SectionTitle icon="🌈" title="How do you feel now?" />
            {!moodBefore ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Please select your mood at the top first to track your improvement.
              </p>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                  After your session, how do you feel compared to when you started?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {MOODS.map(m => (
                    <button key={m.value} onClick={() => setMoodAfter(m.value)} style={{
                      fontSize: '2rem', padding: '0.6rem 1.2rem', borderRadius: '16px', cursor: 'pointer',
                      border: moodAfter === m.value ? '2px solid var(--primary-color)' : '2px solid transparent',
                      background: moodAfter === m.value ? 'rgba(121,163,177,0.15)' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.2s', transform: moodAfter === m.value ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: moodAfter === m.value ? '0 4px 16px rgba(121,163,177,0.35)' : 'none',
                    }}>
                      <div>{m.emoji}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{m.label}</div>
                    </button>
                  ))}
                </div>
                {moodResult && (
                  <div className="fade-in" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(129,178,154,0.15), rgba(121,163,177,0.15))', border: '1px solid rgba(121,163,177,0.3)', textAlign: 'center', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {moodResult}
                  </div>
                )}
              </>
            )}
          </GlassCard>

          {/* ── Footer note ── */}
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              🕊️ This space is yours — come back whenever you need a moment of calm.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

// ── Reusable small components ─────────────────────────────────────────────────
function GlassCard({ children, mb, center, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.85)',
      borderRadius: '20px',
      padding: '1.75rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      marginBottom: mb ? '1.5rem' : undefined,
      textAlign: center ? 'center' : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );
}