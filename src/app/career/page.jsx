'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Data ──────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "Don't compare your chapter 1 to someone else's chapter 10.", author: "— Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "— Zig Ziglar" },
  { text: "Consistency is the most underrated skill in tech.", author: "— Every Senior Ever" },
  { text: "Your LinkedIn says 'Student'. Your GitHub should say 'Builder'.", author: "— Career advice" },
  { text: "Skills > marks. Projects > certificates. Consistency > cramming.", author: "— Real talk" },
];

const CS_PLATFORMS = [
  { name: "LeetCode",      icon: "⚔️", desc: "DSA practice for interviews",  url: "https://leetcode.com",        color: "#f0a500" },
  { name: "GeeksforGeeks", icon: "🧠", desc: "Concepts + interview questions", url: "https://geeksforgeeks.org",    color: "#2ecc71" },
  { name: "freeCodeCamp",  icon: "🔥", desc: "Free full-stack web dev course", url: "https://freecodecamp.org",    color: "#e07a5f" },
  { name: "GitHub",        icon: "🐙", desc: "Host your projects + portfolio", url: "https://github.com",          color: "#2c3e50" },
  { name: "Roadmap.sh",    icon: "🗺️", desc: "Visual roadmaps for every role", url: "https://roadmap.sh",          color: "#79a3b1" },
  { name: "Coursera",      icon: "🎓", desc: "Courses from top universities",  url: "https://coursera.org",        color: "#b07bac" },
];

const CS_ROADMAP = [
  { year: "1st Year", color: "#81b29a", focus: "Foundations", items: ["Learn C / Python / Java basics", "Understand how computers work", "Build small CLI programs", "Get comfortable with VS Code & Terminal"] },
  { year: "2nd Year", color: "#79a3b1", focus: "Problem Solving", items: ["Study Data Structures & Algorithms", "Solve 100+ LeetCode Easy/Medium problems", "Build 1–2 mini projects (a calculator, a to-do app)", "Make your first GitHub account and commit code"] },
  { year: "3rd Year", color: "#b07bac", focus: "Specialise + Intern", items: ["Pick a track: Web Dev / App Dev / AI-ML / Cloud", "Build a portfolio project you're actually proud of", "Apply for internships aggressively (even small ones)", "Start preparing for placement aptitude tests"] },
  { year: "4th Year", color: "#e07a5f", focus: "Placement Mode", items: ["DSA revision + mock interviews", "Perfect your resume (1 page, ATS-friendly)", "Research companies and their interview patterns", "Apply broadly — tier 2 companies are also great starts"] },
];

