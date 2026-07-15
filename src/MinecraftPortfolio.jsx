import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Sky, Stars, Html, Edges } from "@react-three/drei";
import * as THREE from "three";

/* ----------------------------- DATA ----------------------------- */
const PROFILE = {
    name: "q04ti",
    role: "Computer Application Student",
    tagline: "I am a Vibe Coder. Through the sheer power of vibe, I possess an intuitive mastery over every programming language in existence.",
    email: "q04tiofficial@gmail.com",
    github: "https://github.com/q04ti"
};

const ABOUT = {
    bio: "I'm a Computer Application Student whose true superpower is 'vibe coding'. I don't just write syntax; I sync with the architecture of the universe. Give me a keyboard, the right playlist, and any programming language on earth—I will architect flawless, hyper-optimized systems entirely by vibe.",
    github: "https://github.com/q04ti",
    linkedin: "https://linkedin.com/in/q04ti",
};

const SKILLS = [
    { name: "Vibe Coding", tier: "master" },
    { name: "Every Language", tier: "master" },
    { name: "React", tier: "expert" },
    { name: "TypeScript", tier: "expert" },
    { name: "Node.js", tier: "expert" },
    { name: "Python", tier: "expert" },
    { name: "C++", tier: "expert" },
    { name: "Rust", tier: "expert" },
    { name: "Go", tier: "expert" },
];

const PROJECTS = [
    { name: "Marketplace Storefront", desc: "A headless e-commerce front end built with React and Stripe.", biome: "Plains", href: "#" },
    { name: "Realtime Ops Chat", desc: "Low-latency messaging layer using WebSockets and Redis.", biome: "Nether", href: "#" },
    { name: "Metrics Dashboard", desc: "Data visualization suite mapping complex user events.", biome: "Ocean", href: "#" },
    { name: "Trail Fitness App", desc: "Offline-first mobile tracker with GraphQL.", biome: "Mountains", href: "#" },
];

/* ----------------------------- 3D COMPONENTS ----------------------------- */

function Block({ position, type = "grass", scale = [1, 1, 1] }) {
    let color = "#8B5A2B"; 
    let topColor = "#5d9c4b"; 
    
    if (type === "dirt") { topColor = color; }
    if (type === "path") { color = "#8B5A2B"; topColor = "#9b7653"; }
    if (type === "stone") { color = "#7d7d7d"; topColor = "#7d7d7d"; }
    if (type === "wood") { color = "#5c4033"; topColor = "#8b5a2b"; }
    if (type === "leaves") { color = "#3b5e2b"; topColor = "#3b5e2b"; }
    if (type === "gold") { color = "#e0b23c"; topColor = "#e0b23c"; }
    if (type === "diamond") { color = "#6fd1d9"; topColor = "#6fd1d9"; }

    return (
        <mesh position={position} receiveShadow castShadow>
            <boxGeometry args={scale} />
            <meshStandardMaterial attach="material-0" color={color} />
            <meshStandardMaterial attach="material-1" color={color} />
            <meshStandardMaterial attach="material-2" color={topColor} />
            <meshStandardMaterial attach="material-3" color={color} />
            <meshStandardMaterial attach="material-4" color={color} />
            <meshStandardMaterial attach="material-5" color={color} />
            {scale[0] === 1 && scale[1] === 1 && scale[2] === 1 && (
                <Edges scale={1} threshold={15} color="#111" />
            )}
        </mesh>
    );
}

// A detailed tree with smaller, scattered leaf blocks
function Tree({ position, scale = 1 }) {
    const leaves = [];
    for (let x = -1.2; x <= 1.2; x += 0.4) {
        for (let y = 2.2; y <= 4.2; y += 0.4) {
            for (let z = -1.2; z <= 1.2; z += 0.4) {
                const distSq = x*x + (y-3.2)*(y-3.2)*0.8 + z*z;
                if (distSq <= 1.6 && Math.random() > 0.2) {
                    leaves.push(
                        <Block 
                            key={`l_${x}_${y}_${z}`} 
                            position={[x, y, z]} 
                            type="leaves" 
                            scale={[0.4, 0.4, 0.4]} 
                        />
                    );
                }
            }
        }
    }

    return (
        <group position={position} scale={[scale, scale, scale]}>
            <Block position={[0, 0, 0]} type="wood" />
            <Block position={[0, 1, 0]} type="wood" />
            <Block position={[0, 2, 0]} type="wood" />
            <Block position={[0, 3, 0]} type="wood" />
            {leaves}
        </group>
    );
}

