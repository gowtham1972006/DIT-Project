'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── Data ──────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "Discipline is doing it even when you don't feel like it.", author: "— Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "— Unknown" },
  { text: "Consistency is what transforms average into excellence.", author: "— Unknown" },
  { text: "The body achieves what the mind believes.", author: "— Napoleon Hill" },
  { text: "No pain, no gain. Shut up and train.", author: "— Unknown" },
  { text: "Your only limit is you. Take care of your body — it's the only place you have to live.", author: "— Jim Rohn" },
];

const EXERCISES = [
  {
    name: "Push-Ups",
    emoji: "🫸",
    target: ["Chest", "Triceps", "Shoulders"],
    difficulty: "Beginner",
    reps: "10–15 reps",
    rest: "60 sec",
    color: "#e07a5f",
    steps: [
      "Get into a high plank position with hands shoulder-width apart.",
      "Keep your body straight from head to heels — no sagging hips.",
      "Slowly lower your chest to just above the floor.",
      "Push back up to the starting position by fully extending your arms.",
      "Breathe out on the way up, breathe in on the way down.",
    ],
    benefits: [
      "🔥 Builds upper body pushing strength",
      "🧱 Strengthens core stabilizers simultaneously",
      "🏠 No equipment needed — do it anywhere",
      "❤️ Improves cardiovascular endurance",
    ],
    tip: "Keep your elbows at 45° to your body — don't flare them out wide.",
  },
  {
    name: "Squats",
    emoji: "🦵",
    target: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    reps: "15–20 reps",
    rest: "60 sec",
    color: "#81b29a",
    steps: [
      "Stand with feet shoulder-width apart, toes slightly turned out.",
      "Keep your chest up and core braced throughout the movement.",
      "Push your hips back and bend your knees, lowering until thighs are parallel to the floor.",
      "Drive through your heels to stand back up to the starting position.",
      "Keep your knees tracking over your toes — don't let them cave inward.",
    ],
    benefits: [
      "💪 Develops powerful legs and glutes",
      "⚖️ Improves balance and coordination",
      "🦴 Strengthens joints and connective tissue",
      "🔥 Burns significant calories due to large muscle groups",
    ],
    tip: "Go only as deep as your mobility allows. Keep heels flat on the floor.",
  },
  {
    name: "Plank",
    emoji: "🧱",
    target: ["Core", "Shoulders", "Glutes"],
    difficulty: "Beginner",
    reps: "30–60 sec hold",
    rest: "45 sec",
    color: "#79a3b1",
    steps: [
      "Start in a forearm plank position — elbows directly under shoulders.",
      "Form a straight line from head to heels. Engage your core hard.",
      "Look at the floor to keep your neck neutral.",
      "Squeeze your glutes and thighs to prevent your hips from sagging or rising.",
      "Hold the position, breathing steadily throughout.",
    ],
    benefits: [
      "🧠 Builds deep core stability and endurance",
      "🧍 Significantly improves posture",
      "🛡️ Protects the lower back during other movements",
      "🔗 Activates full-body muscle chains simultaneously",
    ],
    tip: "If 60 sec is hard, start at 20 sec and add 5 sec each workout.",
  },
  {
    name: "Bicep Curls",
    emoji: "💪",
    target: ["Biceps", "Forearms"],
    difficulty: "Beginner",
    reps: "10–12 reps each arm",
    rest: "60 sec",
    color: "#b07bac",
    steps: [
      "Stand tall holding a dumbbell in each hand, arms hanging at your sides.",
      "Keep your elbows pinched against your ribs — don't let them swing.",
      "Curl the weights up toward your shoulders by contracting your biceps.",
      "Squeeze hard at the top for one count.",
      "Slowly lower the weights back to the starting position.",
    ],
    benefits: [
      "💪 Directly builds bicep size and strength",
      "🤝 Improves grip strength and forearm endurance",
      "🎯 Trains the mind-muscle connection",
      "✅ Easy to learn with excellent carryover to daily tasks",
    ],
    tip: "Slow the lowering phase down — the eccentric movement builds more muscle.",
  },
  {
    name: "Lunges",
    emoji: "🚶",
    target: ["Quadriceps", "Glutes", "Calves"],
    difficulty: "Beginner",
    reps: "10 each leg",
    rest: "60 sec",
    color: "#f0a500",
    steps: [
      "Stand tall with feet together, hands on hips or at your sides.",
      "Step one foot forward about 2–3 feet in front of you.",
      "Lower your back knee toward the floor — stop just before it touches.",
      "Push through the front heel to return to the starting position.",
      "Alternate legs and repeat for the desired number of reps.",
    ],
    benefits: [
      "🦵 Trains each leg independently, fixing imbalances",
      "⚖️ Dramatically improves single-leg balance and stability",
      "🍑 Shapes and strengthens glutes",
      "🏃 Carries over directly to walking, running, and sports",
    ],
    tip: "Keep your front knee above your ankle, not past your toes.",
  },
  {
    name: "Burpees",
    emoji: "⚡",
    target: ["Full Body", "Cardio"],
    difficulty: "Intermediate",
    reps: "8–12 reps",
    rest: "90 sec",
    color: "#e07a5f",
    steps: [
      "Stand with feet shoulder-width apart.",
      "Bend down and place your hands on the floor in front of you.",
      "Jump or step your feet back into a high plank position.",
      "Do one push-up (optional but recommended).",
      "Jump your feet back to your hands, then explosively jump up — arms overhead.",
    ],
    benefits: [
      "🔥 Burns massive calories in a short time",
      "🏋️ Works nearly every muscle in the body",
      "❤️ Dramatically increases cardiovascular fitness",
      "⚡ Builds explosive power and athleticism",
    ],
    tip: "Scale by removing the jump or push-up if needed. Quality over speed.",
  },
];

