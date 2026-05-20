// ITPH 3D Interactive Site Model
// Dependencies: @react-three/fiber, @react-three/drei, three
// Install: npm install @react-three/fiber @react-three/drei three

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import * as THREE from "three";

// === DISTRICT COLORS ===
const COLORS = {
  mfWall: "#A0623D",
  mfRoof: "#8B7355",
  rtlWall: "#C4B99A",
  rtlRoof: "#B5AD90",
  flxWall: "#94A3B0",
  flxRoof: "#78909C",
  indWall: "#9E9790",
  indRoof: "#6B7B82",
  grass: "#7A9B3A",
  grassDark: "#6B8E23",
  road: "#505050",
  sidewalk: "#D0C9BD",
  water: "#5CA0C2",
  tree: "#3E7B27",
  treeDark: "#2E6B1A",
  treeLight: "#55A630",
  trunk: "#5D4037",
  monument: "#C4B99A",
  white: "#FFFFFF"
};

// === SITE DIMENSIONS ===
// Mapping 136 acres to a 3D space
// Using approximate 600m x 400m (scaled to 300 x 200 units in scene)
const SITE = { w: 300, d: 200 };

// === LOT POSITIONS & BUILDING SPECS ===
// x, z are ground position (center of lot), w/d are building footprint, h is building height
// x: 0 = Cook Road (west), 300 = Kirkwood (east)
// z: 0 = north boundary, 200 = Bissonnet (south)

const buildings = [
  // MULTIFAMILY — west side (3-story, ~12m tall)
  { x: 45, z: 50, w: 50, d: 22, h: 12, district: "mf", label: "Lot 14", labelY: 14 },
  { x: 55, z: 52, w: 35, d: 18, h: 11, district: "mf" }, // second bldg lot 14
  { x: 42, z: 85, w: 48, d: 20, h: 12, district: "mf", label: "Lot 15", labelY: 14 },
  { x: 55, z: 87, w: 30, d: 16, h: 11, district: "mf" }, // second bldg lot 15
  { x: 45, z: 135, w: 52, d: 22, h: 12, district: "mf", label: "Lot 16", labelY: 14 },
  { x: 58, z: 138, w: 32, d: 18, h: 11, district: "mf" }, // second bldg lot 16
  // MF amenity buildings (small, 1-story)
  { x: 68, z: 70, w: 12, d: 8, h: 4, district: "mf" }, // clubhouse
  { x: 72, z: 110, w: 10, d: 6, h: 3.5, district: "mf" }, // leasing

  // FLEX — central-north (2-story, ~8m tall)
  { x: 130, z: 45, w: 38, d: 20, h: 8, district: "flx", label: "Lot 1", labelY: 10 },
  { x: 175, z: 45, w: 42, d: 22, h: 8.5, district: "flx", label: "Lot 5", labelY: 10 },
  { x: 130, z: 75, w: 36, d: 18, h: 7.5, district: "flx", label: "Lot 6", labelY: 9 },
  { x: 175, z: 75, w: 40, d: 18, h: 8, district: "flx", label: "Lot 7", labelY: 10 },
  { x: 132, z: 100, w: 34, d: 16, h: 7, district: "flx", label: "Lot 9", labelY: 9 },
  { x: 175, z: 100, w: 32, d: 16, h: 7, district: "flx", label: "Lot 13", labelY: 9 },

  // INDUSTRIAL — south-central (1-story, ~6m tall)
  { x: 128, z: 135, w: 28, d: 18, h: 6, district: "ind", label: "Lot 10", labelY: 8 },
  { x: 158, z: 135, w: 30, d: 18, h: 6.5, district: "ind", label: "Lot 11", labelY: 8 },
  { x: 190, z: 135, w: 28, d: 18, h: 6, district: "ind", label: "Lot 12", labelY: 8 },
  { x: 160, z: 160, w: 65, d: 14, h: 5.5, district: "ind", label: "Lot 18", labelY: 7 },

  // RETAIL — east side along Kirkwood (1-story, ~5m tall)
  { x: 235, z: 42, w: 30, d: 16, h: 5, district: "rtl", label: "Lot 2", labelY: 7 },
  { x: 270, z: 42, w: 30, d: 16, h: 5, district: "rtl", label: "Lot 3", labelY: 7 },
  { x: 235, z: 65, w: 30, d: 16, h: 5, district: "rtl", label: "Lot 4", labelY: 7 },
  { x: 270, z: 65, w: 30, d: 16, h: 5, district: "rtl", label: "Lot 8", labelY: 7 },
  { x: 235, z: 86, w: 28, d: 14, h: 4.5, district: "rtl", label: "17" },
  { x: 270, z: 86, w: 28, d: 14, h: 4.5, district: "rtl", label: "19" },
  // Small retail pads (south of main road)
  { x: 232, z: 130, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 255, z: 130, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 278, z: 130, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 232, z: 147, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 255, z: 147, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 278, z: 147, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 232, z: 163, w: 20, d: 12, h: 3.5, district: "rtl" },
  { x: 255, z: 163, w: 20, d: 12, h: 3.5, district: "rtl" },
  { x: 278, z: 163, w: 20, d: 12, h: 3.5, district: "rtl" },
  { x: 240, z: 178, w: 28, d: 10, h: 3.5, district: "rtl", label: "29" },
  { x: 275, z: 178, w: 28, d: 10, h: 3.5, district: "rtl", label: "30" },
];

