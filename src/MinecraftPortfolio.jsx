import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, Sky, Stars, Html, Edges } from "@react-three/drei";
import * as THREE from "three";

/* ----------------------------- DATA ----------------------------- */
const PROFILE = {
    name: "q04ti",
    role: "Computer Application Student",
    tagline: "I possess an intuitive mastery over every programming language in existence.",
    email: "q04tiofficial@gmail.com",
    github: "https://github.com/q04ti"
};

const ABOUT = {
    bio: "I'm a Computer Application Student. I don't just write syntax; I sync with the architecture of the universe. Give me a keyboard, the right playlist, and any programming language on earth—I will architect flawless, hyper-optimized systems.",
    github: "https://github.com/q04ti",
    linkedin: "https://linkedin.com/in/q04ti",
};

const SKILLS = [
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

// Reusable geometries and materials for Blocks
const blockGeo = new THREE.BoxGeometry(1, 1, 1);
const blockGeoSmall = new THREE.BoxGeometry(0.4, 0.4, 0.4);

const createBlockMats = (sideColor, topColor) => [
    new THREE.MeshStandardMaterial({ color: sideColor }), // right
    new THREE.MeshStandardMaterial({ color: sideColor }), // left
    new THREE.MeshStandardMaterial({ color: topColor }),  // top
    new THREE.MeshStandardMaterial({ color: sideColor }), // bottom
    new THREE.MeshStandardMaterial({ color: sideColor }), // front
    new THREE.MeshStandardMaterial({ color: sideColor })  // back
];

const blockMats = {
    grass: createBlockMats("#8B5A2B", "#5d9c4b"),
    dirt: createBlockMats("#8B5A2B", "#8B5A2B"),
    path: createBlockMats("#8B5A2B", "#9b7653"),
    stone: createBlockMats("#7d7d7d", "#7d7d7d"),
    wood: createBlockMats("#5c4033", "#8b5a2b"),
    leaves: createBlockMats("#3b5e2b", "#3b5e2b"),
    gold: createBlockMats("#e0b23c", "#e0b23c"),
    diamond: createBlockMats("#6fd1d9", "#6fd1d9")
};

function Block({ position, type = "grass", scale = [1, 1, 1] }) {
    const isFullSize = scale[0] === 1 && scale[1] === 1 && scale[2] === 1;
    const geo = isFullSize ? blockGeo : blockGeoSmall;
    const mats = blockMats[type] || blockMats.grass;

    return (
        <mesh position={position} receiveShadow castShadow geometry={geo} material={mats}>
            {isFullSize && (
                <Edges scale={1} threshold={15} color="#111" />
            )}
        </mesh>
    );
}

// A detailed tree with smaller, scattered leaf blocks
function Tree({ position, scale = 1 }) {
    const leaves = useMemo(() => {
        const l = [];
        for (let x = -1.2; x <= 1.2; x += 0.4) {
            for (let y = 2.2; y <= 4.2; y += 0.4) {
                for (let z = -1.2; z <= 1.2; z += 0.4) {
                    const distSq = x*x + (y-3.2)*(y-3.2)*0.8 + z*z;
                    if (distSq <= 1.6 && Math.random() > 0.2) {
                        l.push(
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
        return l;
    }, []);

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

// Reusable geometries and materials for House
const houseBaseGeo = new THREE.BoxGeometry(3, 2, 3);
const houseMat1 = new THREE.MeshStandardMaterial({ color: "#dcd3b6" });
const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
const doorMat = new THREE.MeshStandardMaterial({ color: "#5c4033" });
const roof1Geo = new THREE.BoxGeometry(3.4, 0.5, 3.4);
const roofMat = new THREE.MeshStandardMaterial({ color: "#8b5a2b" });
const roof2Geo = new THREE.BoxGeometry(2, 0.5, 2);

function House({ position, rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Walls */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow geometry={houseBaseGeo} material={houseMat1}>
                <Edges color="#111" />
            </mesh>
            {/* Door */}
            <mesh position={[0, 0.5, 1.51]} castShadow geometry={doorGeo} material={doorMat} />
            {/* Roof Tier 1 */}
            <mesh position={[0, 2.25, 0]} castShadow receiveShadow geometry={roof1Geo} material={roofMat}>
                <Edges color="#111" />
            </mesh>
            {/* Roof Tier 2 */}
            <mesh position={[0, 2.75, 0]} castShadow receiveShadow geometry={roof2Geo} material={roofMat}>
                <Edges color="#111" />
            </mesh>
        </group>
    );
}

function InstancedTerrain({ positions, geo, mats }) {
    const meshRef = useRef();
    
    useEffect(() => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        positions.forEach((pos, i) => {
            dummy.position.set(pos[0], pos[1], pos[2]);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions]);

    return (
        <instancedMesh ref={meshRef} args={[geo, mats, positions.length]} receiveShadow castShadow />
    );
}

function getTerrainHeight(x, z) {
    const distFromCenter = Math.sqrt(x*x + z*z);
    if (distFromCenter < 12) return -0.5; // Keep village center flat

    let y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 4;
    y += Math.sin(x * 0.05 + z * 0.08) * 3;
    
    const blend = Math.min(1, (distFromCenter - 12) / 10);
    return Math.floor(y * blend) - 0.5; 
}

// World Terrain Generation
function World() {
    const terrainData = useMemo(() => {
        const size = 30; // 61x61 grid (3700+ blocks)
        const blocksByType = { grass: [], path: [], stone: [], dirt: [] };
        const trees = [];
        
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                const y = getTerrainHeight(x, z);
                
                const isPath = (Math.abs(x) <= 1 || Math.abs(z) <= 1) && Math.abs(x) < 8 && Math.abs(z) < 8;
                let type = "grass";
                
                if (isPath) type = "path";
                else if (y > 2) type = "stone";
                
                blocksByType[type].push([x, y, z]);
                
                // Add dirt underneath surface blocks to prevent gaps when hills rise
                if (y > -0.5 && type !== "path") {
                    for (let dy = y - 1; dy >= -0.5; dy--) {
                        blocksByType["dirt"].push([x, dy, z]);
                    }
                }
                
                if (type === "grass" && Math.random() > 0.98 && Math.abs(x) > 4 && Math.abs(z) > 4) {
                    trees.push({ pos: [x, y + 1, z], scale: 0.6 + Math.random() * 0.6 });
                }
            }
        }
        return { blocksByType, trees };
    }, []);

    return (
        <group>
            {/* Deep base ground */}
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#5d9c4b" />
            </mesh>
            
            {Object.entries(terrainData.blocksByType).map(([type, positions]) => (
                positions.length > 0 && (
                    <InstancedTerrain 
                        key={type} 
                        positions={positions} 
                        geo={blockGeo} 
                        mats={blockMats[type] || blockMats.grass} 
                    />
                )
            ))}
            
            {terrainData.trees.map((t, i) => (
                <Tree key={`tree_${i}`} position={t.pos} scale={t.scale} />
            ))}
            
            <House position={[-6, 0, -9]} rotation={[0, 0, 0]} />
            <House position={[9, 0, 6]} rotation={[0, -Math.PI / 2, 0]} />
            <House position={[-6, 0, 9]} rotation={[0, Math.PI, 0]} />
        </group>
    );
}

// Reusable geometries and materials for Villager
const legGeo = new THREE.BoxGeometry(0.5, 0.75, 0.5);
const torsoGeo = new THREE.BoxGeometry(0.6, 0.75, 0.6);
const armGeo = new THREE.BoxGeometry(0.8, 0.3, 0.3);
const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const noseGeo = new THREE.BoxGeometry(0.15, 0.3, 0.15);
const legMat = new THREE.MeshStandardMaterial({ color: "#4a3b32" });
const skinMat = new THREE.MeshStandardMaterial({ color: "#e8b28a" });

function Villager({ position, roleColor = "#5c4033", facing = 0 }) {
    const roleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: roleColor }), [roleColor]);
    const groupRef = useRef();

    useFrame(({ camera }) => {
        if (!groupRef.current) return;
        const dist = camera.position.distanceTo(groupRef.current.position);
        
        if (dist < 15) {
            // Store current rotation
            const currentY = groupRef.current.rotation.y;
            // Look at camera
            groupRef.current.lookAt(camera.position.x, groupRef.current.position.y, camera.position.z);
            let targetY = groupRef.current.rotation.y;
            
            // Fix lookAt rotation wrapping issues
            groupRef.current.rotation.y = currentY; 
            // Lerp to target
            groupRef.current.rotation.y = THREE.MathUtils.lerp(currentY, targetY, 0.1);
        } else {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, facing, 0.05);
        }
    });

    return (
        <group position={position} ref={groupRef}>
            {/* Legs */}
            <mesh position={[0, 0.375, 0]} castShadow geometry={legGeo} material={legMat} />
            {/* Torso/Robe */}
            <mesh position={[0, 1.125, 0]} castShadow geometry={torsoGeo} material={roleMat} />
            {/* Arms (crossed) */}
            <mesh position={[0, 1.1, 0.35]} castShadow geometry={armGeo} material={skinMat} />
            {/* Head */}
            <mesh position={[0, 1.8, 0]} castShadow geometry={headGeo} material={skinMat} />
            {/* Nose */}
            <mesh position={[0, 1.6, 0.45]} castShadow geometry={noseGeo} material={skinMat} />
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
                        <p><strong>Think you can stump me? I dare you to test my skills.</strong></p>
                        <a href={`mailto:${PROFILE.email}`} className="wp-btn wp-hire-btn">Hire & Test Me</a>
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
                        <p>"Here is my knowledge base..."</p>
                        <div className="wp-skills-grid">
                            {SKILLS.map((s) => (
                                <div key={s.name} className="wp-skill-slot">{s.name}</div>
                            ))}
                        </div>
                    </div>
                </Html>
            </group>

            <CameraControls ref={controlsRef} makeDefault minDistance={2} maxDistance={60} maxPolarAngle={Math.PI / 2 + 0.1} />
        </>
    );
}

/* --------------------------- MAIN UI COMPONENT --------------------------- */

// Play a retro "pop" sound using AudioContext
const playClickSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // Ignore audio errors (e.g. strict autoplay policies)
    }
};