// A simple blocky house
function House({ position, rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Walls */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 3]} />
                <meshStandardMaterial color="#dcd3b6" />
                <Edges color="#111" />
            </mesh>
            {/* Door */}
            <mesh position={[0, 0.5, 1.51]} castShadow>
                <boxGeometry args={[0.8, 1.5, 0.1]} />
                <meshStandardMaterial color="#5c4033" />
            </mesh>
            {/* Roof Tier 1 */}
            <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.4, 0.5, 3.4]} />
                <meshStandardMaterial color="#8b5a2b" />
                <Edges color="#111" />
            </mesh>
            {/* Roof Tier 2 */}
            <mesh position={[0, 2.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 0.5, 2]} />
                <meshStandardMaterial color="#8b5a2b" />
                <Edges color="#111" />
            </mesh>
        </group>
    );
}

// World Terrain Generation
function World() {
    const blocks = useMemo(() => {
        const b = [];
        const size = 10; // Reduced to 21x21 grid for better performance
        
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                // Create a basic path cross
                const isPath = (Math.abs(x) <= 1 || Math.abs(z) <= 1) && Math.abs(x) < 8 && Math.abs(z) < 8;
                
                b.push(<Block key={`${x}_${z}`} position={[x, -0.5, z]} type={isPath ? "path" : "grass"} />);
                
                // Add some random trees, but not on the path or near the center
                if (!isPath && Math.random() > 0.96 && Math.abs(x) > 3 && Math.abs(z) > 3) {
                    const treeScale = 0.6 + Math.random() * 0.6;
                    b.push(<Tree key={`tree_${x}_${z}`} position={[x, 0.5, z]} scale={treeScale} />);
                }
            }
        }
        return b;
    }, []);

    return (
        <group>
            {/* Infinite grassy plains to hide the edge of the grid */}
            <mesh position={[0, -0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#5d9c4b" />
            </mesh>
            {blocks}
            
            {/* Add some houses for the villagers */}
            <House position={[-6, 0, -9]} rotation={[0, 0, 0]} />
            <House position={[9, 0, 6]} rotation={[0, -Math.PI / 2, 0]} />
            <House position={[-6, 0, 9]} rotation={[0, Math.PI, 0]} />
        </group>
    );
}

// Blocky Villager NPC Component
function Villager({ position, roleColor = "#5c4033", facing = 0 }) {
    const skinColor = "#e8b28a";
    return (
        <group position={position} rotation={[0, facing, 0]}>
            {/* Legs */}
            <mesh position={[0, 0.375, 0]} castShadow>
                <boxGeometry args={[0.5, 0.75, 0.5]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>
            {/* Torso/Robe */}
            <mesh position={[0, 1.125, 0]} castShadow>
                <boxGeometry args={[0.6, 0.75, 0.6]} />
                <meshStandardMaterial color={roleColor} />
            </mesh>
            {/* Arms (crossed) */}
            <mesh position={[0, 1.1, 0.35]} castShadow>
                <boxGeometry args={[0.8, 0.3, 0.3]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Nose */}
            <mesh position={[0, 1.6, 0.45]} castShadow>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
        </group>
    );
}

// Data for NPC locations
const NPCS = [
    { id: 1, type: "Guide", roleColor: "#5c4033", pos: [0, 0, -2], facing: 0 },
    { id: 2, type: "Librarian", roleColor: "#e6e6e6", pos: [-6, 0, -6], facing: Math.PI / 4 },
    { id: 3, type: "Blacksmith", roleColor: "#333333", pos: [6, 0, 6], facing: -Math.PI * 0.75 },
    { id: 4, type: "Cleric", roleColor: "#6c358f", pos: [-6, 0, 6], facing: Math.PI * 0.75 }
];

function Scene({ activeSection, setActiveSection }) {
    const controlsRef = useRef();

    useEffect(() => {
        if (!controlsRef.current) return;
        
        const targetNPC = NPCS.find(n => n.id === activeSection);
        if (targetNPC) {
            const [tx, ty, tz] = targetNPC.pos;
            // Fly the camera slightly in front and above the villager, looking at their face
            const angle = targetNPC.facing;
            const distance = 4;
            const cx = tx + Math.sin(angle) * distance;
            const cz = tz + Math.cos(angle) * distance;
            const cy = ty + 2.5;

            controlsRef.current.setLookAt(cx, cy, cz, tx, ty + 1.5, tz, true);
        }
    }, [activeSection]);

    return (
        <>
            <color attach="background" args={['#87CEEB']} />
            <fog attach="fog" args={['#87CEEB', 15, 45]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[15, 20, 10]} intensity={1.5} castShadow />
            <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <World />
            
            {/* 1. Home Villager (Guide) */}
            <group
                onClick={(e) => { e.stopPropagation(); setActiveSection(1); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <Villager position={NPCS[0].pos} roleColor={NPCS[0].roleColor} facing={NPCS[0].facing} />
                <Html position={[NPCS[0].pos[0], NPCS[0].pos[1] + 3, NPCS[0].pos[2]]} center distanceFactor={10} style={{ opacity: activeSection === 1 ? 1 : 0.2, transition: 'opacity 0.3s' }}>
                    <div className="villager-dialog">
                        <h3>{PROFILE.name}</h3>
                        <p>{PROFILE.role}</p>
                        <p><em>"{PROFILE.tagline}"</em></p>
                        <a href={`mailto:${PROFILE.email}`} className="wp-btn wp-hire-btn">Hire Me</a>
                    </div>
                </Html>
            </group>

            {/* 2. About Villager (Librarian) */}
            <group
                onClick={(e) => { e.stopPropagation(); setActiveSection(2); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <Villager position={NPCS[1].pos} roleColor={NPCS[1].roleColor} facing={NPCS[1].facing} />
                <Html position={[NPCS[1].pos[0], NPCS[1].pos[1] + 3, NPCS[1].pos[2]]} center distanceFactor={10} style={{ opacity: activeSection === 2 ? 1 : 0.2, transition: 'opacity 0.3s' }}>
                    <div className="villager-dialog about-dialog">
                        <h3>The Librarian says:</h3>
                        <p>{ABOUT.bio}</p>
                        <div className="wp-socials">
                            <a href={ABOUT.github} target="_blank" rel="noreferrer">GitHub</a>
                            <a href={ABOUT.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                            <a href={`mailto:${PROFILE.email}`}>Email</a>
                        </div>
                    </div>
                </Html>
            </group>

            {/* 3. Projects Villager (Blacksmith) */}
            <group
                onClick={(e) => { e.stopPropagation(); setActiveSection(3); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <Villager position={NPCS[2].pos} roleColor={NPCS[2].roleColor} facing={NPCS[2].facing} />
                <Html position={[NPCS[2].pos[0], NPCS[2].pos[1] + 3, NPCS[2].pos[2]]} center distanceFactor={10} style={{ opacity: activeSection === 3 ? 1 : 0.2, transition: 'opacity 0.3s' }}>
                    <div className="villager-dialog projects-dialog">
                        <h3>The Blacksmith says:</h3>
                        <p>"Take a look at the weapons and tools I've forged!"</p>
                        <a href={PROFILE.github} target="_blank" rel="noreferrer" className="wp-btn wp-github-btn">View My GitHub Works</a>
                    </div>
                </Html>
            </group>

            {/* 4. Skills Villager (Cleric) */}
            <group
                onClick={(e) => { e.stopPropagation(); setActiveSection(4); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <Villager position={NPCS[3].pos} roleColor={NPCS[3].roleColor} facing={NPCS[3].facing} />
                <Html position={[NPCS[3].pos[0], NPCS[3].pos[1] + 3, NPCS[3].pos[2]]} center distanceFactor={10} style={{ opacity: activeSection === 4 ? 1 : 0.2, transition: 'opacity 0.3s' }}>
                    <div className="villager-dialog skills-dialog">
                        <h3>The Cleric says:</h3>
                        <p>"Here is my knowledge base... fueled entirely by Vibe Coding."</p>
                        <div className="wp-skills-grid">
                            {SKILLS.map((s) => (
                                <div key={s.name} className="wp-skill-slot">{s.name}</div>
                            ))}
                        </div>
                    </div>
                </Html>
            </group>

            <CameraControls ref={controlsRef} makeDefault minDistance={2} maxDistance={25} maxPolarAngle={Math.PI / 2 + 0.1} />
        </>
    );
}

/* --------------------------- MAIN UI COMPONENT --------------------------- */

export default function MinecraftPortfolio() {
    const [activeSlot, setActiveSlot] = useState(1);

    return (
        <div className="wp-root">
            <style>{CSS}</style>
            
            <div className="canvas-container">
                <Canvas shadows camera={{ position: [0, 5, 5], fov: 55 }}>
                    <Suspense fallback={null}>
                        <Scene activeSection={activeSlot} setActiveSection={setActiveSlot} />
                    </Suspense>
                </Canvas>
                <div className="crosshair">+</div>
            </div>

            <div className="wp-hud">
                <div>Minecraft Portfolio v3.0.0</div>
                <div style={{ marginTop: 10, color: '#e0b23c' }}>Click & Drag to Orbit Freely</div>
                <div style={{ color: '#e0b23c' }}>Use Hotbar to Visit Villagers</div>
            </div>

            <nav className="hotbar-nav">
                <div className="hotbar-inner">
                    <button className={activeSlot === 1 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => setActiveSlot(1)}>
                        <span className="slot-num">1</span>
                        <div className="slot-icon">🏠</div>
                        <span className="slot-label">Guide</span>
                    </button>
                    <button className={activeSlot === 2 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => setActiveSlot(2)}>
                        <span className="slot-num">2</span>
                        <div className="slot-icon">📖</div>
                        <span className="slot-label">Librarian</span>
                    </button>
                    <button className={activeSlot === 3 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => setActiveSlot(3)}>
                        <span className="slot-num">3</span>
                        <div className="slot-icon">⚒️</div>
                        <span className="slot-label">Blacksmith</span>
                    </button>
                    <button className={activeSlot === 4 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => setActiveSlot(4)}>
                        <span className="slot-num">4</span>
                        <div className="slot-icon">✨</div>
                        <span className="slot-label">Cleric</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}

/* ------------------------------ CSS ------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #87CEEB;
  --bone: #ece8dd;
  --grass: #5d9c4b;
  --diamond: #6fd1d9;
  --gold: #e0b23c;
  --border: #333;
}

body { margin: 0; padding: 0; overflow: hidden; background: var(--bg); }

.wp-root {
  color: var(--bone);
  font-family: 'Inter', system-ui, sans-serif;
  height: 100vh; width: 100vw; position: relative;
}

.canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }

.crosshair {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  color: rgba(255,255,255,0.4); font-size: 24px; pointer-events: none;
  font-family: sans-serif; user-select: none;
}

.wp-hud {
  position: absolute; top: 18px; left: 18px; z-index: 40;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.5);
  padding: 10px 14px; line-height: 1.6; border-left: 2px solid var(--grass);
  pointer-events: none; text-shadow: 1px 1px 0 #000;
}

/* Villager Dialogue Boxes */
.villager-dialog {
  background: rgba(20, 20, 20, 0.85);
  border: 3px solid #555;
  border-radius: 4px;
  padding: 20px; color: #fff;
  width: 320px;
  text-shadow: 1px 1px 0 #000;
  pointer-events: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transform: translateY(-20px);
}
.villager-dialog::after {
  content: ''; position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%);
  border-width: 15px 15px 0; border-style: solid; border-color: rgba(20, 20, 20, 0.85) transparent transparent transparent;
}
.villager-dialog h3 { margin: 0 0 12px 0; font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: var(--gold); }
.villager-dialog p { margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #ddd; }

/* About Dialog Specifics */
.about-dialog { width: 360px; }
.wp-socials { display: flex; gap: 12px; }
.wp-socials a {
  color: var(--diamond); text-decoration: none; font-size: 13px;
  border: 2px solid #555; padding: 6px 12px; transition: 0.2s; background: rgba(0,0,0,0.5);
}
.wp-socials a:hover { border-color: var(--diamond); }

/* Projects Dialog Specifics */
.projects-dialog { width: 420px; }
.projects-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.project-mini-card {
  background: rgba(0,0,0,0.6); border: 2px solid #444; padding: 12px;
}
.project-mini-card h4 { margin: 0 0 6px 0; font-size: 14px; color: var(--diamond); font-family: 'Space Grotesk', sans-serif; }
.project-mini-card p { margin: 0; font-size: 12px; color: #bbb; line-height: 1.4; }

/* Buttons */
.wp-btn {
  display: block; margin-top: 16px; padding: 12px 20px;
  background: rgba(0,0,0,0.6); border: 2px solid #555;
  color: white; text-decoration: none; font-family: 'Space Grotesk', sans-serif;
  font-weight: bold; transition: 0.2s; text-align: center; cursor: pointer;
}
.wp-hire-btn { border-color: var(--grass); color: var(--grass); }
.wp-hire-btn:hover { background: var(--grass); color: #000; }

.wp-github-btn { border-color: var(--diamond); color: var(--diamond); }
.wp-github-btn:hover { background: var(--diamond); color: #000; }

/* Skills Dialog Specifics */
.skills-dialog { width: 340px; }
.wp-skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.wp-skill-slot {
  background: rgba(0,0,0,0.6); border: 2px solid #444;
  padding: 8px; text-align: center; font-size: 12px;
  font-family: 'JetBrains Mono', monospace; color: #ccc;
}
.wp-skill-slot:hover { border-color: var(--gold); color: var(--gold); }

/* Hotbar */
.hotbar-nav { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 50; }
.hotbar-inner { display: flex; gap: 4px; background: rgba(0,0,0,0.6); padding: 4px; border: 2px solid #555; }
.hotbar-slot {
  width: 56px; height: 56px; background: rgba(30, 30, 30, 0.8);
  border: 2px solid #333; position: relative; cursor: pointer; color: white;
  transition: border-color 0.1s, transform 0.1s; display: flex; align-items: center; justify-content: center;
}
.hotbar-slot:hover { border-color: #999; }
.hotbar-slot.active { border-color: white; transform: scale(1.05); z-index: 2; box-shadow: 0 0 12px rgba(255,255,255,0.2); }
.slot-num { position: absolute; top: 4px; left: 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; }
.slot-label {
  position: absolute; bottom: -24px; font-size: 12px; font-family: 'JetBrains Mono', monospace;
  opacity: 0; white-space: nowrap; transition: opacity 0.2s; text-shadow: 1px 1px 0 #000; pointer-events: none;
}
.hotbar-slot:hover .slot-label, .hotbar-slot.active .slot-label { opacity: 1; }
.slot-icon { font-size: 22px; }

/* Mobile Compatibility */
@media (max-width: 600px) {
  .villager-dialog, .about-dialog, .projects-dialog, .skills-dialog {
    width: 260px !important;
    padding: 14px !important;
  }
  .villager-dialog h3 { font-size: 16px; margin-bottom: 8px; }
  .villager-dialog p { font-size: 12px; margin-bottom: 12px; }
  .projects-grid { grid-template-columns: 1fr; }
  .wp-skills-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
  .wp-socials { flex-wrap: wrap; justify-content: center; }
  .wp-hud { display: none; } /* Hide debug hud on small screens */
  
  .hotbar-inner { padding: 2px; }
  .hotbar-slot { width: 44px; height: 44px; }
  .slot-icon { font-size: 18px; }
  .slot-label { display: none; } /* Hide hotbar text labels to save space */
  .wp-btn { padding: 10px; font-size: 12px; }
}
`;