// === ROAD SEGMENTS ===
// [x, z, width, depth, rotation]
const roads = [
  // Bissonnet (south boundary)
  { x: 150, z: 195, w: 310, d: 8, r: 0, label: "Bissonnet Street" },
  // Cook Road (west)
  { x: 5, z: 100, w: 8, d: 200, r: 0 },
  // Kirkwood Road (east)
  { x: 295, z: 100, w: 8, d: 200, r: 0 },
  // Main internal E-W
  { x: 150, z: 115, w: 280, d: 6, r: 0 },
  // Internal N-S left
  { x: 100, z: 75, w: 5, d: 130, r: 0 },
  // Internal N-S right
  { x: 215, z: 75, w: 5, d: 130, r: 0 },
  // Entrance road from Bissonnet
  { x: 100, z: 170, w: 5, d: 50, r: 0 },
];

// === TREE POSITIONS ===
function generateTrees() {
  const trees = [];
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  };
  const r = rng(42);

  // Street trees along main E-W road
  for (let i = 0; i < 35; i++) {
    trees.push({ x: 20 + i * 8, z: 110, s: 0.7 + r() * 0.3 });
    trees.push({ x: 22 + i * 8, z: 120, s: 0.6 + r() * 0.3 });
  }

  // Street trees along N-S roads
  for (let i = 0; i < 16; i++) {
    trees.push({ x: 96, z: 20 + i * 10, s: 0.6 + r() * 0.2 });
    trees.push({ x: 104, z: 22 + i * 10, s: 0.5 + r() * 0.2 });
    trees.push({ x: 211, z: 20 + i * 10, s: 0.6 + r() * 0.2 });
    trees.push({ x: 219, z: 22 + i * 10, s: 0.5 + r() * 0.2 });
  }

  // Bissonnet street trees
  for (let i = 0; i < 30; i++) {
    trees.push({ x: 15 + i * 10, z: 190, s: 0.7 + r() * 0.3 });
  }

  // Perimeter trees
  for (let i = 0; i < 25; i++) {
    trees.push({ x: 12, z: 15 + i * 8, s: 0.8 + r() * 0.4 }); // west
    trees.push({ x: 288, z: 15 + i * 8, s: 0.8 + r() * 0.4 }); // east
  }
  for (let i = 0; i < 30; i++) {
    trees.push({ x: 15 + i * 10, z: 12, s: 0.7 + r() * 0.3 }); // north
  }

  // MF district landscaping
  for (let i = 0; i < 20; i++) {
    trees.push({ x: 25 + r() * 60, z: 35 + r() * 150, s: 0.8 + r() * 0.5 });
  }

  // Retail landscaping
  for (let i = 0; i < 15; i++) {
    trees.push({ x: 225 + r() * 65, z: 30 + r() * 80, s: 0.6 + r() * 0.3 });
  }

  // Common area
  for (let i = 0; i < 8; i++) {
    trees.push({ x: 195 + r() * 20, z: 145 + r() * 15, s: 0.9 + r() * 0.5 });
  }

  return trees;
}