export default function MinecraftPortfolio() {
    const [activeSlot, setActiveSlot] = useState(1);

    return (
        <div className="wp-root">
            <style>{CSS}</style>
            
            <div className="canvas-container">
                <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 5, 5], fov: 55 }}>
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
                    <button className={activeSlot === 1 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => { playClickSound(); setActiveSlot(1); }}>
                        <span className="slot-num">1</span>
                        <div className="slot-icon">🏠</div>
                        <span className="slot-label">Guide</span>
                    </button>
                    <button className={activeSlot === 2 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => { playClickSound(); setActiveSlot(2); }}>
                        <span className="slot-num">2</span>
                        <div className="slot-icon">📖</div>
                        <span className="slot-label">Librarian</span>
                    </button>
                    <button className={activeSlot === 3 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => { playClickSound(); setActiveSlot(3); }}>
                        <span className="slot-num">3</span>
                        <div className="slot-icon">⚒️</div>
                        <span className="slot-label">Blacksmith</span>
                    </button>
                    <button className={activeSlot === 4 ? "hotbar-slot active" : "hotbar-slot"} onClick={() => { playClickSound(); setActiveSlot(4); }}>
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
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

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
  background: #c6c6c6;
  border: 4px solid;
  border-color: #ffffff #555555 #555555 #ffffff;
  padding: 20px; color: #333;
  width: 320px;
  pointer-events: auto;
  box-shadow: 8px 8px 0px rgba(0,0,0,0.3);
  transform: translateY(-20px);
}
.villager-dialog::after {
  content: ''; position: absolute; bottom: -19px; left: 50%; transform: translateX(-50%);
  border-width: 15px 15px 0; border-style: solid; border-color: #555555 transparent transparent transparent;
}
.villager-dialog h3 { margin: 0 0 16px 0; font-family: 'Press Start 2P', monospace; font-size: 14px; color: #333; line-height: 1.4; }
.villager-dialog p { margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #222; font-family: 'Inter', sans-serif; }

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
  background: #8b8b8b; border: 2px solid;
  border-color: #373737 #ffffff #ffffff #373737;
  padding: 10px 4px; text-align: center; font-size: 10px;
  font-family: 'Press Start 2P', monospace; color: #fff;
  text-shadow: 2px 2px 0 #3f3f3f; cursor: pointer; transition: 0.1s;
}
.wp-skill-slot:hover { background: var(--grass); border-color: #fff; }

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
    width: 280px !important;
    padding: 14px !important;
  }
  .villager-dialog h3 { font-size: 12px; margin-bottom: 8px; }
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