const DIFFICULTY_COLOR = { Beginner: '#81b29a', Intermediate: '#f0a500', Advanced: '#e07a5f' };

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FitnessPage() {
  // Quote rotation
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVis, setQuoteVis] = useState(true);

  // Workout Timer
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerLabel, setTimerLabel] = useState('');

  // Expanded exercise card
  const [expanded, setExpanded] = useState(null);

  // ── Quote rotation ─────────────────────────────────────────────────────────
  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    const t = setInterval(() => {
      setQuoteVis(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVis(true); }, 500);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setTimerSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const startTimer = (label) => { setTimerSecs(0); setTimerLabel(label); setTimerActive(true); };
  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => { setTimerActive(false); setTimerSecs(0); setTimerLabel(''); };

  return (
    <main style={{
      background: 'linear-gradient(160deg, #fff3e8 0%, #f5f0fa 50%, #e8f4fb 100%)',
      minHeight: '100vh',
      paddingBottom: '4rem',
    }}>
      <div className="container" style={{ maxWidth: '860px', paddingTop: '2rem' }}>

        {/* ── Back link ── */}
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>💪</div>
          <h1 style={{ fontSize: '2.4rem', background: 'linear-gradient(135deg, #e07a5f, #b07bac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem' }}>
            Body Building & Fitness
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '460px', margin: '0 auto' }}>
            Build strength, improve health, and stay consistent — one rep at a time.
          </p>
        </div>

        {/* ── Motivational Quote ── */}
        <FitnessCard mb center style={{ background: 'linear-gradient(135deg, rgba(224,122,95,0.1), rgba(176,123,172,0.1))' }}>
          <div style={{ opacity: quoteVis ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🔥</div>
            <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.7, margin: '0 0 0.5rem' }}>
              &ldquo;{QUOTES[quoteIdx].text}&rdquo;
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>{QUOTES[quoteIdx].author}</p>
          </div>
        </FitnessCard>

        {/* ── Workout Timer ── */}
        <FitnessCard mb>
          <FitnessTitle icon="⏱️" title="Workout Timer" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Start the timer when you begin your set. Track rest time between exercises.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {/* Big timer display */}
            <div style={{
              fontSize: '4rem', fontWeight: 800, letterSpacing: '2px',
              color: timerActive ? '#e07a5f' : 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.3s',
              lineHeight: 1,
            }}>
              {formatTime(timerSecs)}
            </div>
            {timerLabel && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Timing: {timerLabel}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {!timerActive
                ? <button onClick={() => startTimer('Workout')} style={{ padding: '0.6rem 1.8rem', borderRadius: '24px', background: 'linear-gradient(135deg, #e07a5f, #b07bac)' }}>▶ Start</button>
                : <button onClick={pauseTimer} style={{ padding: '0.6rem 1.8rem', borderRadius: '24px', background: '#f0a500' }}>⏸ Pause</button>
              }
              <button onClick={resetTimer} style={{ padding: '0.6rem 1.2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.7)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                ↺ Reset
              </button>
            </div>
          </div>
        </FitnessCard>

        {/* ── Exercise Cards ── */}
        <FitnessTitle icon="🏋️" title="Exercise Library" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Tap any exercise card to expand full instructions, benefits, and tips.
        </p>

        <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {EXERCISES.map((ex, i) => {
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: isOpen ? `1.5px solid ${ex.color}` : '1px solid rgba(255,255,255,0.9)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: isOpen ? `0 8px 32px ${ex.color}28` : '0 4px 16px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  userSelect: 'none',
                }}
              >
                {/* Card header — always visible */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{ex.emoji}</div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{ex.name}</h3>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {ex.target.map(t => (
                          <span key={t} style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '20px', background: `${ex.color}20`, color: ex.color, fontWeight: 600, border: `1px solid ${ex.color}40` }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.73rem', padding: '0.2rem 0.65rem', borderRadius: '20px', background: `${DIFFICULTY_COLOR[ex.difficulty]}20`, color: DIFFICULTY_COLOR[ex.difficulty], fontWeight: 600, border: `1px solid ${DIFFICULTY_COLOR[ex.difficulty]}40` }}>
                      {ex.difficulty}
                    </span>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                      ›
                    </span>
                  </div>
                </div>

                {/* Quick stats row */}
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                  <Stat icon="🎯" label="Reps" value={ex.reps} />
                  <Stat icon="⏸" label="Rest" value={ex.rest} />
                  <button
                    onClick={(e) => { e.stopPropagation(); startTimer(`${ex.name} Rest`); }}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '20px', background: `${ex.color}18`, color: ex.color, border: `1px solid ${ex.color}30`, cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    ⏱ Time Rest
                  </button>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="fade-in" onClick={e => e.stopPropagation()} style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', cursor: 'default' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                      {/* Steps */}
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>📋 Step-by-Step</p>
                        <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                          {ex.steps.map((s, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{s}</li>
                          ))}
                        </ol>
                      </div>
                      {/* Benefits */}
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>✅ Benefits</p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {ex.benefits.map((b, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {/* Tip */}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: `${ex.color}12`, border: `1px solid ${ex.color}25`, borderRadius: '12px', padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Pro Tip: </strong>{ex.tip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Beginner Routine ── */}
        <FitnessCard mb>
          <FitnessTitle icon="📅" title="Beginner 3-Day Routine" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            A simple weekly structure to get you started. Rest on other days.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { day: "Day 1 — Push", color: '#e07a5f', exercises: ["Push-Ups: 3×12", "Plank: 3×30s", "Burpees: 3×8"] },
              { day: "Day 2 — Legs", color: '#81b29a', exercises: ["Squats: 4×15", "Lunges: 3×10 each", "Calf Raises: 3×20"] },
              { day: "Day 3 — Arms + Core", color: '#b07bac', exercises: ["Bicep Curls: 3×12", "Plank: 3×45s", "Diamond Push-Ups: 3×10"] },
            ].map(w => (
              <div key={w.day} style={{ padding: '1rem', borderRadius: '14px', background: `${w.color}12`, border: `1px solid ${w.color}30` }}>
                <p style={{ fontWeight: 700, color: w.color, marginBottom: '0.6rem', fontSize: '0.9rem' }}>{w.day}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {w.exercises.map(e => (
                    <li key={e} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>• {e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </FitnessCard>

        {/* ── Fitness Tips ── */}
        <FitnessCard mb>
          <FitnessTitle icon="🧠" title="Smart Training Tips" />
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              { icon: "💧", tip: "Hydration", desc: "Drink water before, during, and after your workout. Even mild dehydration reduces performance." },
              { icon: "😴", tip: "Sleep & Recovery", desc: "Muscles grow during rest, not during exercise. Aim for 7–9 hours of quality sleep." },
              { icon: "🥗", tip: "Nutrition", desc: "Eat enough protein (0.7–1g per kg of bodyweight) to support muscle repair and growth." },
              { icon: "📈", tip: "Progressive Overload", desc: "Gradually increase reps, weight, or sets each week. This is what drives continued progress." },
              { icon: "🔄", tip: "Consistency > Intensity", desc: "Showing up 3× a week every week beats one intense session followed by a week off." },
            ].map(item => (
              <div key={item.tip} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.55)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{item.tip}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FitnessCard>

        {/* ── Footer note ── */}
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
            💪 Every rep is a vote for the person you want to become. Keep going.
          </p>
        </div>

      </div>
    </main>
  );
}

// ── Reusable components ───────────────────────────────────────────────────────
function FitnessCard({ children, mb, center, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.88)',
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

function FitnessTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}:</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
