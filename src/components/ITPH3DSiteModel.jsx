// ITPH 3D Interactive Site Model — with investment pop-ups, soccer park, enhanced landscape
// Dependencies: @react-three/fiber, @react-three/drei, three

import { useRef, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import * as THREE from "three";

// === DISTRICT COLORS ===
const COLORS = {
  mfWall: "#A0623D", mfRoof: "#8B7355",
  rtlWall: "#C4B99A", rtlRoof: "#B5AD90",
  flxWall: "#94A3B0", flxRoof: "#78909C",
  indWall: "#9E9790", indRoof: "#6B7B82",
  grass: "#8FBF3A", grassDark: "#5B7B1A",
  road: "#505050", sidewalk: "#D0C9BD",
  water: "#4A90D9", tree: "#3E7B27", treeDark: "#2E6B1A", treeLight: "#55A630",
  trunk: "#5D4037", monument: "#C4B99A", white: "#FFFFFF",
  parking: "#757575", soccer: "#4CAF50", soccerLine: "#FFFFFF",
};

const DISTRICT_LABEL = { mf: "Multifamily", rtl: "Retail", flx: "Flex", ind: "Industrial", soc: "Amenity" };
const DISTRICT_ACCENT = { mf: "#D4A843", rtl: "#3B6D11", flx: "#0D7377", ind: "#888780", soc: "#4CAF50" };
const NAVY = "#1B3A5C";

// === LOT INVESTMENT DATA ===
// Per LOVABLE_Enhancement_Instructions_Final.md
const LOT_DATA = {
  13: { district:"mf", area_ac:11.8, area_sf:514008, land_psf:6.50, land:3341052, horiz:2965084, vHard:17496272, vSoft:2624441, total:26426849, loan:13213425, reserve:2642685, equity:15856110, saleProceeds:3341052, infraAlloc:2965084, debtAlloc:0, netRelease:375968, height:"3-4 stories", setback:"25'", materials:"65% masonry", landscape:"20%", parking:"1.5/unit", status:"Available" },
  14: { district:"mf", area_ac:13.2, area_sf:575000, land_psf:7.50, land:4312500, horiz:3316867, vHard:19550000, vSoft:2932500, total:30111867, loan:15055934, reserve:3011187, equity:18067120, saleProceeds:4312500, infraAlloc:3316867, debtAlloc:0, netRelease:995633, height:"3-4 stories", setback:"25'", materials:"65% masonry", landscape:"20%", parking:"1.5/unit", status:"Available" },
  15: { district:"mf", area_ac:11.2, area_sf:487872, land_psf:7.50, land:3659040, horiz:2814327, vHard:16587648, vSoft:2488147, total:25549162, loan:12774581, reserve:2554916, equity:15329497, saleProceeds:3659040, infraAlloc:2814327, debtAlloc:0, netRelease:844713, height:"3-4 stories", setback:"25'", materials:"65% masonry", landscape:"20%", parking:"1.5/unit", status:"Available" },
  16: { district:"mf", area_ac:12.3, area_sf:535788, land_psf:7.50, land:4018410, horiz:3090563, vHard:18216792, vSoft:2732519, total:28058284, loan:14029142, reserve:2805828, equity:16834970, saleProceeds:4018410, infraAlloc:3090563, debtAlloc:0, netRelease:927847, height:"3-4 stories", setback:"25'", materials:"65% masonry", landscape:"20%", parking:"1.5/unit", status:"Available" },
  1:  { district:"flx", area_ac:3.88, area_sf:169013, land_psf:7.25, land:1225344, horiz:975070, vHard:4943881, vSoft:741582, total:7885877, loan:3942939, reserve:788588, equity:4731527, saleProceeds:1225344, infraAlloc:975070, debtAlloc:0, netRelease:250274, height:"2-story", setback:"25'", materials:"Tilt-up + metal panel", landscape:"10%", parking:"1/300 ofc + 1/1000 wh", status:"Available" },
  5:  { district:"flx", area_ac:6.4,  area_sf:278784, land_psf:6.50, land:1812096, horiz:1608434, vHard:8156406, vSoft:1223461, total:12800397, loan:6400199, reserve:1280040, equity:7680239, saleProceeds:1812096, infraAlloc:1608434, debtAlloc:0, netRelease:203662, height:"2-story", setback:"25'", materials:"Tilt-up + metal panel", landscape:"10%", parking:"1/300 ofc + 1/1000 wh", status:"Available" },
  6:  { district:"flx", area_ac:4.9,  area_sf:213444, land_psf:6.50, land:1387386, horiz:1231225, vHard:6243237, vSoft:936486, total:9798334, loan:4899167, reserve:979833, equity:5879000, saleProceeds:1387386, infraAlloc:1231225, debtAlloc:0, netRelease:156161, height:"2-story", setback:"25'", materials:"Tilt-up + metal panel", landscape:"10%", parking:"1/300 ofc + 1/1000 wh", status:"Available" },
  7:  { district:"flx", area_ac:3.3,  area_sf:143748, land_psf:15.00, land:2156220, horiz:829460, vHard:4204628, vSoft:630694, total:7821002, loan:3910501, reserve:782100, equity:4692601, saleProceeds:2156220, infraAlloc:829460, debtAlloc:0, netRelease:1326760, height:"2-story", setback:"25'", materials:"Tilt-up + metal panel", landscape:"10%", parking:"1/300 ofc + 1/1000 wh", status:"Available" },
  9:  { district:"flx", area_ac:3.1,  area_sf:135036, land_psf:6.50, land:877734, horiz:779117, vHard:3949553, vSoft:592433, total:6198837, loan:3099419, reserve:619884, equity:3719302, saleProceeds:877734, infraAlloc:779117, debtAlloc:0, netRelease:98617, height:"2-story", setback:"25'", materials:"Tilt-up + metal panel", landscape:"10%", parking:"1/300 ofc + 1/1000 wh", status:"Available" },
  10: { district:"ind", area_ac:2.4, area_sf:104544, land_psf:6.50, land:679536, horiz:603139, vHard:2874960, vSoft:431244, total:4588879, loan:2294440, reserve:458888, equity:2753327, saleProceeds:679536, infraAlloc:603139, debtAlloc:0, netRelease:76397, height:"1-story", setback:"30'", materials:"Tilt-up w/ reveals", landscape:"10%", parking:"1/1000 SF", status:"Under Contract (083 Auto)" },
  11: { district:"ind", area_ac:1.8, area_sf:78408, land_psf:6.50, land:509652, horiz:452354, vHard:2156220, vSoft:323433, total:3441659, loan:1720830, reserve:344166, equity:2065000, saleProceeds:509652, infraAlloc:452354, debtAlloc:0, netRelease:57298, height:"1-story", setback:"30'", materials:"Tilt-up w/ reveals", landscape:"10%", parking:"1/1000 SF", status:"Available" },
  12: { district:"ind", area_ac:1.8, area_sf:78408, land_psf:6.50, land:509652, horiz:452354, vHard:2156220, vSoft:323433, total:3441659, loan:1720830, reserve:344166, equity:2065000, saleProceeds:509652, infraAlloc:452354, debtAlloc:0, netRelease:57298, height:"1-story", setback:"30'", materials:"Tilt-up w/ reveals", landscape:"10%", parking:"1/1000 SF", status:"Under Contract (Paul Momoh)" },
  18: { district:"ind", area_ac:1.2, area_sf:52272, land_psf:6.50, land:339768, horiz:301570, vHard:1437480, vSoft:215622, total:2294440, loan:1147220, reserve:229444, equity:1376664, saleProceeds:339768, infraAlloc:301570, debtAlloc:0, netRelease:38198, height:"1-story", setback:"30'", materials:"Tilt-up w/ reveals", landscape:"10%", parking:"1/1000 SF", status:"Available" },
  2:  { district:"rtl", area_ac:1.4, area_sf:60984, land_psf:15.00, land:914760, horiz:351832, vHard:2286900, vSoft:343035, total:3896527, loan:1948264, reserve:389653, equity:2337916, saleProceeds:914760, infraAlloc:351832, debtAlloc:0, netRelease:562928, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
  3:  { district:"rtl", area_ac:1.2, area_sf:52272, land_psf:15.00, land:784080, horiz:301570, vHard:1960200, vSoft:294030, total:3339880, loan:1669940, reserve:333988, equity:2003928, saleProceeds:784080, infraAlloc:301570, debtAlloc:0, netRelease:482510, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
  4:  { district:"rtl", area_ac:1.2, area_sf:52272, land_psf:15.00, land:784080, horiz:301570, vHard:1960200, vSoft:294030, total:3339880, loan:1669940, reserve:333988, equity:2003928, saleProceeds:784080, infraAlloc:301570, debtAlloc:0, netRelease:482510, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
  8:  { district:"rtl", area_ac:1.3, area_sf:56628, land_psf:7.00, land:396396, horiz:326701, vHard:2123550, vSoft:318533, total:3165180, loan:1582590, reserve:316518, equity:1899108, saleProceeds:396396, infraAlloc:326701, debtAlloc:0, netRelease:69695, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
  17: { district:"rtl", area_ac:1.0, area_sf:43560, land_psf:15.00, land:653400, horiz:251308, vHard:1633500, vSoft:245025, total:2783233, loan:1391617, reserve:278323, equity:1669940, saleProceeds:653400, infraAlloc:251308, debtAlloc:0, netRelease:402092, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Under Contract (Shazeb Ali — gas station)" },
  22: { district:"rtl", area_ac:1.0, area_sf:43560, land_psf:15.00, land:653400, horiz:251308, vHard:1633500, vSoft:245025, total:2783233, loan:1391617, reserve:278323, equity:1669940, saleProceeds:653400, infraAlloc:251308, debtAlloc:0, netRelease:402092, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Under Contract (Shazeb Ali — gas station)" },
  19: { district:"rtl", area_ac:1.3, area_sf:56628, land_psf:15.00, land:849420, horiz:326701, vHard:2123550, vSoft:318533, total:3618204, loan:1809102, reserve:361820, equity:2170922, saleProceeds:849420, infraAlloc:326701, debtAlloc:0, netRelease:522719, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
  29: { district:"rtl", area_ac:1.3, area_sf:56628, land_psf:15.00, land:849420, horiz:326701, vHard:2123550, vSoft:318533, total:3618204, loan:1809102, reserve:361820, equity:2170922, saleProceeds:849420, infraAlloc:326701, debtAlloc:0, netRelease:522719, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
  30: { district:"rtl", area_ac:1.3, area_sf:56628, land_psf:15.00, land:849420, horiz:326701, vHard:2123550, vSoft:318533, total:3618204, loan:1809102, reserve:361820, equity:2170922, saleProceeds:849420, infraAlloc:326701, debtAlloc:0, netRelease:522719, height:"1-story", setback:"15'", materials:"Masonry/glass storefront", landscape:"15%", parking:"1/250 SF", status:"Available" },
};

// Soccer park is a special "amenity" with lease structure (no construction budget)
const SOCCER_DATA = {
  district: "soc", area_ac: 5.0, area_sf: 217800,
  status: "Verbal (Revolution Soccer)",
  lease: { rate: 25000, term: "10-yr + 1 renewal", structure: "NNN", npv: 3570000 },
};

// === SITE DIMENSIONS ===
const SITE = { w: 300, d: 200 };

// === BUILDINGS — each clickable lot has lotId, secondary blocks are decoration only ===
const buildings = [
  // MULTIFAMILY
  { x: 45, z: 50, w: 50, d: 22, h: 12, district: "mf", lotId: 14, label: "Lot 14", labelY: 14 },
  { x: 55, z: 52, w: 35, d: 18, h: 11, district: "mf" },
  { x: 42, z: 85, w: 48, d: 20, h: 12, district: "mf", lotId: 15, label: "Lot 15", labelY: 14 },
  { x: 55, z: 87, w: 30, d: 16, h: 11, district: "mf" },
  { x: 45, z: 135, w: 52, d: 22, h: 12, district: "mf", lotId: 16, label: "Lot 16", labelY: 14 },
  { x: 58, z: 138, w: 32, d: 18, h: 11, district: "mf" },
  { x: 68, z: 70, w: 12, d: 8, h: 4, district: "mf" },
  { x: 72, z: 110, w: 10, d: 6, h: 3.5, district: "mf" },
  // Lot 13 (multifamily south)
  { x: 70, z: 165, w: 50, d: 22, h: 12, district: "mf", lotId: 13, label: "Lot 13", labelY: 14 },
  // FLEX
  { x: 130, z: 45, w: 38, d: 20, h: 8, district: "flx", lotId: 1, label: "Lot 1", labelY: 10 },
  { x: 175, z: 45, w: 42, d: 22, h: 8.5, district: "flx", lotId: 5, label: "Lot 5", labelY: 10 },
  { x: 130, z: 75, w: 36, d: 18, h: 7.5, district: "flx", lotId: 6, label: "Lot 6", labelY: 9 },
  { x: 175, z: 75, w: 40, d: 18, h: 8, district: "flx", lotId: 7, label: "Lot 7", labelY: 10 },
  { x: 132, z: 100, w: 34, d: 16, h: 7, district: "flx", lotId: 9, label: "Lot 9", labelY: 9 },
  // INDUSTRIAL
  { x: 128, z: 135, w: 28, d: 18, h: 6, district: "ind", lotId: 10, label: "Lot 10", labelY: 8 },
  { x: 158, z: 135, w: 30, d: 18, h: 6.5, district: "ind", lotId: 11, label: "Lot 11", labelY: 8 },
  { x: 190, z: 135, w: 28, d: 18, h: 6, district: "ind", lotId: 12, label: "Lot 12", labelY: 8 },
  { x: 160, z: 160, w: 36, d: 14, h: 5.5, district: "ind", lotId: 18, label: "Lot 18", labelY: 7 },
  // RETAIL
  { x: 235, z: 42, w: 30, d: 16, h: 5, district: "rtl", lotId: 2, label: "Lot 2", labelY: 7 },
  { x: 270, z: 42, w: 30, d: 16, h: 5, district: "rtl", lotId: 3, label: "Lot 3", labelY: 7 },
  { x: 235, z: 65, w: 30, d: 16, h: 5, district: "rtl", lotId: 4, label: "Lot 4", labelY: 7 },
  { x: 270, z: 65, w: 30, d: 16, h: 5, district: "rtl", lotId: 8, label: "Lot 8", labelY: 7 },
  { x: 235, z: 86, w: 28, d: 14, h: 4.5, district: "rtl", lotId: 17, label: "Lot 17" },
  { x: 270, z: 86, w: 28, d: 14, h: 4.5, district: "rtl", lotId: 22, label: "Lot 22" },
  { x: 232, z: 130, w: 20, d: 12, h: 4, district: "rtl", lotId: 19, label: "Lot 19" },
  { x: 240, z: 178, w: 28, d: 10, h: 3.5, district: "rtl", lotId: 29, label: "Lot 29" },
  { x: 275, z: 178, w: 28, d: 10, h: 3.5, district: "rtl", lotId: 30, label: "Lot 30" },
  // Decorative retail pads (no popups — small unlabeled)
  { x: 255, z: 130, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 278, z: 130, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 232, z: 147, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 255, z: 147, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 278, z: 147, w: 20, d: 12, h: 4, district: "rtl" },
  { x: 232, z: 163, w: 20, d: 12, h: 3.5, district: "rtl" },
  { x: 255, z: 163, w: 20, d: 12, h: 3.5, district: "rtl" },
  { x: 278, z: 163, w: 20, d: 12, h: 3.5, district: "rtl" },
];

// === ROADS ===
const roads = [
  { x: 150, z: 195, w: 310, d: 8, label: "Bissonnet Street" },
  { x: 5, z: 100, w: 8, d: 200 },
  { x: 295, z: 100, w: 8, d: 200 },
  { x: 150, z: 115, w: 280, d: 6 },
  { x: 100, z: 75, w: 5, d: 130 },
  { x: 215, z: 75, w: 5, d: 130 },
  { x: 100, z: 170, w: 5, d: 50 },
];

// === PARKING LOT RECTANGLES (subtle gray near buildings) ===
const parkingLots = [
  { x: 175, z: 30, w: 80, d: 8 },
  { x: 175, z: 60, w: 80, d: 8 },
  { x: 175, z: 90, w: 80, d: 8 },
  { x: 255, z: 30, w: 60, d: 8 },
  { x: 255, z: 55, w: 60, d: 8 },
  { x: 255, z: 78, w: 60, d: 8 },
  { x: 160, z: 148, w: 90, d: 6 },
];

// === TREE POSITIONS ===
function generateTrees() {
  const trees = [];
  let s = 42;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

  // Street trees along main E-W road (every 6 units)
  for (let i = 0; i < 46; i++) {
    trees.push({ x: 20 + i * 6, z: 110, s: 0.7 + r() * 0.3 });
    trees.push({ x: 22 + i * 6, z: 120, s: 0.6 + r() * 0.3 });
  }
  // N-S roads
  for (let i = 0; i < 22; i++) {
    trees.push({ x: 96, z: 20 + i * 8, s: 0.6 + r() * 0.2 });
    trees.push({ x: 104, z: 22 + i * 8, s: 0.5 + r() * 0.2 });
    trees.push({ x: 211, z: 20 + i * 8, s: 0.6 + r() * 0.2 });
    trees.push({ x: 219, z: 22 + i * 8, s: 0.5 + r() * 0.2 });
  }
  // Bissonnet street trees (every 6)
  for (let i = 0; i < 50; i++) {
    trees.push({ x: 12 + i * 6, z: 190, s: 0.8 + r() * 0.3 });
  }
  // Perimeter buffer — Cook (W) & Kirkwood (E) every 6
  for (let i = 0; i < 33; i++) {
    trees.push({ x: 12, z: 12 + i * 6, s: 0.9 + r() * 0.4 });
    trees.push({ x: 288, z: 12 + i * 6, s: 0.9 + r() * 0.4 });
  }
  // North perimeter
  for (let i = 0; i < 50; i++) {
    trees.push({ x: 12 + i * 6, z: 8, s: 0.8 + r() * 0.3 });
  }
  // MF district landscaping (denser)
  for (let i = 0; i < 35; i++) {
    trees.push({ x: 25 + r() * 70, z: 35 + r() * 145, s: 0.8 + r() * 0.5 });
  }
  // Retail landscaping
  for (let i = 0; i < 25; i++) {
    trees.push({ x: 225 + r() * 65, z: 30 + r() * 130, s: 0.6 + r() * 0.3 });
  }
  // Common areas / between clusters
  for (let i = 0; i < 18; i++) {
    trees.push({ x: 195 + r() * 25, z: 145 + r() * 30, s: 0.9 + r() * 0.5 });
  }
  for (let i = 0; i < 12; i++) {
    trees.push({ x: 110 + r() * 90, z: 90 + r() * 12, s: 0.7 + r() * 0.3 });
  }
  return trees;
}

// === BUILDING-BASE PLANTINGS ===
function generateBasePlantings() {
  const out = [];
  buildings.forEach(b => {
    const corners = [
      [b.x - b.w/2 - 1, b.z - b.d/2 - 1],
      [b.x + b.w/2 + 1, b.z - b.d/2 - 1],
      [b.x - b.w/2 - 1, b.z + b.d/2 + 1],
      [b.x + b.w/2 + 1, b.z + b.d/2 + 1],
    ];
    corners.forEach(([x, z]) => out.push({ x, z, s: 0.5 + Math.random() * 0.3 }));
  });
  return out;
}

// === 3D BUILDING COMPONENT ===
function Building3D({ x, z, w, d, h, district, label, labelY, lotId, onSelect, selected, hovered, onHover }) {
  const wallColor = COLORS[district + "Wall"];
  const roofColor = COLORS[district + "Roof"];
  const isInteractive = !!lotId;
  const isHi = selected || hovered;

  return (
    <group position={[x - SITE.w / 2, h / 2, z - SITE.d / 2]}>
      <mesh
        castShadow receiveShadow
        onClick={isInteractive ? (e) => { e.stopPropagation(); onSelect(lotId); } : undefined}
        onPointerOver={isInteractive ? (e) => { e.stopPropagation(); onHover(lotId); document.body.style.cursor = "pointer"; } : undefined}
        onPointerOut={isInteractive ? () => { onHover(null); document.body.style.cursor = "default"; } : undefined}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.8}
          emissive={isHi ? DISTRICT_ACCENT[district] : "#000000"}
          emissiveIntensity={isHi ? 0.35 : 0}
        />
      </mesh>
      <mesh position={[0, h / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[w + 0.5, 0.3, d + 0.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} />
      </mesh>

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
          <mesh position={[0, h / 2 - 1, d / 2 + 0.05]}>
            <planeGeometry args={[w, 1.5]} />
            <meshStandardMaterial color="#78909C" roughness={0.3} metalness={0.5} />
          </mesh>
        </>
      )}
      {district === "ind" && (
        <>
          <mesh position={[-w * 0.35, -h / 2 + 2.5, d / 2 + 0.05]}>
            <planeGeometry args={[w * 0.2, h * 0.6]} />
            <meshStandardMaterial color="#7EC8E3" transparent opacity={0.35} roughness={0.1} />
          </mesh>
          {Array.from({ length: Math.min(3, Math.floor(w / 10)) }).map((_, i) => (
            <mesh key={`dk-${i}`} position={[w * 0.1 + i * 8, -h / 2 + 2, d / 2 + 0.05]}>
              <planeGeometry args={[5, 4]} />
              <meshStandardMaterial color="#444444" transparent opacity={0.3} />
            </mesh>
          ))}
        </>
      )}

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

// === SOCCER PARK (clickable amenity) ===
function SoccerPark({ x, z, onSelect, selected, hovered, onHover }) {
  const isHi = selected || hovered;
  return (
    <group position={[x - SITE.w / 2, 0, z - SITE.d / 2]}>
      {/* Field */}
      <mesh
        position={[0, 0.15, 0]} receiveShadow
        onClick={(e) => { e.stopPropagation(); onSelect("soccer"); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover("soccer"); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = "default"; }}
      >
        <boxGeometry args={[40, 0.2, 25]} />
        <meshStandardMaterial color={COLORS.soccer} roughness={0.9} emissive={isHi ? "#4CAF50" : "#000"} emissiveIntensity={isHi ? 0.3 : 0} />
      </mesh>
      {/* Center line */}
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.3, 25]} />
        <meshStandardMaterial color={COLORS.soccerLine} transparent opacity={0.8} />
      </mesh>
      {/* Center circle */}
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[3, 3.3, 32]} />
        <meshStandardMaterial color={COLORS.soccerLine} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Penalty boxes */}
      <mesh position={[-17, 0.27, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[5, 5.2, 16, 1, 0, Math.PI]} />
        <meshStandardMaterial color={COLORS.soccerLine} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[17, 0.27, 0]} rotation={[-Math.PI/2, 0, Math.PI]}>
        <ringGeometry args={[5, 5.2, 16, 1, 0, Math.PI]} />
        <meshStandardMaterial color={COLORS.soccerLine} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Clubhouse */}
      <mesh position={[0, 2, 17]} castShadow receiveShadow>
        <boxGeometry args={[15, 4, 10]} />
        <meshStandardMaterial color={COLORS.monument} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2, 22.05]}>
        <planeGeometry args={[12, 3]} />
        <meshStandardMaterial color="#7EC8E3" transparent opacity={0.5} metalness={0.3} roughness={0.1} />
      </mesh>
      {/* Seating */}
      <mesh position={[0, 0.75, -16]} castShadow>
        <boxGeometry args={[20, 1.5, 3]} />
        <meshStandardMaterial color="#9E9E9E" roughness={0.8} />
      </mesh>
      {/* Label */}
      <Html position={[0, 6, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          color: "#4CAF50", background: "rgba(255,255,255,0.9)",
          padding: "3px 8px", borderRadius: "3px", whiteSpace: "nowrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
        }}>Soccer Park & Clubhouse — 5 ac</div>
      </Html>
    </group>
  );
}

// === TREES (instanced) ===
function Trees({ positions }) {
  const trunkRef = useRef();
  const canopyRef = useRef();
  const canopy2Ref = useRef();
  const count = positions.length;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useMemo(() => {
    positions.forEach((t, i) => {
      dummy.position.set(t.x - SITE.w / 2, 1.5 * t.s, t.z - SITE.d / 2);
      dummy.scale.set(t.s * 0.3, t.s * 3, t.s * 0.3);
      dummy.updateMatrix(); trunkRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x - SITE.w / 2, 3.5 * t.s, t.z - SITE.d / 2);
      dummy.scale.set(t.s * 2.5, t.s * 2, t.s * 2.5);
      dummy.updateMatrix(); canopyRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x - SITE.w / 2 - 0.3 * t.s, 4 * t.s, t.z - SITE.d / 2 - 0.3 * t.s);
      dummy.scale.set(t.s * 1.8, t.s * 1.6, t.s * 1.8);
      dummy.updateMatrix(); canopy2Ref.current?.setMatrixAt(i, dummy.matrix);
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

// === BASE PLANTINGS (instanced small shrubs) ===
function BasePlantings({ positions }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useMemo(() => {
    positions.forEach((p, i) => {
      dummy.position.set(p.x - SITE.w / 2, 0.6 * p.s, p.z - SITE.d / 2);
      dummy.scale.set(p.s, p.s, p.s);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);
  return (
    <instancedMesh ref={ref} args={[null, null, positions.length]} castShadow>
      <sphereGeometry args={[0.7, 6, 5]} />
      <meshStandardMaterial color={COLORS.treeLight} roughness={0.9} />
    </instancedMesh>
  );
}

// === ROAD ===
function Road3D({ x, z, w, d, label }) {
  return (
    <group>
      <mesh position={[x - SITE.w / 2, 0.05, z - SITE.d / 2]} receiveShadow>
        <boxGeometry args={[w, 0.1, d]} />
        <meshStandardMaterial color={COLORS.road} roughness={0.9} />
      </mesh>
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
          <div style={{ fontSize: "9px", fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif", letterSpacing: "2px", whiteSpace: "nowrap", opacity: 0.7 }}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// === PARKING ===
function ParkingLot({ x, z, w, d }) {
  return (
    <mesh position={[x - SITE.w / 2, 0.06, z - SITE.d / 2]} receiveShadow>
      <boxGeometry args={[w, 0.04, d]} />
      <meshStandardMaterial color={COLORS.parking} roughness={0.95} transparent opacity={0.5} />
    </mesh>
  );
}

// === DETENTION POND (reflective) ===
function Pond({ x, z, w, d }) {
  return (
    <mesh position={[x - SITE.w / 2, -0.3, z - SITE.d / 2]} receiveShadow>
      <boxGeometry args={[w, 0.6, d]} />
      <meshStandardMaterial color={COLORS.water} transparent opacity={0.7} metalness={0.3} roughness={0.2} />
    </mesh>
  );
}

// === MONUMENT (enlarged) ===
function Monument({ x, z }) {
  return (
    <group position={[x - SITE.w / 2, 1, z - SITE.d / 2]}>
      <mesh castShadow>
        <boxGeometry args={[10, 4, 2]} />
        <meshStandardMaterial color={COLORS.monument} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 1.05]}>
        <planeGeometry args={[8, 2.5]} />
        <meshStandardMaterial color={COLORS.white} roughness={0.3} />
      </mesh>
      <Html position={[0, 3.5, 0]} center style={{ pointerEvents: "none" }}>
        <div style={{
          fontSize: "10px", fontWeight: 800, color: NAVY, fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap", background: "rgba(255,255,255,0.95)", padding: "3px 8px",
          borderRadius: "3px", letterSpacing: "1px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}>HOUSTON INTERNATIONAL TRADE PARK</div>
      </Html>
    </group>
  );
}

// === POOL ===
function Pool({ x, z }) {
  return (
    <mesh position={[x - SITE.w / 2, 0.02, z - SITE.d / 2]}>
      <cylinderGeometry args={[4, 4, 0.2, 16]} />
      <meshStandardMaterial color="#5CA0C2" transparent opacity={0.5} roughness={0.2} metalness={0.3} />
    </mesh>
  );
}

// === SCENE ===
function Scene({ onSelect, selectedId, hoveredId, setHovered }) {
  const treePositions = useMemo(() => generateTrees(), []);
  const basePlantings = useMemo(() => generateBasePlantings(), []);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[80, 120, 60]} intensity={1.3} castShadow
        shadow-mapSize-width={4096} shadow-mapSize-height={4096}
        shadow-camera-left={-180} shadow-camera-right={180}
        shadow-camera-top={120} shadow-camera-bottom={-120}
        shadow-camera-far={350}
      />
      <directionalLight position={[-40, 60, -30]} intensity={0.3} />

      {/* Ground — lighter open lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[SITE.w + 40, SITE.d + 40]} />
        <meshStandardMaterial color={COLORS.grass} roughness={0.95} />
      </mesh>
      {/* Site core — darker planted */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[SITE.w, SITE.d]} />
        <meshStandardMaterial color={COLORS.grassDark} roughness={0.9} />
      </mesh>

      <Pond x={150} z={12} w={260} d={18} />
      <Pond x={150} z={188} w={260} d={14} />

      {roads.map((r, i) => <Road3D key={i} {...r} />)}
      {parkingLots.map((p, i) => <ParkingLot key={`pk-${i}`} {...p} />)}

      <Monument x={100} z={185} />

      {buildings.map((b, i) => (
        <Building3D key={i} {...b} onSelect={onSelect} onHover={setHovered}
          selected={b.lotId === selectedId} hovered={b.lotId === hoveredId} />
      ))}

      <SoccerPark x={245} z={28} onSelect={onSelect} onHover={setHovered}
        selected={selectedId === "soccer"} hovered={hoveredId === "soccer"} />

      <Pool x={68} z={95} />
      <Trees positions={treePositions} />
      <BasePlantings positions={basePlantings} />

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

      <Environment preset="park" />

      <OrbitControls
        enablePan enableZoom enableRotate
        autoRotate={!selectedId} autoRotateSpeed={0.3}
        minDistance={80} maxDistance={400}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// === INVESTMENT POP-UP OVERLAY ===
const fmt = (n) => "$" + Math.round(n).toLocaleString();
const fmtNeg = (n) => "(" + fmt(n) + ")";

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const color = s.includes("under contract") ? "#D4A843" : s.includes("verbal") ? "#2196F3" : "#4CAF50";
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999, background: color,
      color: "white", fontSize: 10, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function Row({ label, value, neg }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "3px 0", fontSize: 11 }}>
      <span style={{ color: "#5F5E5A" }}>{label}</span>
      <span style={{ color: neg ? "#B33A3A" : NAVY, fontWeight: 600, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 800, color: NAVY, letterSpacing: 1.2,
      textTransform: "uppercase", marginTop: 10, marginBottom: 4,
    }}>{children}</div>
  );
}

function LotPopup({ lotId, onClose, onViewFull }) {
  if (!lotId) return null;
  const isSoccer = lotId === "soccer";
  const data = isSoccer ? SOCCER_DATA : LOT_DATA[lotId];
  if (!data) return null;
  const accent = DISTRICT_ACCENT[data.district];
  const districtName = DISTRICT_LABEL[data.district];
  const title = isSoccer ? "Soccer Park" : `Lot ${lotId}`;
  const addr = isSoccer ? "12000 Bissonnet St — 5-ac amenity" : `12000 Bissonnet St, Lot ${lotId}`;

  return (
    <div style={{
      position: "absolute", top: 12, right: 12, width: 320, maxHeight: "calc(100% - 24px)",
      background: "rgba(255,255,255,0.97)", borderLeft: `4px solid ${accent}`, borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif",
      overflow: "auto", zIndex: 10,
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", background: NAVY, color: "white", borderRadius: "6px 6px 0 0", position: "relative" }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 8, right: 10, background: "transparent", border: "none",
            color: "white", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 4,
          }}
          aria-label="Close"
        >×</button>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{title}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: accent, color: data.district === "ind" ? NAVY : "white", fontSize: 10, fontWeight: 700 }}>
            {districtName}
          </span>
          <StatusBadge status={data.status} />
        </div>
        <div style={{ fontSize: 11, opacity: 0.85 }}>{addr}</div>
      </div>

      <div style={{ padding: "10px 16px 14px" }}>
        {!isSoccer && (
          <>
            <SectionLabel>Lot Acquisition</SectionLabel>
            <Row label="Lot Area" value={`${data.area_ac} ac / ${data.area_sf.toLocaleString()} SF`} />
            <Row label="Land Cost / SF" value={`$${data.land_psf.toFixed(2)}/SF`} />
            <Row label="Total Land Cost" value={fmt(data.land)} />

            <div style={{ borderTop: "1px solid #E8E4D8", marginTop: 8 }} />
            <SectionLabel>Development Budget</SectionLabel>
            <Row label="Land Acquisition" value={fmt(data.land)} />
            <Row label="Horizontal Dev" value={fmt(data.horiz)} />
            <Row label="Vertical Hard" value={fmt(data.vHard)} />
            <Row label="Vertical Soft (15%)" value={fmt(data.vSoft)} />
            <Row label="Total Budget" value={fmt(data.total)} />

            <div style={{ borderTop: "1px solid #E8E4D8", marginTop: 8 }} />
            <SectionLabel>Financing Structure</SectionLabel>
            <Row label="Construction Loan (50%)" value={fmt(data.loan)} />
            <Row label="Interest Rate" value="10.0%" />
            <Row label="24-Mo Interest Reserve" value={fmt(data.reserve)} />
            <Row label="Equity Required" value={fmt(data.equity)} />

            <div style={{ borderTop: "1px solid #E8E4D8", marginTop: 8 }} />
            <SectionLabel>Capital Paydown on Closing</SectionLabel>
            <Row label="Lot Sale Proceeds" value={fmt(data.saleProceeds)} />
            <Row label="Less: Infrastructure" value={fmtNeg(data.infraAlloc)} neg />
            <Row label="Less: Debt Paydown" value={fmtNeg(data.debtAlloc)} neg />
            <Row label="Net Capital Release" value={fmt(data.netRelease)} />

            <div style={{ borderTop: "1px solid #E8E4D8", marginTop: 8 }} />
            <SectionLabel>Design Standards</SectionLabel>
            <Row label="Max Height" value={data.height} />
            <Row label="Front Setback" value={data.setback} />
            <Row label="Materials" value={data.materials} />
            <Row label="Landscape Min" value={data.landscape} />
            <Row label="Parking" value={data.parking} />
          </>
        )}

        {isSoccer && (
          <>
            <SectionLabel>Site</SectionLabel>
            <Row label="Area" value={`${data.area_ac} ac / ${data.area_sf.toLocaleString()} SF`} />
            <Row label="Improvements" value="Lessee-funded" />

            <div style={{ borderTop: "1px solid #E8E4D8", marginTop: 8 }} />
            <SectionLabel>Lease Structure</SectionLabel>
            <Row label="Structure" value={data.lease.structure} />
            <Row label="Rent" value={`${fmt(data.lease.rate)}/mo`} />
            <Row label="Term" value={data.lease.term} />
            <Row label="Lessee" value="Soccer LLC (Revolution Soccer)" />
            <Row label="Est. NPV (20yr @7.5%)" value={fmt(data.lease.npv)} />
          </>
        )}

        <div style={{ borderTop: "1px solid #E8E4D8", marginTop: 12, paddingTop: 10 }}>
          {!isSoccer && (
            <button
              onClick={onViewFull}
              style={{
                width: "100%", padding: "8px 12px", background: NAVY, color: "white",
                border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif",
              }}
            >View full lot schedule →</button>
          )}
          <div style={{ fontSize: 9, color: "#888", marginTop: 8, textAlign: "center" }}>
            Contact: dave@wrfco.com · 760-672-0145
          </div>
        </div>
      </div>
    </div>
  );
}

// === MAIN EXPORT ===
export default function ITPH3DSiteModel() {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{
      width: "100%", height: "560px", borderRadius: "10px", overflow: "hidden",
      background: "linear-gradient(180deg, #D4ECFB 0%, #87CEEB 100%)", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <Canvas
        shadows
        camera={{ position: [180, 120, 140], fov: 45, near: 1, far: 1000 }}
        gl={{ antialias: true }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <Scene
          onSelect={setSelectedId}
          selectedId={selectedId}
          hoveredId={hoveredId}
          setHovered={setHoveredId}
        />
        <fog attach="fog" args={["#D4ECFB", 280, 550]} />
      </Canvas>

      <LotPopup
        lotId={selectedId}
        onClose={() => setSelectedId(null)}
        onViewFull={() => {
          // Lot Schedule is tab index 1 in main dashboard
          window.location.href = "/dashboard?tab=1";
        }}
      />

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: "12px", left: "12px",
        background: "rgba(255,255,255,0.92)", borderRadius: "8px",
        padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Legend · click any building</div>
        {[
          [COLORS.mfWall, "Multifamily — 36.62 ac"],
          [COLORS.rtlWall, "Retail — 23.48 ac"],
          [COLORS.flxWall, "Flex — 21.55 ac"],
          [COLORS.indWall, "Industrial — 6.00 ac"],
          [COLORS.water, "Detention — 24.27 ac"],
          [COLORS.soccer, "Soccer Park — 5.00 ac"],
        ].map(([c, l], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: c }} />
            <span style={{ fontSize: "9px", color: "#5F5E5A" }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute", top: "12px", left: "12px",
        background: "rgba(255,255,255,0.85)", borderRadius: "6px",
        padding: "6px 10px", fontSize: "9px", color: "#5F5E5A",
        fontFamily: "'DM Sans', sans-serif", maxWidth: 200,
      }}>
        Drag to rotate · Scroll to zoom · Click any building or the soccer park for investment detail
      </div>

      <div style={{
        position: "absolute", bottom: "12px", right: "12px",
        fontSize: "9px", color: "rgba(0,0,0,0.35)",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        Keystone™ 2026 · Conceptual
      </div>
    </div>
  );
}
