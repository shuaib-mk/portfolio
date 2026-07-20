import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * WORLD.PORTFOLIO — a modern, minimalist developer portfolio
 * inspired by the systems of block-based sandbox games:
 * the hotbar, the crafting grid, the debug HUD, the advancement toast.
 * No copyrighted art, fonts, or logos are used — every visual is
 * an original abstraction of the underlying *idea* (blocks, slots, coordinates).
 *
 * Edit the DATA section below to make this yours.
 */

/* ----------------------------- DATA ----------------------------- */

const PROFILE = {
    name: "Alex Voss",
    role: "Full-Stack Developer",
    tagline:
        "I build reliable, well-lit software — the kind you can find your way around at night.",
    location: "Remote / UTC+5:30",
    email: "hello@alexvoss.dev",
};

const NAV_ITEMS = [
    { id: "home", label: "Home", mark: "◆" },
    { id: "about", label: "About", mark: "▲" },
    { id: "skills", label: "Skills", mark: "■" },
    { id: "projects", label: "Projects", mark: "▶" },
    { id: "contact", label: "Contact", mark: "✉" },
];

const ACHIEVEMENTS = [
    { title: "Shipped 20+ Projects", detail: "Production apps, not just demos" },
    { title: "Open Source Contributor", detail: "Merged PRs in 6 public repos" },
    { title: "Led a Team of 5", detail: "Shipped a platform rewrite on time" },
    { title: "5 Years Played", detail: "Professional software development" },
];

const SKILL_TIERS = {
    common: "#c9c6ba",
    proficient: "#e0b23c",
    advanced: "#6fd1d9",
    expert: "#c9a6ea",
};

const SKILLS = [
    { name: "React", tier: "expert", note: "Component architecture, hooks, performance tuning" },
    { name: "TypeScript", tier: "expert", note: "Type-safe apps at scale" },
    { name: "Node.js", tier: "advanced", note: "APIs, services, background jobs" },
    { name: "Python", tier: "advanced", note: "Data tooling and automation" },
    { name: "PostgreSQL", tier: "advanced", note: "Schema design, query tuning" },
    { name: "Docker", tier: "proficient", note: "Containerized dev & deploy" },
    { name: "AWS", tier: "proficient", note: "Lambda, S3, RDS, CloudFront" },
    { name: "GraphQL", tier: "proficient", note: "Schema-first API design" },
    { name: "Git", tier: "common", note: "Branching strategy, code review" },
];

const PROJECTS = [
    {
        coord: "0, 0",
        biome: "Plains",
        name: "Marketplace Storefront",
        desc: "A headless e-commerce front end with sub-second search and a custom checkout flow, built for a mid-size retailer.",
        tags: ["React", "Node.js", "Stripe"],
        href: "#",
    },
    {
        coord: "1, 0",
        biome: "Nether",
        name: "Realtime Ops Chat",
        desc: "A low-latency messaging layer for incident response teams, with presence, threads, and audit logging.",
        tags: ["WebSockets", "Redis", "TypeScript"],
        href: "#",
    },
    {
        coord: "0, 1",
        biome: "Ocean",
        name: "Metrics Dashboard",
        desc: "A data visualization suite turning a firehose of product events into decisions teams actually act on.",
        tags: ["Python", "PostgreSQL", "D3"],
        href: "#",
    },
    {
        coord: "-1, 0",
        biome: "Mountains",
        name: "Trail Fitness App",
        desc: "A mobile-first training tracker with offline-first sync for runners without reliable signal.",
        tags: ["React Native", "GraphQL"],
        href: "#",
    },
    {
        coord: "0, -1",
        biome: "Cave",
        name: "Internal CLI Toolkit",
        desc: "A developer-facing command line tool that cut environment setup time from an afternoon to four minutes.",
        tags: ["Node.js", "AWS"],
        href: "#",
    },
];

/* --------------------------- COMPONENT --------------------------- */