// === 3D BUILDING COMPONENT ===
function Building3D({ x, z, w, d, h, district, label, labelY }) {
  const wallColor = COLORS[district + "Wall"];
  const roofColor = COLORS[district + "Roof"];

  return (
    <group position={[x - SITE.w / 2, h / 2, z - SITE.d / 2]}>
      {/* Main building body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Roof cap (slightly larger, thin) */}
      <mesh position={[0, h / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[w + 0.5, 0.3, d + 0.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} />
      </mesh>

      {/* Window strips on front face */}
      {district === "mf" && Array.from({ length: 3 }).map((_, floor) => (
        <mesh key={`wf-${floor}`} position={[0, -h / 2 + 3 + floor * (h / 3), d / 2 + 0.05]}>
          <planeGeometry args={[w * 0.85, h * 0.18]} />
          <meshStandardMaterial color="#7EC8E3" transparent opacity={0.5} roughness={0.1} metalness={0.3} />
        </mesh>
      ))}

      {district === "rtl" && (
        <mesh position={[0, -h / 2 + 2.5, d / 2 + 0.05]}>
          <planeGeometry args={[w * 0.9, h * 0.55]} />
          <meshStandardMaterial color="#7EC8E3" transparent opacity={0.45} roughness={0.1} metalness={0.3} />
        </mesh>
      )}

      {district === "flx" && (
        <>
          <mesh position={[-w * 0.25, 0, d / 2 + 0.05]}>
            <planeGeometry args={[w * 0.35, h * 0.7]} />
            <meshStandardMaterial color="#7EC8E3" transparent opacity={0.4} roughness={0.1} metalness={0.3} />
          </mesh>
          {/* Metal panel accent band */}
          <mesh position={[0, h / 2 - 1, d / 2 + 0.05]}>
            <planeGeometry args={[w, 1.5]} />
            <meshStandardMaterial color="#78909C" roughness={0.3} metalness={0.5} />
          </mesh>
        </>
      )}

      {district === "ind" && (
        <>
          {/* Small office glass */}
          <mesh position={[-w * 0.35, -h / 2 + 2.5, d / 2 + 0.05]}>
            <planeGeometry args={[w * 0.2, h * 0.6]} />
            <meshStandardMaterial color="#7EC8E3" transparent opacity={0.35} roughness={0.1} />
          </mesh>
          {/* Dock doors */}
          {Array.from({ length: Math.min(3, Math.floor(w / 10)) }).map((_, i) => (
            <mesh key={`dk-${i}`} position={[w * 0.1 + i * 8, -h / 2 + 2, d / 2 + 0.05]}>
              <planeGeometry args={[5, 4]} />
              <meshStandardMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
          ))}
        </>
      )}

      {/* Label */}
      {label && (
        <Html position={[0, (labelY || h) / 2 + 2, 0]} center style={{ pointerEvents: "none" }}>
          <div style={{
            fontSize: "10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            color: wallColor, background: "rgba(255,255,255,0.85)",
            padding: "2px 6px", borderRadius: "3px", whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// === TREE COMPONENT (instanced for performance) ===
function Trees({ positions }) {
  const trunkRef = useRef();
  const canopyRef = useRef();
  const canopy2Ref = useRef();

  const count = positions.length;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useMemo(() => {
    positions.forEach((t, i) => {
      // Trunk
      dummy.position.set(t.x - SITE.w / 2, 1.5 * t.s, t.z - SITE.d / 2);
      dummy.scale.set(t.s * 0.3, t.s * 3, t.s * 0.3);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      // Main canopy
      dummy.position.set(t.x - SITE.w / 2, 3.5 * t.s, t.z - SITE.d / 2);
      dummy.scale.set(t.s * 2.5, t.s * 2, t.s * 2.5);
      dummy.updateMatrix();
      canopyRef.current?.setMatrixAt(i, dummy.matrix);

      // Highlight canopy
      dummy.position.set(t.x - SITE.w / 2 - 0.3 * t.s, 4 * t.s, t.z - SITE.d / 2 - 0.3 * t.s);
      dummy.scale.set(t.s * 1.8, t.s * 1.6, t.s * 1.8);
      dummy.updateMatrix();
      canopy2Ref.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (canopyRef.current) canopyRef.current.instanceMatrix.needsUpdate = true;
    if (canopy2Ref.current) canopy2Ref.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  return (
    <>
      <instancedMesh ref={trunkRef} args={[null, null, count]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 6]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[null, null, count]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={COLORS.tree} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={canopy2Ref} args={[null, null, count]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={COLORS.treeLight} roughness={0.85} transparent opacity={0.7} />
      </instancedMesh>
    </>
  );
}

// === ROAD COMPONENT ===
function Road3D({ x, z, w, d, label }) {
  return (
    <group>
      <mesh position={[x - SITE.w / 2, 0.05, z - SITE.d / 2]} receiveShadow>
        <boxGeometry args={[w, 0.1, d]} />
        <meshStandardMaterial color={COLORS.road} roughness={0.9} />
      </mesh>
      {/* Sidewalks */}
      <mesh position={[x - SITE.w / 2, 0.08, z - SITE.d / 2 - d / 2 - 1.2]} receiveShadow>
        <boxGeometry args={[w + 2, 0.06, 2]} />
        <meshStandardMaterial color={COLORS.sidewalk} roughness={0.7} />
      </mesh>
      <mesh position={[x - SITE.w / 2, 0.08, z - SITE.d / 2 + d / 2 + 1.2]} receiveShadow>
        <boxGeometry args={[w + 2, 0.06, 2]} />
        <meshStandardMaterial color={COLORS.sidewalk} roughness={0.7} />
      </mesh>
      {label && (
        <Html position={[x - SITE.w / 2, 0.5, z - SITE.d / 2 + d / 2 + 5]} center style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "9px", fontWeight: 600, color: "#1B3A5C", fontFamily: "'DM Sans', sans-serif", letterSpacing: "2px", whiteSpace: "nowrap", opacity: 0.7 }}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// === DETENTION POND ===
function Pond({ x, z, w, d }) {
  return (
    <mesh position={[x - SITE.w / 2, -0.3, z - SITE.d / 2]} receiveShadow>
      <boxGeometry args={[w, 0.6, d]} />
      <meshStandardMaterial color={COLORS.water} transparent opacity={0.35} roughness={0.3} />
    </mesh>
  );
}

// === ENTRANCE MONUMENT ===
function Monument({ x, z }) {
  return (
    <group position={[x - SITE.w / 2, 0.75, z - SITE.d / 2]}>
      <mesh castShadow>
        <boxGeometry args={[8, 1.5, 3]} />
        <meshStandardMaterial color={COLORS.monument} roughness={0.6} />
      </mesh>
      {/* Sign face */}
      <mesh position={[0, 0.2, 1.55]}>
        <planeGeometry args={[6, 0.8]} />
        <meshStandardMaterial color={COLORS.white} roughness={0.3} />
      </mesh>
      <Html position={[0, 1.8, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "8px", fontWeight: 700, color: "#1B3A5C", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", background: "rgba(255,255,255,0.8)", padding: "1px 4px", borderRadius: "2px" }}>ITPH ENTRANCE</div>
      </Html>
    </group>
  );
}

// === POOL/AMENITY ===
function Pool({ x, z }) {
  return (
    <mesh position={[x - SITE.w / 2, 0.02, z - SITE.d / 2]}>
      <cylinderGeometry args={[4, 4, 0.2, 16]} />
      <meshStandardMaterial color="#5CA0C2" transparent opacity={0.5} roughness={0.2} />
    </mesh>
  );
}

// === SCENE ===
function Scene() {
  const treePositions = useMemo(() => generateTrees(), []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[80, 100, 60]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-180}
        shadow-camera-right={180}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-far={300}
      />
      <directionalLight position={[-40, 60, -30]} intensity={0.3} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[SITE.w + 20, SITE.d + 20]} />
        <meshStandardMaterial color={COLORS.grass} roughness={0.95} />
      </mesh>

      {/* Property boundary grass (slightly different shade) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SITE.w, SITE.d]} />
        <meshStandardMaterial color={COLORS.grassDark} roughness={0.9} />
      </mesh>

      {/* Detention ponds */}
      <Pond x={150} z={12} w={260} d={18} />
      <Pond x={150} z={188} w={260} d={14} />

      {/* Roads */}
      {roads.map((r, i) => (
        <Road3D key={i} x={r.x} z={r.z} w={r.w} d={r.d} label={r.label} />
      ))}

      {/* Entrance monument */}
      <Monument x={100} z={185} />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building3D key={i} {...b} />
      ))}

      {/* Pool */}
      <Pool x={68} z={95} />

      {/* Trees */}
      <Trees positions={treePositions} />

      {/* District labels (floating) */}
      <Html position={[-105, 15, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#D4A843", fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>MULTIFAMILY</div>
      </Html>
      <Html position={[20, 12, -25]} center style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0D7377", fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>FLEX</div>
      </Html>
      <Html position={[10, 10, 30]} center style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#888780", fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>INDUSTRIAL</div>
      </Html>
      <Html position={[95, 10, -10]} center style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#3B6D11", fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>RETAIL</div>
      </Html>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.3}
        minDistance={80}
        maxDistance={400}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />
    </>
  );
}

// === MAIN EXPORT ===
export default function ITPH3DSiteModel() {
  return (
    <div style={{ width: "100%", height: "500px", borderRadius: "10px", overflow: "hidden", background: "#D4ECFB", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Canvas
        shadows
        camera={{ position: [180, 120, 140], fov: 45, near: 1, far: 1000 }}
        gl={{ antialias: true }}
      >
        <Scene />
        <fog attach="fog" args={["#D4ECFB", 250, 500]} />
      </Canvas>

      {/* Overlay legend */}
      <div style={{
        position: "absolute", bottom: "12px", left: "12px",
        background: "rgba(255,255,255,0.92)", borderRadius: "8px",
        padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#1B3A5C", marginBottom: "6px" }}>Legend</div>
        {[
          [COLORS.mfWall, "Multifamily — 36.62 ac"],
          [COLORS.rtlWall, "Retail — 23.48 ac"],
          [COLORS.flxWall, "Flex — 21.55 ac"],
          [COLORS.indWall, "Industrial — 6.00 ac"],
          [COLORS.water, "Detention — 24.27 ac"]
        ].map(([c, l], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: c }} />
            <span style={{ fontSize: "9px", color: "#5F5E5A" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* North arrow */}
      <div style={{
        position: "absolute", top: "12px", right: "12px",
        background: "rgba(255,255,255,0.9)", borderRadius: "50%",
        width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px", fontWeight: 700, color: "#1B3A5C"
      }}>N</div>

      {/* Controls hint */}
      <div style={{
        position: "absolute", top: "12px", left: "12px",
        background: "rgba(255,255,255,0.85)", borderRadius: "6px",
        padding: "6px 10px", fontSize: "9px", color: "#5F5E5A",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        Drag to rotate · Scroll to zoom · Shift+drag to pan
      </div>

      {/* Branding */}
      <div style={{
        position: "absolute", bottom: "12px", right: "12px",
        fontSize: "9px", color: "rgba(0,0,0,0.3)",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        Keystone™ 2026 · Conceptual
      </div>
    </div>
  );
}
