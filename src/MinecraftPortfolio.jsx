import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Sky, Stars, Html, Edges } from "@react-three/drei";
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

/* ----------------------------- 3D COMPONENTS ----------------------------- */

function Block({ position, type = "grass", scale = [1, 1, 1] }) {
    let color = "#8B5A2B"; 
    let topColor = "#5d9c4b"; 
    
    if (type === "dirt") { topColor = color; }
    if (type === "path") { color = "#8B5A2B"; topColor = "#9b7653"; }
    if (type === "stone") { color = "#7d7d7d"; topColor = "#7d7d7d"; }
    if (type === "wood") { color = "#5c4033"; topColor = "#8b5a2b"; }
    if (type === "leaves") { color = "#3b5e2b"; topColor = "#3b5e2b"; }

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

function House({ position, rotation = [0, 0, 0], scale = 0.5 }) {
    return (
        <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 3]} />
                <meshStandardMaterial color="#dcd3b6" />
                <Edges color="#111" />
            </mesh>
            <mesh position={[0, 0.5, 1.51]} castShadow>
                <boxGeometry args={[0.8, 1.5, 0.1]} />
                <meshStandardMaterial color="#5c4033" />
            </mesh>
            <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.4, 0.5, 3.4]} />
                <meshStandardMaterial color="#8b5a2b" />
                <Edges color="#111" />
            </mesh>
            <mesh position={[0, 2.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 0.5, 2]} />
                <meshStandardMaterial color="#8b5a2b" />
                <Edges color="#111" />
            </mesh>
        </group>
    );
}

