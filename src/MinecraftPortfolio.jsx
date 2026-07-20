import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, Sky, Stars, Html, Edges } from "@react-three/drei";
import * as THREE from "three";



function LoadingScreen() {
    return (
        <Html center>
            <div style={{ color: "white", fontFamily: "monospace", fontSize: "20px", background: "rgba(0,0,0,0.5)", padding: "10px 20px", borderRadius: "5px" }}>
                Generating Terrain...
            </div>
        </Html>
    );
}

/* ----------------------------- DATA ----------------------------- */
const PROFILE = {
    name: "q04ti",
    role: "Developer",
    tagline: "Passionate about building intuitive software, solving complex problems, and constantly learning new technologies.",
    email: "q04tiofficial@gmail.com",
    github: "https://github.com/q04ti"
};

const ABOUT = {
    bio: "I'm a Developer who loves turning ideas into interactive experiences. Whether I'm building web applications, exploring new frameworks, or optimizing code, I'm always eager to take on new challenges and build things people love to use.",
    github: "https://github.com/q04ti",
    linkedin: "https://linkedin.com/in/q04ti",
    hobbies: ["Building redstone logic", "Speedrunning algorithms", "Mining for tech stacks", "Home weightlifting"],
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

function InstancedTerrain({ instances, geo, mats }) {
    const meshRef = useRef();

    useEffect(() => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        instances.forEach((inst, i) => {
            dummy.position.set(inst.pos[0], inst.pos[1], inst.pos[2]);
            if (inst.scale) dummy.scale.set(inst.scale[0], inst.scale[1], inst.scale[2]);
            else dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [instances]);

    return (
        <instancedMesh ref={meshRef} args={[geo, mats, instances.length]} receiveShadow castShadow />
    );
}

function getTerrainHeight(x, z) {
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter < 12) return -0.5; // Keep village center flat

    let y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 4;
    y += Math.sin(x * 0.05 + z * 0.08) * 3;

    const blend = Math.min(1, (distFromCenter - 12) / 10);
    return Math.floor(y * blend) - 0.5;
}


function Clouds() {
    const meshRef = useRef();
    const cloudGeo = useMemo(() => new THREE.BoxGeometry(4, 1, 4), []);
    const cloudMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 }), []);
    
    const clouds = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 25; i++) {
            arr.push({
                x: (Math.random() - 0.5) * 120,
                y: 12 + Math.random() * 8,
                z: (Math.random() - 0.5) * 120,
                scale: 0.8 + Math.random() * 1.5
            });
        }
        return arr;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        
        clouds.forEach((c, i) => {
            c.x += delta * 0.8;
            if (c.x > 60) c.x -= 120;
            
            dummy.position.set(c.x, c.y, c.z);
            dummy.scale.set(c.scale, 1, c.scale * 1.5);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[cloudGeo, cloudMat, 25]} />
    );
}