export default function MinecraftPortfolio() {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState("home");
    const [coords, setCoords] = useState({ x: 0, y: 70, z: 0 });
    const [tooltip, setTooltip] = useState(null);

    const sectionRefs = useRef({});
    const containerRef = useRef(null);

    // world-gen loading sequence
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            setProgress(100);
            setLoaded(true);
            return;
        }
        let raf;
        const start = performance.now();
        const duration = 1200;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            setProgress(Math.round(t * 100));
            if (t < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                setTimeout(() => setLoaded(true), 220);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    // debug-HUD coordinate tracking
    const handlePointerMove = useCallback((e) => {
        const x = (e.clientX / window.innerWidth) * 200 - 100;
        const z = (e.clientY / window.innerHeight) * 200 - 100;
        setCoords((c) => ({ ...c, x: x.toFixed(1), z: z.toFixed(1) }));
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const depth = window.scrollY;
            const y = Math.max(-64, 70 - depth * 0.05);
            setCoords((c) => ({ ...c, y: y.toFixed(1) }));

            const entries = Object.entries(sectionRefs.current);
            let current = "home";
            let bestTop = -Infinity;
            for (const [id, el] of entries) {
                if (!el) continue;
                const top = el.getBoundingClientRect().top;
                if (top <= 140 && top > bestTop) {
                    bestTop = top;
                    current = id;
                }
            }
            setActive(current);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const setRef = (id) => (el) => {
        sectionRefs.current[id] = el;
    };

    return (
        <div className="wp-root" onMouseMove={handlePointerMove} ref={containerRef}>
            <style>{CSS}</style>

            {/* world-gen loader */}
            <div className={`wp-loader ${loaded ? "wp-loader--done" : ""}`} aria-hidden={loaded}>
                <div className="wp-loader-inner">
                    <div className="wp-loader-label">GENERATING WORLD</div>
                    <div className="wp-loader-bar">
                        <div className="wp-loader-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="wp-loader-pct">{progress}%</div>
                </div>
            </div>

            {/* debug HUD */}
            <div className="wp-hud" aria-hidden="true">
                <div>X: {coords.x}</div>
                <div>Y: {coords.y}</div>
                <div>Z: {coords.z}</div>
            </div>

            {/* HERO */}
            <section id="home" ref={setRef("home")} className="wp-section wp-hero">
                <div className="wp-eyebrow">SPAWN POINT</div>
                <h1 className="wp-display">
                    {PROFILE.name}
                </h1>
                <p className="wp-role">{PROFILE.role}</p>
                <p className="wp-tagline">{PROFILE.tagline}</p>
                <div className="wp-hero-actions">
                    <button className="wp-btn wp-btn--primary" onClick={() => scrollTo("projects")}>
                        View Projects
                    </button>
                    <button className="wp-btn wp-btn--ghost" onClick={() => scrollTo("contact")}>
                        Get in Touch
                    </button>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" ref={setRef("about")} className="wp-section">
                <div className="wp-section-head">
                    <div className="wp-eyebrow">ABOUT</div>
                    <h2 className="wp-h2">Player Profile</h2>
                </div>
                <div className="wp-about-grid">
                    <div className="wp-about-text">
                        <p>
                            I'm a full-stack developer who cares more about how software behaves at 2am
                            during an incident than how it looks in a demo. I've spent the last five
                            years building products end to end — from schema design to the pixel the
                            user actually taps.
                        </p>
                        <p>
                            I like small, well-tested modules over clever ones, clear naming over
                            clever naming, and shipping over polishing forever. Outside of work I'm
                            usually mapping out side projects I'll definitely finish this time.
                        </p>
                    </div>
                    <div className="wp-stats-card">
                        <div className="wp-stats-title">Advancements</div>
                        <ul className="wp-advancements">
                            {ACHIEVEMENTS.map((a) => (
                                <li key={a.title} className="wp-advancement">
                                    <span className="wp-advancement-icon" />
                                    <span>
                                        <strong>{a.title}</strong>
                                        <em>{a.detail}</em>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* SKILLS */}
            <section id="skills" ref={setRef("skills")} className="wp-section">
                <div className="wp-section-head">
                    <div className="wp-eyebrow">SKILLS</div>
                    <h2 className="wp-h2">Hotbar</h2>
                    <p className="wp-section-sub">Hover a slot for details. Color marks proficiency.</p>
                </div>
                <div className="wp-hotbar-grid">
                    {SKILLS.map((s, i) => (
                        <button
                            key={s.name}
                            className="wp-slot"
                            onMouseEnter={() => setTooltip(s.name)}
                            onMouseLeave={() => setTooltip(null)}
                            onFocus={() => setTooltip(s.name)}
                            onBlur={() => setTooltip(null)}
                        >
                            <span className="wp-slot-index">{i + 1}</span>
                            <span
                                className="wp-slot-icon"
                                style={{ background: SKILL_TIERS[s.tier] }}
                            />
                            <span className="wp-slot-name">{s.name}</span>
                            {tooltip === s.name && (
                                <div className="wp-tooltip">
                                    <div className="wp-tooltip-name" style={{ color: SKILL_TIERS[s.tier] }}>
                                        {s.name}
                                    </div>
                                    <div className="wp-tooltip-tier">{s.tier}</div>
                                    <div className="wp-tooltip-note">{s.note}</div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* PROJECTS */}
            <section id="projects" ref={setRef("projects")} className="wp-section">
                <div className="wp-section-head">
                    <div className="wp-eyebrow">PROJECTS</div>
                    <h2 className="wp-h2">Explored Chunks</h2>
                </div>
                <div className="wp-projects-grid">
                    {PROJECTS.map((p) => (
                        <a href={p.href} key={p.name} className="wp-project-card">
                            <div className="wp-project-top">
                                <span className="wp-project-coord">CHUNK [{p.coord}]</span>
                                <span className="wp-project-biome">{p.biome}</span>
                            </div>
                            <h3 className="wp-project-name">{p.name}</h3>
                            <p className="wp-project-desc">{p.desc}</p>
                            <div className="wp-project-tags">
                                {p.tags.map((t) => (
                                    <span key={t} className="wp-tag">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <span className="wp-project-link">Open project →</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* CONTACT */}
            <section id="contact" ref={setRef("contact")} className="wp-section wp-contact">
                <div className="wp-section-head">
                    <div className="wp-eyebrow">CONTACT</div>
                    <h2 className="wp-h2">Crafting Table</h2>
                    <p className="wp-section-sub">
                        Combine a name, an email, and a message — the recipe produces a reply.
                    </p>
                </div>
                <div className="wp-contact-grid">
                    <div className="wp-craft-grid" aria-hidden="true">
                        {Array.from({ length: 9 }).map((_, i) => {
                            const filled = [0, 4, 8].includes(i);
                            const label = i === 0 ? "Name" : i === 4 ? "Email" : i === 8 ? "Message" : null;
                            return (
                                <div key={i} className={`wp-craft-slot ${filled ? "wp-craft-slot--filled" : ""}`}>
                                    {label && <span className="wp-craft-slot-label">{label}</span>}
                                </div>
                            );
                        })}
                        <div className="wp-craft-arrow">→</div>
                        <div className="wp-craft-output">✉</div>
                    </div>

                    <form
                        className="wp-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const mailto = `mailto:${PROFILE.email}`;
                            window.location.href = mailto;
                        }}
                    >
                        <label className="wp-field">
                            <span>Name</span>
                            <input type="text" name="name" required placeholder="Your name" />
                        </label>
                        <label className="wp-field">
                            <span>Email</span>
                            <input type="email" name="email" required placeholder="you@example.com" />
                        </label>
                        <label className="wp-field">
                            <span>Message</span>
                            <textarea name="message" rows={4} required placeholder="What are you building?" />
                        </label>
                        <button type="submit" className="wp-btn wp-btn--primary wp-btn--wide">
                            Send Message
                        </button>
                    </form>
                </div>
            </section>

            <footer className="wp-footer">
                <span>{PROFILE.location}</span>
                <span>{PROFILE.email}</span>
            </footer>

            {/* HOTBAR NAV */}
            <nav className="wp-nav" aria-label="Section navigation">
                <div className="wp-nav-inner">
                    {NAV_ITEMS.map((item, i) => (
                        <button
                            key={item.id}
                            className={`wp-nav-slot ${active === item.id ? "wp-nav-slot--active" : ""}`}
                            onClick={() => scrollTo(item.id)}
                            aria-current={active === item.id}
                        >
                            <span className="wp-nav-num">{i + 1}</span>
                            <span className="wp-nav-mark">{item.mark}</span>
                            <span className="wp-nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}

/* ------------------------------ CSS ------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #17191a;
  --bg-raised: #1f2220;
  --bg-raised-2: #262a27;
  --line: rgba(236,232,221,0.12);
  --bone: #ece8dd;
  --muted: #9a998f;
  --grass: #5d9c4b;
  --redstone: #c4402b;
  --gold: #e0b23c;
  --diamond: #6fd1d9;
}

.wp-root {
  background: var(--bg);
  color: var(--bone);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
.wp-root * { box-sizing: border-box; }
.wp-root a { color: inherit; text-decoration: none; }
.wp-root button { font-family: inherit; cursor: pointer; }

.wp-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--grass);
  margin-bottom: 12px;
}
.wp-display {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(2.6rem, 8vw, 5rem);
  line-height: 1.02;
  letter-spacing: -0.01em;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}
.wp-h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.wp-section-sub { color: var(--muted); margin: 8px 0 0 0; font-size: 14px; }

.wp-loader {
  position: fixed; inset: 0; z-index: 100;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.6s ease;
}
.wp-loader--done { opacity: 0; pointer-events: none; }
.wp-loader-inner { text-align: center; width: 280px; }
.wp-loader-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; letter-spacing: 0.2em; color: var(--muted); margin-bottom: 16px;
}
.wp-loader-bar {
  height: 6px; background: var(--bg-raised); border: 1px solid var(--line); width: 100%;
}
.wp-loader-fill { height: 100%; background: var(--grass); transition: width 0.05s linear; }
.wp-loader-pct {
  font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--muted); margin-top: 10px;
}

.wp-hud {
  position: fixed; top: 18px; left: 18px; z-index: 40;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: rgba(236,232,221,0.55);
  background: rgba(23,25,26,0.6);
  border: 1px solid var(--line);
  padding: 8px 10px;
  line-height: 1.6;
  backdrop-filter: blur(2px);
  pointer-events: none;
}
@media (max-width: 640px) { .wp-hud { display: none; } }

.wp-section {
  max-width: 1080px;
  margin: 0 auto;
  padding: 120px 32px;
  position: relative;
}
.wp-section-head { margin-bottom: 48px; }

.wp-hero {
  min-height: 92vh;
  display: flex; flex-direction: column; justify-content: center;
  padding-top: 80px;
}
.wp-role {
  font-family: 'JetBrains Mono', monospace;
  color: var(--gold); font-size: 16px; margin: 0 0 20px 0;
}
.wp-tagline { color: var(--muted); font-size: 18px; max-width: 520px; line-height: 1.6; margin: 0 0 36px 0; }
.wp-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

.wp-btn {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 14px 24px;
  border-radius: 0;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--bone);
  transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
}
.wp-btn:hover { transform: translateY(-2px); border-color: var(--gold); }
.wp-btn:focus-visible { outline: 2px solid var(--diamond); outline-offset: 2px; }
.wp-btn--primary { background: var(--grass); border-color: var(--grass); color: #12140f; }
.wp-btn--primary:hover { background: #6cad57; border-color: #6cad57; }
.wp-btn--wide { width: 100%; }

.wp-about-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 48px; }
.wp-about-text p { color: var(--muted); line-height: 1.75; font-size: 16px; margin: 0 0 18px 0; }

.wp-stats-card {
  background: var(--bg-raised);
  border: 1px solid var(--line);
  padding: 24px;
}
.wp-stats-title {
  font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.14em;
  color: var(--diamond); margin-bottom: 18px;
}
.wp-advancements { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.wp-advancement { display: flex; gap: 12px; align-items: flex-start; }
.wp-advancement-icon {
  width: 20px; height: 20px; flex: none; margin-top: 2px;
  background: var(--bg-raised-2); border: 1px solid var(--gold);
}
.wp-advancement strong { display: block; font-size: 14px; font-weight: 600; }
.wp-advancement em { display: block; font-style: normal; font-size: 12px; color: var(--muted); margin-top: 2px; }

.wp-hotbar-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
}
@media (max-width: 900px) { .wp-hotbar-grid { grid-template-columns: repeat(3, 1fr); } }
.wp-slot {
  position: relative;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  padding: 16px 10px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: var(--bone);
}
.wp-slot:hover, .wp-slot:focus-visible { border-color: var(--gold); }
.wp-slot:focus-visible { outline: none; }
.wp-slot-index {
  position: absolute; top: 4px; left: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted);
}
.wp-slot-icon { width: 22px; height: 22px; }
.wp-slot-name { font-size: 12px; font-family: 'JetBrains Mono', monospace; }
.wp-tooltip {
  position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
  background: #0e0f0e; border: 1px solid var(--gold);
  padding: 10px 14px; width: 200px; text-align: left; z-index: 20;
}
.wp-tooltip-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; }
.wp-tooltip-tier { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); text-transform: uppercase; margin: 2px 0 6px 0; }
.wp-tooltip-note { font-size: 12px; color: var(--muted); line-height: 1.5; }

.wp-projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 720px) { .wp-projects-grid { grid-template-columns: 1fr; } }
.wp-project-card {
  display: block;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  padding: 24px;
  transition: border-color 0.12s ease, transform 0.12s ease;
}
.wp-project-card:hover { border-color: var(--diamond); transform: translateY(-2px); }
.wp-project-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.wp-project-coord { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); }
.wp-project-biome {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--grass);
  border: 1px solid var(--line); padding: 2px 8px;
}
.wp-project-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; margin: 0 0 8px 0; }
.wp-project-desc { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
.wp-project-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.wp-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--gold); border: 1px solid var(--line); padding: 3px 8px; }
.wp-project-link { font-size: 13px; font-weight: 600; color: var(--diamond); }

.wp-contact-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; align-items: start; }
@media (max-width: 800px) { .wp-contact-grid { grid-template-columns: 1fr; } }
.wp-craft-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 56px);
  grid-template-rows: repeat(3, 56px);
  gap: 6px;
  padding: 20px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  width: fit-content;
}
.wp-craft-slot {
  background: var(--bg-raised-2);
  box-shadow: inset 0 0 0 1px var(--line);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.wp-craft-slot--filled { box-shadow: inset 0 0 0 1px var(--gold); }
.wp-craft-slot-label {
  position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
  font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--muted); white-space: nowrap;
}
.wp-craft-arrow {
  position: absolute; right: -46px; top: 50%; transform: translateY(-50%);
  font-size: 20px; color: var(--muted);
}
.wp-craft-output {
  position: absolute; right: -100px; top: 50%; transform: translateY(-50%);
  width: 56px; height: 56px;
  background: var(--bg-raised-2); box-shadow: inset 0 0 0 1px var(--diamond);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: var(--diamond);
}
@media (max-width: 800px) {
  .wp-craft-grid { margin: 0 auto 60px auto; }
  .wp-craft-arrow, .wp-craft-output { display: none; }
}

.wp-form { display: flex; flex-direction: column; gap: 18px; }
.wp-field { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--muted); }
.wp-field input, .wp-field textarea {
  font-family: 'Inter', sans-serif;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  color: var(--bone);
  padding: 12px 14px;
  font-size: 14px;
  border-radius: 0;
  resize: vertical;
}
.wp-field input:focus, .wp-field textarea:focus {
  outline: none; border-color: var(--diamond);
}

.wp-footer {
  max-width: 1080px; margin: 0 auto; padding: 40px 32px 160px 32px;
  display: flex; justify-content: space-between;
  font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--muted);
  border-top: 1px solid var(--line);
}

.wp-nav {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  z-index: 50;
}
.wp-nav-inner {
  display: flex; gap: 6px;
  background: rgba(23,25,26,0.85);
  border: 1px solid var(--line);
  padding: 6px;
  backdrop-filter: blur(6px);
}
.wp-nav-slot {
  position: relative;
  width: 56px; height: 56px;
  background: var(--bg-raised);
  border: 1px solid transparent;
  color: var(--bone);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px;
}
.wp-nav-slot:hover { border-color: var(--line); }
.wp-nav-slot:focus-visible { outline: 2px solid var(--diamond); outline-offset: -2px; }
.wp-nav-slot--active { border-color: var(--bone); background: var(--bg-raised-2); }
.wp-nav-num {
  position: absolute; top: 2px; left: 4px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--muted);
}
.wp-nav-mark { font-size: 15px; color: var(--gold); }
.wp-nav-label { font-size: 9px; font-family: 'JetBrains Mono', monospace; color: var(--muted); text-transform: uppercase; }
@media (max-width: 560px) {
  .wp-nav-slot { width: 44px; height: 44px; }
  .wp-nav-label { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .wp-btn:hover, .wp-project-card:hover { transform: none; }
}
`;