function World() {
    const blocks = useMemo(() => {
        const b = [];
        const size = 15; 
        
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                const isPath = (Math.abs(x) <= 1 || Math.abs(z) <= 1) && Math.abs(x) < 12 && Math.abs(z) < 12;
                b.push(<Block key={`${x}_${z}`} position={[x, -0.5, z]} type={isPath ? "path" : "grass"} />);
                
                if (!isPath && Math.random() > 0.94 && Math.abs(x) > 3 && Math.abs(z) > 3) {
                    const treeScale = 0.2 + Math.random() * 0.2;
                    b.push(<Tree key={`tree_${x}_${z}`} position={[x, 0.5, z]} scale={treeScale} />);
                }
            }
        }
        return b;
    }, []);

    return (
        <group>
            <mesh position={[0, -0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#5d9c4b" />
            </mesh>
            {blocks}
            
            {/* Main Houses */}
            <House position={[-3, -0.25, -4]} rotation={[0, 0, 0]} />
            <House position={[4.5, -0.25, 3]} rotation={[0, -Math.PI / 2, 0]} />
            <House position={[-3, -0.25, 4.5]} rotation={[0, Math.PI, 0]} />

            {/* Additional densely packed houses to make it a village */}
            <House position={[-6, -0.25, -8]} rotation={[0, Math.PI / 2, 0]} />
            <House position={[8, -0.25, -4]} rotation={[0, -Math.PI / 4, 0]} />
            <House position={[-8, -0.25, 2]} rotation={[0, Math.PI / 4, 0]} />
            <House position={[5, -0.25, -7]} rotation={[0, 0, 0]} />
        </group>
    );
}

function VillagerBody({ roleColor = "#5c4033", facing = 0, scale = 0.5 }) {
    const skinColor = "#e8b28a";
    return (
        <group rotation={[0, facing, 0]} scale={[scale, scale, scale]} position={[0, -0.2, 0]}>
            <mesh position={[0, 0.375, 0]} castShadow>
                <boxGeometry args={[0.5, 0.75, 0.5]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>
            <mesh position={[0, 1.125, 0]} castShadow>
                <boxGeometry args={[0.6, 0.75, 0.6]} />
                <meshStandardMaterial color={roleColor} />
            </mesh>
            <mesh position={[0, 1.1, 0.35]} castShadow>
                <boxGeometry args={[0.8, 0.3, 0.3]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0, 1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0, 1.6, 0.45]} castShadow>
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
        </group>
    );
}

function NPC({ data, isMobile, children }) {
    const [opacity, setOpacity] = useState(0);
    const vec = useMemo(() => new THREE.Vector3(...data.pos), [data.pos]);
    
    useFrame(() => {
        const dist = playerState.position.distanceTo(vec);
        const targetOpacity = dist < (isMobile ? 5 : 4) ? 1 : 0; 
        if (opacity !== targetOpacity) {
            setOpacity(targetOpacity);
        }
    });

    return (
        <group position={data.pos}>
            <VillagerBody roleColor={data.roleColor} facing={data.facing} />
            <Html 
                position={[0, 1.5, 0]} 
                center 
                distanceFactor={isMobile ? 10 : 6} 
                zIndexRange={[100, 0]}
                style={{ 
                    opacity, 
                    transition: 'opacity 0.4s ease-in-out',
                    pointerEvents: opacity > 0 ? 'auto' : 'none',
                    zIndex: opacity > 0 ? 100 : -1
                }}
            >
                <div 
                    className="villager-dialog-wrapper" 
                    onPointerDown={(e) => e.stopPropagation()} 
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </Html>
        </group>
    );
}

const NPCS = [
    { id: 1, type: "Guide", roleColor: "#5c4033", pos: [0, 0, -2], facing: 0 },
    { id: 2, type: "Librarian", roleColor: "#e6e6e6", pos: [-3, 0, -3], facing: Math.PI / 4 },
    { id: 3, type: "Blacksmith", roleColor: "#333333", pos: [3, 0, 3], facing: -Math.PI * 0.75 },
    { id: 4, type: "Cleric", roleColor: "#6c358f", pos: [-3, 0, 3], facing: Math.PI * 0.75 },
    
    // Additional generic villagers to fill the town
    { id: 5, type: "Farmer", roleColor: "#8b5a2b", pos: [-5, 0, -6], facing: Math.PI },
    { id: 6, type: "Fisherman", roleColor: "#4f7b9c", pos: [6, 0, -2], facing: -Math.PI / 2 },
    { id: 7, type: "Fletcher", roleColor: "#6b5e52", pos: [-6, 0, 1], facing: Math.PI / 2 }
];

// Export global player state so NPCs can read it
export const playerState = {
    position: new THREE.Vector3(0, 0, 3)
};

function Player({ isMobile, keys, hasStarted }) {
    const { camera, gl } = useThree();
    const playerRef = useRef();
    const playerFacing = useRef(0);

    useEffect(() => {
        camera.rotation.order = 'YXZ';
        // Initialize player position
        playerState.position.set(0, 0, 3);
    }, [camera]);

    // Mobile touch camera rotation
    useEffect(() => {
        if (!isMobile || !hasStarted) return;
        
        let lastTouch = { x: 0, y: 0 };
        
        const handleTouchStart = (e) => {
            lastTouch = { x: e.touches[0].pageX, y: e.touches[0].pageY };
        };

        const handleTouchMove = (e) => {
            const touchX = e.touches[0].pageX;
            const touchY = e.touches[0].pageY;
            const dx = touchX - lastTouch.x;
            const dy = touchY - lastTouch.y;
            
            camera.rotation.y -= dx * 0.005;
            camera.rotation.x -= dy * 0.005;
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
            
            lastTouch = { x: touchX, y: touchY };
        };

        const canvas = gl.domElement;
        canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
        
        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isMobile, hasStarted, camera, gl]);

    const speed = 4;
    
    useFrame((state, delta) => {
        const front = Number(keys.backward) - Number(keys.forward);
        const side = Number(keys.left) - Number(keys.right);
        
        const inputVec = new THREE.Vector3(side, 0, front);
        
        if (inputVec.lengthSq() > 0) {
            inputVec.normalize().multiplyScalar(speed * delta);
            // Move relative to the camera's yaw (horizontal rotation)
            inputVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
            playerState.position.add(inputVec);
            
            // Calculate which way the player model should face
            playerFacing.current = Math.atan2(inputVec.x, inputVec.z);
        }

        // Update the visual player model
        if (playerRef.current) {
            playerRef.current.position.copy(playerState.position);
            
            // Smoothly rotate the character to face movement direction
            const currentRotation = playerRef.current.rotation.y;
            let diff = playerFacing.current - currentRotation;
            // Normalize angle diff to -PI to PI
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            playerRef.current.rotation.y += diff * 10 * delta;
        }
        
        // 3rd Person Camera Orbit Logic
        // Start camera exactly at player position
        camera.position.copy(playerState.position);
        
        // Pull the camera back and up based on its own local rotation
        // This makes it act like an orbit camera following behind
        camera.translateZ(isMobile ? 5 : 4);
        camera.translateY(isMobile ? 1.5 : 1.2);
        
        // Prevent camera from going under the floor
        if (camera.position.y < 0.2) camera.position.y = 0.2;
    });

    return (
        <>
            {!isMobile && <PointerLockControls />}
            {/* The Player Character Model */}
            <group ref={playerRef}>
                <VillagerBody roleColor="#297fb8" facing={0} scale={0.45} />
            </group>
        </>
    );
}

function Scene({ isMobile, keys, hasStarted }) {
    return (
        <>
            <color attach="background" args={['#87CEEB']} />
            <fog attach="fog" args={['#87CEEB', 8, 30]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[15, 20, 10]} intensity={1.5} castShadow />
            <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <World />
            <Player isMobile={isMobile} keys={keys} hasStarted={hasStarted} />
            
            <NPC data={NPCS[0]} isMobile={isMobile}>
                <div className="villager-dialog">
                    <h3>{PROFILE.name}</h3>
                    <p>{PROFILE.role}</p>
                    <p><em>"{PROFILE.tagline}"</em></p>
                    <a href={`mailto:${PROFILE.email}`} className="wp-btn wp-hire-btn">Hire Me</a>
                </div>
            </NPC>

            <NPC data={NPCS[1]} isMobile={isMobile}>
                <div className="villager-dialog about-dialog">
                    <h3>The Librarian says:</h3>
                    <p>{ABOUT.bio}</p>
                    <div className="wp-socials">
                        <a href={ABOUT.github} target="_blank" rel="noreferrer">GitHub</a>
                        <a href={ABOUT.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href={`mailto:${PROFILE.email}`}>Email</a>
                    </div>
                </div>
            </NPC>

            <NPC data={NPCS[2]} isMobile={isMobile}>
                <div className="villager-dialog projects-dialog">
                    <h3>The Blacksmith says:</h3>
                    <p>"Take a look at the weapons and tools I've forged!"</p>
                    <a href={PROFILE.github} target="_blank" rel="noreferrer" className="wp-btn wp-github-btn">View My GitHub Works</a>
                </div>
            </NPC>

            <NPC data={NPCS[3]} isMobile={isMobile}>
                <div className="villager-dialog skills-dialog">
                    <h3>The Cleric says:</h3>
                    <p>"Here is my knowledge base... fueled entirely by Vibe Coding."</p>
                    <div className="wp-skills-grid">
                        {SKILLS.map((s) => (
                            <div key={s.name} className="wp-skill-slot">{s.name}</div>
                        ))}
                    </div>
                </div>
            </NPC>

            <NPC data={NPCS[4]} isMobile={isMobile}>
                <div className="villager-dialog">
                    <h3>The Farmer says:</h3>
                    <p>"It ain't much, but it's honest work."</p>
                </div>
            </NPC>
            <NPC data={NPCS[5]} isMobile={isMobile}>
                <div className="villager-dialog">
                    <h3>The Fisherman says:</h3>
                    <p>"Nice day for fishing, ain't it! Huh huh!"</p>
                </div>
            </NPC>
            <NPC data={NPCS[6]} isMobile={isMobile}>
                <div className="villager-dialog">
                    <h3>The Fletcher says:</h3>
                    <p>"Hmm."</p>
                </div>
            </NPC>
        </>
    );
}

/* --------------------------- MAIN UI COMPONENT --------------------------- */

export default function MinecraftPortfolio() {
    const [locked, setLocked] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return; 
        
        const handleLock = () => {
            setLocked(true);
            setHasStarted(true);
        };
        const handleUnlock = () => setLocked(false);
        
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) handleLock();
            else handleUnlock();
        });
        return () => {
            document.removeEventListener('pointerlockchange', handleLock);
            document.removeEventListener('pointerlockchange', handleUnlock);
        };
    }, [isMobile]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp': setKeys(k => ({...k, forward: true})); break;
                case 'KeyS': case 'ArrowDown': setKeys(k => ({...k, backward: true})); break;
                case 'KeyA': case 'ArrowLeft': setKeys(k => ({...k, left: true})); break;
                case 'KeyD': case 'ArrowRight': setKeys(k => ({...k, right: true})); break;
            }
        };
        const handleKeyUp = (e) => {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp': setKeys(k => ({...k, forward: false})); break;
                case 'KeyS': case 'ArrowDown': setKeys(k => ({...k, backward: false})); break;
                case 'KeyA': case 'ArrowLeft': setKeys(k => ({...k, left: false})); break;
                case 'KeyD': case 'ArrowRight': setKeys(k => ({...k, right: false})); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleDpad = (dir, isDown) => {
        setKeys(k => ({...k, [dir]: isDown}));
    };

    return (
        <div className="wp-root">
            <style>{CSS}</style>
            
            <div className="canvas-container">
                <Canvas shadows camera={{ fov: 65 }}>
                    <Suspense fallback={null}>
                        <Scene isMobile={isMobile} keys={keys} hasStarted={hasStarted} />
                    </Suspense>
                </Canvas>
                
                {/* Removed crosshair since it's 3rd person now */}
            </div>

            {/* Start Overlay */}
            {!hasStarted && (
                <div className="overlay-start">
                    <div className="overlay-panel">
                        <h2>Ready to explore?</h2>
                        {isMobile ? (
                            <>
                                <p>Drag on the screen to look around.</p>
                                <p className="controls">Use the on-screen D-Pad to walk.</p>
                                <button onClick={() => setHasStarted(true)}>Start</button>
                            </>
                        ) : (
                            <>
                                <p>Click anywhere to start walking.</p>
                                <p className="controls">Controls: W A S D or Arrows to move. Mouse to look.</p>
                                <button onClick={() => document.body.requestPointerLock()}>Start</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Desktop Pause Prompt */}
            {hasStarted && !isMobile && !locked && (
                <div className="resume-prompt" onClick={() => document.body.requestPointerLock()}>
                    Game Paused. Click here to lock cursor and resume walking.
                    <br/><br/>
                    <small>You can now use your mouse to click on the dialog boxes in the world.</small>
                </div>
            )}

            {/* Desktop HUD */}
            {locked && !isMobile && (
                <div className="wp-hud">
                    <div>Minecraft Portfolio v3.0.0</div>
                    <div style={{ marginTop: 10, color: '#e0b23c' }}>[ESC] to unlock cursor & click links</div>
                    <div style={{ color: '#e0b23c' }}>Walk up to villagers to interact</div>
                </div>
            )}

            {/* Mobile Virtual D-Pad */}
            {isMobile && hasStarted && (
                <div className="dpad-container" onTouchMove={(e) => e.stopPropagation()}>
                    <div className="dpad-row">
                        <button 
                            className="dpad-btn" 
                            onTouchStart={() => handleDpad('forward', true)} 
                            onTouchEnd={() => handleDpad('forward', false)}
                        >▲</button>
                    </div>
                    <div className="dpad-row">
                        <button 
                            className="dpad-btn" 
                            onTouchStart={() => handleDpad('left', true)} 
                            onTouchEnd={() => handleDpad('left', false)}
                        >◀</button>
                        <button 
                            className="dpad-btn" 
                            onTouchStart={() => handleDpad('backward', true)} 
                            onTouchEnd={() => handleDpad('backward', false)}
                        >▼</button>
                        <button 
                            className="dpad-btn" 
                            onTouchStart={() => handleDpad('right', true)} 
                            onTouchEnd={() => handleDpad('right', false)}
                        >▶</button>
                    </div>
                </div>
            )}
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

body { margin: 0; padding: 0; overflow: hidden; background: var(--bg); touch-action: none; }

.wp-root {
  color: var(--bone);
  font-family: 'Inter', system-ui, sans-serif;
  height: 100vh; width: 100vw; position: relative;
}

.canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; touch-action: none; }

.crosshair {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  color: rgba(255,255,255,0.7); font-size: 28px; pointer-events: none;
  font-family: sans-serif; user-select: none; z-index: 10;
  text-shadow: 1px 1px 0px #000;
}

.overlay-start {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}
.overlay-panel {
  background: rgba(20,20,20,0.9); border: 3px solid #555; padding: 40px;
  text-align: center; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  max-width: 90%;
}
.overlay-panel h2 { margin: 0 0 16px 0; font-family: 'Space Grotesk', sans-serif; color: var(--gold); }
.overlay-panel p { margin: 0 0 12px 0; color: #ddd; }
.overlay-panel .controls { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--grass); margin: 24px 0; }
.overlay-panel button {
  background: rgba(0,0,0,0.6); border: 2px solid var(--grass);
  color: var(--grass); padding: 12px 32px; font-size: 16px;
  font-family: 'Space Grotesk', sans-serif; font-weight: bold;
  cursor: pointer; transition: 0.2s;
}
.overlay-panel button:hover { background: var(--grass); color: #000; }

.resume-prompt {
  position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
  background: rgba(20, 20, 20, 0.9); border: 2px solid var(--grass);
  color: var(--grass); padding: 16px 24px; font-family: 'JetBrains Mono', monospace;
  font-size: 14px; text-align: center; border-radius: 4px; cursor: pointer;
  z-index: 40; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}
.resume-prompt:hover { background: var(--grass); color: #000; }
.resume-prompt small { color: #ccc; font-family: 'Inter', sans-serif; font-size: 12px; }
.resume-prompt:hover small { color: #333; }

.wp-hud {
  position: absolute; top: 18px; left: 18px; z-index: 40;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.5);
  padding: 12px 16px; line-height: 1.6; border-left: 3px solid var(--grass);
  pointer-events: none; text-shadow: 1px 1px 0 #000;
}

/* Mobile D-Pad */
.dpad-container {
  position: absolute; bottom: 30px; left: 30px; z-index: 45;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  user-select: none;
}
.dpad-row { display: flex; gap: 8px; }
.dpad-btn {
  width: 50px; height: 50px; background: rgba(0,0,0,0.5);
  border: 2px solid #555; color: white; border-radius: 50%;
  font-size: 20px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; touch-action: none;
}
.dpad-btn:active { background: rgba(255,255,255,0.2); border-color: var(--grass); }

/* Villager Dialogue Boxes */
.villager-dialog-wrapper {
  pointer-events: auto; /* IMPORTANT FOR CLICKS */
}
.villager-dialog {
  background: rgba(20, 20, 20, 0.85);
  border: 3px solid #555;
  border-radius: 4px;
  padding: 20px; color: #fff;
  width: 320px;
  text-shadow: 1px 1px 0 #000;
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
  cursor: pointer;
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
  display: inline-block; margin-top: 16px; padding: 12px 20px;
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

/* Mobile Compatibility */
@media (max-width: 768px) {
  .villager-dialog, .about-dialog, .projects-dialog, .skills-dialog {
    width: 260px !important;
    padding: 14px !important;
  }
  .villager-dialog h3 { font-size: 16px; margin-bottom: 8px; }
  .villager-dialog p { font-size: 12px; margin-bottom: 12px; }
  .wp-skills-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
  .wp-socials { flex-wrap: wrap; justify-content: center; }
  .wp-hud { display: none; }
  .wp-btn { padding: 10px; font-size: 12px; }
}
`;