function WorldBorder() {
    const borderGeo = new THREE.PlaneGeometry(62, 40);
    const borderMat = new THREE.MeshBasicMaterial({
        color: "#44aaff",
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });

    return (
        <group>
            {/* Grid overlay to look like Minecraft barrier/border */}
            <mesh position={[0, 10, -31]} geometry={borderGeo} material={borderMat}>
                <Edges color="#88ccff" threshold={1} />
            </mesh>
            <mesh position={[0, 10, 31]} rotation={[0, Math.PI, 0]} geometry={borderGeo} material={borderMat}>
                <Edges color="#88ccff" threshold={1} />
            </mesh>
            <mesh position={[-31, 10, 0]} rotation={[0, Math.PI / 2, 0]} geometry={borderGeo} material={borderMat}>
                <Edges color="#88ccff" threshold={1} />
            </mesh>
            <mesh position={[31, 10, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={borderGeo} material={borderMat}>
                <Edges color="#88ccff" threshold={1} />
            </mesh>
        </group>
    );
}

// World Terrain Generation
function World() {
    const terrainData = useMemo(() => {
        const size = 30; // 61x61 grid (3700+ blocks)
        const blocksByType = { grass: [], path: [], stone: [], dirt: [], wood: [], leaves: [] };

        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                const y = getTerrainHeight(x, z);

                const isPath = (Math.abs(x) <= 1 || Math.abs(z) <= 1) && Math.abs(x) < 8 && Math.abs(z) < 8;
                let type = "grass";

                if (isPath) type = "path";
                else if (y > 2) type = "stone";

                blocksByType[type].push({ pos: [x, y, z] });

                // Add dirt underneath surface blocks to prevent gaps when hills rise
                if (y > -0.5 && type !== "path") {
                    for (let dy = y - 1; dy >= -0.5; dy--) {
                        blocksByType["dirt"].push({ pos: [x, dy, z] });
                    }
                }

                if (type === "grass" && Math.random() > 0.98 && Math.abs(x) > 4 && Math.abs(z) > 4) {
                    // Prevent trees from spawning inside houses or NPCs
                    const isOccupied = 
                        (Math.abs(-6 - x) < 4 && Math.abs(-6 - z) < 4) || // Librarian area
                        (Math.abs(6 - x) < 4 && Math.abs(6 - z) < 4) ||   // Blacksmith area
                        (Math.abs(-6 - x) < 4 && Math.abs(6 - z) < 4) ||  // Cleric area
                        (Math.abs(9 - x) < 4 && Math.abs(6 - z) < 4) ||   // House 2
                        (Math.abs(-6 - x) < 4 && Math.abs(9 - z) < 4) ||  // House 3
                        (Math.abs(-6 - x) < 4 && Math.abs(-9 - z) < 4);   // House 1
                    
                    if (isOccupied) continue;

                    const s = 0.6 + Math.random() * 0.6;
                    
                    // To perfectly sit on the block below (which has top at y + 0.5), 
                    // the center of the first scaled block (size s) must be at y + 0.5 + s/2
                    const baseY = y + 0.5 + s / 2;
                    
                    blocksByType["wood"].push({ pos: [x, baseY + 0 * s, z], scale: [s, s, s] });
                    blocksByType["wood"].push({ pos: [x, baseY + 1 * s, z], scale: [s, s, s] });
                    blocksByType["wood"].push({ pos: [x, baseY + 2 * s, z], scale: [s, s, s] });
                    blocksByType["wood"].push({ pos: [x, baseY + 3 * s, z], scale: [s, s, s] });
                    
                    blocksByType["wood"].push({ pos: [x, baseY + 4 * s, z], scale: [s, s, s] });
                    
                    for (let ly = 2; ly <= 5; ly++) {
                        let radius = (ly <= 3) ? 2 : 1;
                        for (let lx = -radius; lx <= radius; lx++) {
                            for (let lz = -radius; lz <= radius; lz++) {
                                if (lx === 0 && lz === 0 && ly < 5) continue; // Skip trunk interior
                                
                                // Remove corners for a natural rounded canopy
                                if (Math.abs(lx) === radius && Math.abs(lz) === radius) {
                                    if (ly === 5 || Math.random() > 0.5) continue;
                                }
                                
                                blocksByType["leaves"].push({
                                    pos: [x + lx * s, baseY + ly * s, z + lz * s],
                                    scale: [s, s, s]
                                });
                            }
                        }
                    }
                }
            }
        }
        return { blocksByType };
    }, []);

    return (
        <group>
            {/* Deep base ground */}
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#5d9c4b" />
            </mesh>

            {Object.entries(terrainData.blocksByType).map(([type, instances]) => (
                instances.length > 0 && (
                    <InstancedTerrain
                        key={type}
                        instances={instances}
                        geo={blockGeo}
                        mats={blockMats[type] || blockMats.grass}
                    />
                )
            ))}

            <House position={[-6, 0, -9]} rotation={[0, 0, 0]} />
            <House position={[9, 0, 6]} rotation={[0, -Math.PI / 2, 0]} />
            <House position={[-6, 0, 9]} rotation={[0, Math.PI, 0]} />

            <WorldBorder />
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
            const isMobile = window.innerWidth < 768;
            const distance = isMobile ? 12 : 8; // increased distance so it's less zoomed in
            const cx = tx + Math.sin(angle) * distance;
            const cz = tz + Math.cos(angle) * distance;
            const cy = ty + (isMobile ? 4.5 : 3.5);

            controlsRef.current.setLookAt(cx, cy, cz, tx, ty + 1.5, tz, true);
        }
    }, [activeSection]);

    return (
        <>
            <color attach="background" args={['#ff9e7f']} />
            <fog attach="fog" args={['#ffb499', 150, 300]} />
            <ambientLight intensity={0.4} color="#ffe4d6" />
            <directionalLight position={[50, 10, 50]} intensity={1.2} color="#ffd1b3" castShadow shadow-mapSize={[512, 512]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <World />
            <Clouds />

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
                        <p><strong>Think you can stump me? Use the Redstone (slot 5) to craft me a message!</strong></p>
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
                        <h3>The Farmer says:</h3>
                        <p>{ABOUT.bio}</p>
                        <div className="wp-hobbies">
                            <strong>Hobbies:</strong>
                            <ul>
                                {ABOUT.hobbies.map((h, i) => <li key={i}>{h}</li>)}
                            </ul>
                        </div>
                        <div className="wp-socials">
                            <a href={ABOUT.github} target="_blank" rel="noreferrer">GitHub</a>
                            <a href={ABOUT.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
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
                        <p>"Here are the finest tools I've forged..."</p>
                        <div className="projects-grid">
                            {PROJECTS.map((p, i) => (
                                <a key={i} href={p.href} className="project-mini-card" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                    <h4>{p.name}</h4>
                                    <p>{p.desc}</p>
                                </a>
                            ))}
                        </div>
                        <a href={PROFILE.github} target="_blank" rel="noreferrer" className="wp-btn wp-github-btn">View GitHub</a>
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
                        <h3>The Enchanter says:</h3>
                        <p>"My magical proficiencies..."</p>
                        <div className="wp-xp-grid">
                            {SKILLS.map((s) => (
                                <div key={s.name} className="xp-bar-container">
                                    <div className="xp-bar-label">{s.name}</div>
                                    <div className="xp-bar-bg">
                                        <div className="xp-bar-fill" style={{ width: `${s.level * 3.3}%` }}></div>
                                    </div>
                                    <div className="xp-level">{s.level}</div>
                                </div>
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

function TraditionalView() {
    return (
        <div className="traditional-view">
            <header className="trad-header">
                <div className="trad-header-content">
                    <div className="trad-title-group">
                        <h1>{PROFILE.name}</h1>
                        <h2>{PROFILE.role}</h2>
                        <p>{PROFILE.tagline}</p>
                    </div>
                    <div className="trad-links">
                        <a href={ABOUT.github} target="_blank" rel="noreferrer">GitHub</a>
                        <a href={ABOUT.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href={`mailto:${PROFILE.email}`}>Email</a>
                        <a href="/resume.pdf" download="Resume_q04ti.pdf" className="trad-download-btn">Download PDF</a>
                    </div>
                </div>
            </header>

            <main className="trad-main">
                <section className="trad-section">
                    <h3>About Me</h3>
                    <p>{ABOUT.bio}</p>
                    <div className="trad-hobbies">
                        <strong>Hobbies: </strong> {ABOUT.hobbies.join(', ')}
                    </div>
                </section>



                <section className="trad-section">
                    <h3>Key Projects</h3>
                    <div className="trad-projects">
                        {PROJECTS.map((p, i) => (
                            <div key={i} className="trad-project-card">
                                <h4>{p.name}</h4>
                                <p>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="trad-section">
                    <h3>Skills</h3>
                    <div className="trad-skills">
                        {SKILLS.map((s, i) => (
                            <span key={i} className="trad-skill-tag">{s.name}</span>
                        ))}
                    </div>
                </section>

                <section className="trad-section">
                    <h3>Contact</h3>
                    <form className="trad-contact-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                        <input type="text" placeholder="Name" required />
                        <input type="email" placeholder="Email" required />
                        <textarea placeholder="Message" required rows="4"></textarea>
                        <button type="submit">Send Message</button>
                    </form>
                </section>
            </main>
        </div>
    );
}


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
    const [isTraditional, setIsTraditional] = useState(false);
    const [isFocused, setIsFocused] = useState(true);

    useEffect(() => {
        const onFocus = () => setIsFocused(true);
        const onBlur = () => setIsFocused(false);
        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
        };
    }, []);
    const [activeSlot, setActiveSlot] = useState(1);
    const [isNether, setIsNether] = useState(false);
    const [visited, setVisited] = useState(new Set([1]));
    const [achievementUnlocked, setAchievementUnlocked] = useState(false);
    const [showAchievement, setShowAchievement] = useState(false);

    // Contact form state
    const [contactForm, setContactForm] = useState({ name: '', email: '', msg: '' });
    const [craftedItem, setCraftedItem] = useState(null);

    // Simulated multiplayer count
    const [visitorCount, setVisitorCount] = useState(1);

    useEffect(() => {
        let count = 0;
        if (Math.random() < 0.98) {
            count = Math.floor(Math.random() * 5) + 1;
        } else {
            count = Math.floor(Math.random() * 21) + 10;
        }
        setVisitorCount(count);
    }, []);

    const handleSlotClick = (slot) => {
        playClickSound();
        setActiveSlot(slot);

        if (slot <= 4) {
            setVisited(prev => {
                const newVisited = new Set(prev);
                newVisited.add(slot);
                if (newVisited.size === 4 && !achievementUnlocked) {
                    setAchievementUnlocked(true);
                    setShowAchievement(true);
                    setTimeout(() => setShowAchievement(false), 5000);
                }
                return newVisited;
            });
        }
    };

    const handleCraft = () => {
        if (contactForm.name && contactForm.email && contactForm.msg) {
            playClickSound();
            setCraftedItem('Message Sent!');
            setTimeout(() => {
                setContactForm({ name: '', email: '', msg: '' });
                setCraftedItem(null);
                setActiveSlot(1);
            }, 2000);
        }
    };

    if (isTraditional) {
        return (
            <div className="wp-root">
                <style>{CSS}</style>
                <button className="trad-toggle-btn" onClick={() => { playClickSound(); setIsTraditional(false); }}>
                    Return to 3D World
                </button>
                <TraditionalView />
            </div>
        );
    }

    return (
        <div className="wp-root">
            <style>{CSS}</style>
            <button className="trad-toggle-btn" onClick={() => { playClickSound(); setIsTraditional(true); }}>
                View Traditional Resume
            </button>

            <div className="canvas-container">
                <Canvas
                    shadows
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 5, 5], fov: 55 }}
                    frameloop={isFocused ? 'always' : 'demand'}
                    gl={{ powerPreference: "high-performance", antialias: false, stencil: false, depth: true }}
                >
                    <Suspense fallback={<LoadingScreen />}>
                        <Scene activeSection={activeSlot} setActiveSection={handleSlotClick} isNether={isNether} setIsNether={setIsNether} />
                    </Suspense>
                </Canvas>
                <div className="crosshair">+</div>
            </div>

            <div className="minimap">
                <div className="minimap-bg">
                    {[
                        { id: 1, pos: [0, -2], color: '#5c4033', name: 'Guide' },
                        { id: 2, pos: [-6, -6], color: '#c2b280', name: 'Farmer' },
                        { id: 3, pos: [6, 6], color: '#d2b48c', name: 'Cartographer' },
                        { id: 4, pos: [-6, 6], color: '#4b0082', name: 'Enchanter' }
                    ].map(npc => {
                        const left = ((npc.pos[0] + 10) / 20) * 100;
                        const top = ((npc.pos[1] + 10) / 20) * 100;
                        return (
                            <div
                                key={npc.id}
                                className={activeSlot === npc.id ? "minimap-dot active" : "minimap-dot"}
                                style={{ left: `${left}%`, top: `${top}%`, backgroundColor: npc.color }}
                                onClick={() => handleSlotClick(npc.id)}
                                title={npc.name}
                            ></div>
                        );
                    })}
                </div>
                <div className="minimap-title">Minimap</div>
            </div>

            <div className="wp-hud">
                <div>Minecraft Portfolio v3.0.0</div>
                <div style={{ marginTop: 10, color: '#e0b23c' }}>Click & Drag to Orbit Freely</div>
                <div style={{ color: '#e0b23c' }}>Use Hotbar to Visit Sections</div>
                <div style={{ marginTop: 10, color: '#45ff33', fontSize: '9px' }}>
                    🟢 {visitorCount} other player{visitorCount !== 1 ? 's are' : ' is'} exploring this world
                </div>
            </div>

            {showAchievement && (
                <div className="achievement-toast">
                    <div className="ach-icon">🏆</div>
                    <div className="ach-text">
                        <div className="ach-title">Achievement Get!</div>
                        <div className="ach-desc">Portfolio Explorer — Visited every villager</div>
                    </div>
                </div>
            )}

            {activeSlot === 5 && (
                <div className="overlay-menu crafting-overlay">
                    <h3>Crafting</h3>
                    <div className="crafting-container">
                        <div className="crafting-grid">
                            <div className="craft-slot"><input placeholder="Name (Iron)" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} /></div>
                            <div className="craft-slot"><input placeholder="Email (Redstone)" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} /></div>
                            <div className="craft-slot"><textarea placeholder="Message (Paper)" value={contactForm.msg} onChange={e => setContactForm({ ...contactForm, msg: e.target.value })}></textarea></div>
                            <div className="craft-slot empty"></div>
                        </div>
                        <div className="craft-arrow">➔</div>
                        <div className="craft-result" onClick={handleCraft}>
                            {craftedItem ? <div className="crafted-item">{craftedItem}</div> : <button>Craft!</button>}
                        </div>
                    </div>
                </div>
            )}

            {activeSlot === 6 && (
                <div className="overlay-menu book-overlay">
                    <div className="book-pages">
                        <div className="book-page">
                            <h3>Resume</h3>
                            <p>{PROFILE.name}</p>
                            <p>{PROFILE.role}</p>
                            <p>{PROFILE.email}</p>
                            <br />
                            <p><strong>Experience</strong></p>
                            <ul>
                                <li>Master of full-stack realms.</li>
                                <li>Redstone (Backend) Developer.</li>
                                <li>Frontend Architect.</li>
                            </ul>
                            <a href="/resume.pdf" download="Resume_q04ti.pdf" className="wp-btn wp-hire-btn">Download PDF</a>
                        </div>
                    </div>
                </div>
            )}

            <nav className="hotbar-nav">
                <div className="hotbar-inner">
                    {[
                        { id: 1, icon: '🏠', label: 'Guide' },
                        { id: 2, icon: '🌾', label: 'Farmer' },
                        { id: 3, icon: '🗺️', label: 'Cartographer' },
                        { id: 4, icon: '✨', label: 'Enchanter' },
                        { id: 5, icon: '🔴', label: 'Contact' },
                        { id: 6, icon: '📘', label: 'Resume' }
                    ].map(slot => (
                        <button key={slot.id} className={activeSlot === slot.id ? "hotbar-slot active" : "hotbar-slot"} onClick={() => handleSlotClick(slot.id)}>
                            <span className="slot-num">{slot.id}</span>
                            <div className="slot-icon">{slot.icon}</div>
                            <span className="slot-label">{slot.label}</span>
                        </button>
                    ))}
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
  height: 100dvh; width: 100vw; position: relative;
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
.hotbar-nav { position: absolute; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); left: 50%; transform: translateX(-50%); z-index: 50; }
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


/* Hobbies */
.wp-hobbies { margin-bottom: 15px; font-size: 12px; }
.wp-hobbies ul { padding-left: 20px; margin: 5px 0; }
.wp-hobbies li { margin-bottom: 4px; }



/* XP Grid (Enchanter) */
.wp-xp-grid { display: flex; flex-direction: column; gap: 10px; }
.xp-bar-container { display: flex; align-items: center; gap: 10px; }
.xp-bar-label { width: 80px; font-size: 10px; font-weight: bold; color: #333; }
.xp-bar-bg { flex-grow: 1; height: 10px; background: #222; border: 2px solid #000; position: relative; }
.xp-bar-fill { height: 100%; background: #45ff33; transition: width 0.5s ease-in-out; }
.xp-level { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #45ff33; text-shadow: 1px 1px 0 #000; width: 20px; text-align: right; }

/* Overlays */
.overlay-menu { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; pointer-events: auto; }
.crafting-overlay { background: #c6c6c6; border: 4px solid; border-color: #ffffff #555555 #555555 #ffffff; padding: 20px; width: 350px; box-shadow: 8px 8px 0px rgba(0,0,0,0.5); }
.crafting-overlay h3 { margin-top: 0; font-family: 'Press Start 2P', monospace; font-size: 14px; color: #333; }
.crafting-container { display: flex; align-items: center; gap: 20px; }
.crafting-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 150px; }
.craft-slot { background: #8b8b8b; border: 2px solid; border-color: #373737 #ffffff #ffffff #373737; width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.craft-slot.empty { background: #666; }
.craft-slot input, .craft-slot textarea { width: 90%; height: 90%; background: transparent; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 10px; color: #fff; resize: none; text-align: center; }
.craft-arrow { font-size: 24px; color: #333; }
.craft-result { background: #8b8b8b; border: 2px solid; border-color: #373737 #ffffff #ffffff #373737; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.craft-result button { background: none; border: none; font-family: 'Space Grotesk', sans-serif; font-weight: bold; cursor: pointer; font-size: 12px; }
.crafted-item { font-size: 10px; font-weight: bold; color: #45ff33; text-align: center; }

.book-overlay { background: #ebdcb1; border: 4px solid #8B5A2B; padding: 30px; width: 400px; box-shadow: 8px 8px 0px rgba(0,0,0,0.5); color: #333; }
.book-overlay h3 { margin-top: 0; font-family: 'Press Start 2P', monospace; font-size: 16px; color: #333; }

/* Achievement Toast */
.achievement-toast { position: absolute; top: 20px; right: 20px; background: #212121; border: 2px solid #555; padding: 10px 15px; display: flex; align-items: center; gap: 15px; box-shadow: 4px 4px 0px rgba(0,0,0,0.5); z-index: 100; animation: slideIn 0.5s ease-out; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.ach-icon { font-size: 24px; }
.ach-title { color: #ffff55; font-family: 'Press Start 2P', monospace; font-size: 10px; margin-bottom: 4px; }
.ach-desc { color: #fff; font-size: 12px; }



.perf-toggle-btn {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 8px 16px;
  background: #222;
  color: #45ff33;
  border: 2px solid #45ff33;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
.perf-toggle-btn:hover {
  background: #45ff33;
  color: #111;
}

/* Traditional View Toggle Button */
.trad-toggle-btn {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 10px 20px;
  background: #111;
  color: #fff;
  border: 2px solid #555;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
.trad-toggle-btn:hover {
  background: #fff;
  color: #111;
  border-color: #111;
}

/* Traditional View Layout */
.traditional-view {
  background: #fff;
  color: #111;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  font-family: 'Inter', sans-serif;
}
.trad-header {
  border-bottom: 1px solid #eaeaea;
  padding: 60px 20px 40px;
  background: #fafafa;
}
.trad-header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
}
.trad-title-group h1 { margin: 0 0 10px; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
.trad-title-group h2 { margin: 0 0 10px; font-size: 18px; font-weight: 500; color: #555; }
.trad-title-group p { margin: 0; font-size: 14px; color: #777; max-width: 500px; line-height: 1.5; }
.trad-links {
  display: flex;
  gap: 15px;
  align-items: center;
}
.trad-links a {
  color: #111;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.trad-links a:hover { text-decoration: underline; }
.trad-download-btn {
  background: #111;
  color: #fff !important;
  padding: 8px 16px;
  border-radius: 4px;
}
.trad-download-btn:hover { background: #333; text-decoration: none !important; }

.trad-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 60px;
}
.trad-section h3 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #777;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.trad-section p { font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 15px; }
.trad-hobbies { font-size: 14px; color: #555; }

.trad-timeline { list-style: none; padding: 0; margin: 0; }
.trad-timeline li {
  margin-bottom: 15px;
  font-size: 15px;
  color: #333;
}
.trad-timeline strong { display: inline-block; width: 60px; color: #777; }

.trad-projects { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.trad-project-card {
  border: 1px solid #eaeaea;
  padding: 20px;
  border-radius: 4px;
}
.trad-project-card h4 { margin: 0 0 10px; font-size: 16px; }
.trad-project-card p { margin: 0; font-size: 14px; color: #666; }

.trad-skills { display: flex; flex-wrap: wrap; gap: 10px; }
.trad-skill-tag {
  background: #f5f5f5;
  border: 1px solid #eaeaea;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 20px;
  color: #333;
}

.trad-contact-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
}
.trad-contact-form input, .trad-contact-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
.trad-contact-form button {
  background: #111;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.trad-contact-form button:hover { background: #333; }

@media (max-width: 600px) {
  .trad-header-content { flex-direction: column; align-items: flex-start; }
  .trad-projects { grid-template-columns: 1fr; }
}

/* Mobile Compatibility Fixes */
@media (max-width: 600px) {
  .crafting-overlay, .book-overlay { width: 90%; max-width: 320px; }
}

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