const NONCS_PATHS = [
  {
    path: "Stay in Core",
    emoji: "🏗️",
    color: "#79a3b1",
    suitable: "Mechanical, Civil, EEE, ECE, Chemical…",
    steps: [
      "Build a strong CGPA in your core subjects",
      "Complete internships in your core domain by 3rd year",
      "Target GATE for PSU jobs / M.Tech (GATE score is gold)",
      "Explore core job portals: Naukri, LinkedIn, core company campus drives",
    ],
    resources: [
      { name: "GATE 2026 Prep", url: "https://gatecse.in" },
      { name: "Made Easy", url: "https://madeeasy.in" },
    ],
  },
  {
    path: "Switch to IT / Tech",
    emoji: "💻",
    color: "#b07bac",
    suitable: "Anyone who finds coding interesting!",
    steps: [
      "Start with Python basics — it's beginner-friendly and widely used",
      "Pick ONE path: Web Dev (HTML/CSS/JS) or Data Analytics (Python + Excel + SQL)",
      "Build 2–3 real projects and put them on GitHub",
      "Apply for IT roles — your base branch won't matter with good projects",
    ],
    resources: [
      { name: "Python for Beginners", url: "https://python.org/about/gettingstarted" },
      { name: "Full Stack Roadmap", url: "https://roadmap.sh/full-stack" },
    ],
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function CareerPage() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVis, setQuoteVis] = useState(true);
  const [activeTab, setActiveTab] = useState('cs'); // 'cs' | 'noncs'

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    const t = setInterval(() => {
      setQuoteVis(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVis(true); }, 500);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{
      background: 'linear-gradient(160deg, #eef4fb 0%, #f5f0fa 55%, #fef6ee 100%)',
      minHeight: '100vh',
      paddingBottom: '4rem',
    }}>
      <div className="container" style={{ maxWidth: '860px', paddingTop: '2rem' }}>

        {/* Back */}
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>

        {/* ── Hero ── */}
        <CareerCard mb center style={{ background: 'linear-gradient(135deg, rgba(121,163,177,0.12), rgba(176,123,172,0.12))', border: '1px solid rgba(121,163,177,0.2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👋</div>
          <h1 style={{ fontSize: '2.1rem', background: 'linear-gradient(135deg, #79a3b1, #b07bac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem' }}>
            Career Guidance Center
          </h1>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
              Hey! If you're here feeling confused about your career — <strong>that's completely normal.</strong> Everyone feels this way in college. The difference is just whether you take small steps now or wait until panic hits in 3rd year.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
              This page is not textbook advice. It's what a senior would actually tell you over a cup of chai ☕ — honest, no-fluff, and actionable.
            </p>
          </div>
        </CareerCard>

        {/* ── Rotating Quote ── */}
        <CareerCard mb center>
          <div style={{ opacity: quoteVis ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>💬</div>
            <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.75, margin: '0 0 0.4rem' }}>
              &ldquo;{QUOTES[quoteIdx].text}&rdquo;
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{QUOTES[quoteIdx].author}</p>
          </div>
        </CareerCard>

        {/* ── Tab Switcher ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'cs',    label: '💻 I am a CS / IT Student',  desc: 'Dev, DSA, placements' },
            { id: 'noncs', label: '🔧 I am a Non-CS Student',   desc: 'Core vs IT switch' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, minWidth: '200px', padding: '1rem 1.5rem', borderRadius: '16px', cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #79a3b1, #b07bac)' : 'rgba(255,255,255,0.7)',
              color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
              boxShadow: activeTab === tab.id ? '0 4px 20px rgba(121,163,177,0.35)' : '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.25s', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tab.label}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '0.2rem' }}>{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* ══════════════ CS / IT SECTION ══════════════ */}
        {activeTab === 'cs' && (
          <div className="fade-in">

            {/* What to focus on */}
            <CareerCard mb>
              <SectionTitle icon="🎯" title="What Should You Focus On?" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                CS is vast. You can't do everything. Here's a senior's honest priority list:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { rank: "01", title: "Programming Basics", desc: "Pick ONE language. Python or Java. Get solid before jumping to the next.", color: "#79a3b1", emoji: "⌨️" },
                  { rank: "02", title: "DSA", desc: "90% of tech interviews are DSA. Start early, solve daily. No shortcut.", color: "#e07a5f", emoji: "🧩" },
                  { rank: "03", title: "Build Projects", desc: "A real project > 10 certificates. Put it on GitHub. Talk about it confidently.", color: "#81b29a", emoji: "🏗️" },
                  { rank: "04", title: "Pick a Domain", desc: "Web Dev / App Dev / AI-ML / Cloud. Go deep on one, not shallow on all.", color: "#b07bac", emoji: "🚀" },
                ].map(item => (
                  <div key={item.rank} style={{ padding: '1.1rem', borderRadius: '14px', background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{item.emoji}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: item.color, marginBottom: '0.25rem', letterSpacing: '1px' }}>PRIORITY {item.rank}</div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem', fontSize: '0.9rem' }}>{item.title}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </CareerCard>

            {/* Year-by-year roadmap */}
            <CareerCard mb>
              <SectionTitle icon="🗺️" title="Year-by-Year Roadmap" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Don't panic — here's a realistic, achievable plan for your four years:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {CS_ROADMAP.map((y, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${y.color}20`, border: `2px solid ${y.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: y.color }}>{y.year}</span>
                      </div>
                      {i < CS_ROADMAP.length - 1 && <div style={{ width: '2px', height: '20px', background: 'var(--border-color)', margin: '4px 0' }} />}
                    </div>
                    <div style={{ paddingBottom: i < CS_ROADMAP.length - 1 ? '0.5rem' : 0 }}>
                      <p style={{ fontWeight: 700, color: y.color, margin: '0 0 0.4rem', fontSize: '0.9rem' }}>→ {y.focus}</p>
                      <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
                        {y.items.map(item => (
                          <li key={item} style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginBottom: '0.3rem', lineHeight: 1.55 }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CareerCard>

            {/* Resource platforms */}
            <CareerCard mb>
              <SectionTitle icon="🔗" title="Platforms That Actually Help" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Bookmark these. Use them consistently. These are the ones seniors actually recommend:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                {CS_PLATFORMS.map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '0.9rem 1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${p.color}25`; e.currentTarget.style.borderColor = p.color; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{p.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, color: p.color, margin: '0 0 0.15rem', fontSize: '0.9rem' }}>{p.name} ↗</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>{p.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CareerCard>

            {/* Resume & Interview cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <CareerCard>
                <SectionTitle icon="📝" title="Resume Tips" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    ["1 page", "For freshers, always. No exception."],
                    ["Projects first", "Put your best project above education."],
                    ["Action verbs", "Built, Developed, Designed, Improved…"],
                    ["Quantify", "\"Reduced load time by 40%\" > \"Improved performance\""],
                    ["No photo", "Most top companies use ATS — photos get filtered."],
                  ].map(([bold, rest]) => (
                    <div key={bold} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                      <span style={{ color: '#81b29a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span><strong style={{ color: 'var(--text-primary)' }}>{bold}</strong> — {rest}</span>
                    </div>
                  ))}
                </div>
              </CareerCard>

              <CareerCard>
                <SectionTitle icon="🗣️" title="Interview Preparation" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    ["STAR method", "Situation → Task → Action → Result. Use this always."],
                    ["Know your projects", "You WILL be grilled on everything on your resume."],
                    ["Company research", "Know what they do, who their users are."],
                    ["Mock interviews", "Ask a friend. Record yourself. It's uncomfortable but works."],
                    ["Ask questions", "\"What does a typical day look like?\" shows genuine interest."],
                  ].map(([bold, rest]) => (
                    <div key={bold} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                      <span style={{ color: '#79a3b1', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span><strong style={{ color: 'var(--text-primary)' }}>{bold}</strong> — {rest}</span>
                    </div>
                  ))}
                </div>
              </CareerCard>
            </div>
          </div>
        )}

        {/* ══════════════ NON-CS SECTION ══════════════ */}
        {activeTab === 'noncs' && (
          <div className="fade-in">

            {/* Reassurance banner */}
            <div style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(129,178,154,0.15), rgba(121,163,177,0.15))', border: '1px solid rgba(129,178,154,0.3)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🙌</div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
                Your branch does <span style={{ color: '#81b29a', textDecoration: 'underline', textDecorationStyle: 'wavy' }}>NOT</span> limit your future.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.7 }}>
                Mechanical students become software engineers. ECE students go into AI. Civil students build apps. It happens <em>all the time</em>. What matters is what you <strong>do</strong>, not what your degree says.
              </p>
            </div>

            {/* Two paths */}
            <SectionTitle icon="🛣️" title="You Have Two Clear Paths — Choose One:" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Neither is wrong. Both are valid. But you need to <strong>pick one and commit</strong> instead of doing both half-heartedly.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {NONCS_PATHS.map(path => (
                <div key={path.path} style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: `1.5px solid ${path.color}40`, boxShadow: `0 4px 20px ${path.color}15` }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{path.emoji}</div>
                  <h3 style={{ color: path.color, margin: '0 0 0.3rem', fontSize: '1rem' }}>Option: {path.path}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 1rem', fontStyle: 'italic' }}>Best for: {path.suitable}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {path.steps.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${path.color}25`, border: `1.5px solid ${path.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: path.color, flexShrink: 0 }}>{i + 1}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', margin: 0, lineHeight: 1.6 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.4rem' }}>Useful Resources:</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {path.resources.map(r => (
                        <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', padding: '0.25rem 0.7rem', borderRadius: '20px', background: `${path.color}15`, color: path.color, border: `1px solid ${path.color}35`, textDecoration: 'none', fontWeight: 500 }}>
                          {r.name} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Non-CS Resume tips */}
            <CareerCard mb>
              <SectionTitle icon="📝" title="Resume Tip for Non-CS Students Targeting IT" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {[
                  { emoji: "🔬", tip: "Highlight transferable skills", desc: "Problem-solving, data analysis, and project management matter in IT too." },
                  { emoji: "🏗️", tip: "Lead with projects", desc: "A working web app you built matters more than your core subject marks." },
                  { emoji: "📊", tip: "Add a technical skills section", desc: "List: Python, SQL, HTML/CSS, Excel — even beginner-level skills count." },
                  { emoji: "🤝", tip: "Tell your story", desc: "\"Mechanical engineer who taught himself to code\" is actually a compelling narrative." },
                ].map(item => (
                  <div key={item.tip} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.55)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{item.emoji}</div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '0.85rem' }}>{item.tip}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </CareerCard>
          </div>
        )}

        {/* ── Reality Check (always visible) ── */}
        <CareerCard mb style={{ background: 'linear-gradient(135deg, rgba(240,165,0,0.08), rgba(224,122,95,0.08))', border: '1px solid rgba(240,165,0,0.25)' }}>
          <SectionTitle icon="🔔" title="Reality Check — Honest Talk" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { icon: "🚫", text: "Stop comparing yourself to that one person in your class who seems to know everything. They started earlier, not smarter. You can catch up." },
              { icon: "⏰", text: "1–2 focused hours per day is genuinely enough. You don't need to grind 10 hours. You need to show up consistently every day." },
              { icon: "🐢", text: "Slow progress is still progress. The person who learns consistently for 6 months always beats the one who crammed for 2 weeks before placements." },
              { icon: "💡", text: "Nobody knows everything. Even seniors Google things daily. The skill is learning how to find answers, not memorising them." },
              { icon: "📵", text: "Stop collecting courses. You don't need 5 more certifications. Pick ONE resource > and finish it > then build something." },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.55)', borderRadius: '12px', border: '1px solid rgba(240,165,0,0.2)' }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.7 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </CareerCard>

        {/* ── Study Strategy ── */}
        <CareerCard mb>
          <SectionTitle icon="🧠" title="Study Smarter, Not Harder" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {[
              { emoji: "🍅", name: "Pomodoro Technique", desc: "25 min deep focus → 5 min break. Repeat 4 times, then take a long break. Your brain works in cycles." },
              { emoji: "✏️", name: "Active Recall", desc: "Close your notes and try to recall from memory. This beats re-reading by 3x for retention." },
              { emoji: "📓", name: "Teaching Others", desc: "Explain what you learned to a friend or even yourself. If you can teach it, you know it." },
              { emoji: "🌙", name: "Sleep First", desc: "Memory consolidation happens during sleep. Cramming at 3am replaces sleep with nothing." },
            ].map(s => (
              <div key={s.name} style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.55)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{s.emoji}</div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem', fontSize: '0.85rem' }}>{s.name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </CareerCard>

        {/* ── Closing Motivation ── */}
        <CareerCard center style={{ background: 'linear-gradient(135deg, rgba(121,163,177,0.12), rgba(176,123,172,0.12))', border: '1px solid rgba(176,123,172,0.2)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚀</div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontSize: '1.25rem' }}>You just need to start.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 0.75rem' }}>
            Not after exams. Not on Monday. <strong>Today.</strong> Learn one concept. Write 10 lines of code. Open that tab you've been putting off for a week.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            It doesn't have to be perfect. It doesn't have to be fast. It just has to start. Small, consistent actions compound into results that genuinely surprise you.
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b07bac', margin: 0 }}>
            Future you will thank you. 💙
          </p>
        </CareerCard>

      </div>
    </main>
  );
}

// ── Reusable components ───────────────────────────────────────────────────────
function CareerCard({ children, mb, center, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.9)',
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
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );
}
