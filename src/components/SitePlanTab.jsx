import React, { useState, useMemo, useRef, useEffect } from "react";
import siteMapImg from "@/assets/itph-site-map.png";

const NAVY = "#0B3D5C";
const TEAL = "#0B4C72";
const STEEL = "#E0E4E8";

// Land use color mapping (matches site map legend)
const USE_COLORS = {
  Multifamily: { fill: "#D4A84B", label: "Multifamily", totalAcres: 36.62 },
  Retail: { fill: "#5C6E3D", label: "Retail", totalAcres: 23.48 },
  Flex: { fill: "#A8B57A", label: "Flex", totalAcres: 21.55 },
  Industrial: { fill: "#E8E4D8", label: "Commercial / Light Industrial", totalAcres: 6.0 },
  Detention: { fill: "#B8B8B0", label: "Detention Ponds / Channels", totalAcres: 24.27 },
  ROW: { fill: "#D8A88A", label: "Major Right-of-Ways", totalAcres: 9.21 },
};

// Parcel polygons digitized from site map (normalized 0-1 coords, x,y pairs)
// Coords approximate to image proportions (1470x834 source)
// Each parcel: id, use category, acres, intended use, polygon points (% of image)
const PARCELS = [
  // Multifamily (yellow)
  { id: 14, use: "Multifamily", acres: 13.2, label: "MF-14", note: "Northwest pad — 13.2 ac multifamily site", cx: 22, cy: 32 },
  { id: 15, use: "Multifamily", acres: 11.16, label: "MF-15", note: "Southwest pad — 11.16 ac multifamily site", cx: 22, cy: 60 },
  { id: 16, use: "Multifamily", acres: 12.26, label: "MF-16", note: "Central pad — 12.26 ac multifamily site", cx: 35, cy: 53 },
  // Flex (light green)
  { id: 1, use: "Flex", acres: 3.88, label: "FX-1", note: "Northern flex pad along Cook frontage", cx: 43, cy: 18 },
  { id: 5, use: "Flex", acres: 6.38, label: "FX-5", note: "Central-north flex parcel", cx: 47, cy: 30 },
  { id: 6, use: "Flex", acres: 4.88, label: "FX-6", note: "Central flex parcel", cx: 46, cy: 41 },
  { id: 7, use: "Flex", acres: 3.28, label: "FX-7", note: "Inner flex parcel", cx: 42, cy: 36 },
  { id: 9, use: "Flex", acres: 3.13, label: "FX-9", note: "South-central flex parcel", cx: 47, cy: 50 },
  { id: 13, use: "Flex", acres: 11.77, label: "FX-13", note: "Largest flex parcel — 11.77 ac", cx: 38, cy: 27 },
  // Retail (dark green band along S Kirkwood + perimeter)
  { id: 2, use: "Retail", acres: 1.37, label: "RT-2", note: "Kirkwood frontage retail pad", cx: 53, cy: 35 },
  { id: 3, use: "Retail", acres: 1.20, label: "RT-3", note: "Kirkwood frontage retail pad", cx: 53, cy: 39 },
  { id: 4, use: "Retail", acres: 1.20, label: "RT-4", note: "Kirkwood frontage retail pad", cx: 53, cy: 43 },
  { id: 8, use: "Retail", acres: 1.26, label: "RT-8", note: "Kirkwood frontage retail pad", cx: 53, cy: 50 },
  { id: 17, use: "Retail", acres: 1.20, label: "RT-17", note: "Cook Road frontage retail pad", cx: 16, cy: 49 },
  { id: 18, use: "Industrial", acres: 1.18, label: "CI-18", note: "Cook Road commercial / light industrial pad", cx: 19, cy: 47 },
  { id: 19, use: "Retail", acres: 1.96, label: "RT-19", note: "Inner retail pad", cx: 50, cy: 60 },
  { id: 20, use: "Retail", acres: 1.38, label: "RT-20", note: "Kirkwood frontage retail pad", cx: 53, cy: 32 },
  { id: 21, use: "Retail", acres: 1.14, label: "RT-21", note: "Kirkwood frontage retail pad", cx: 53, cy: 28 },
  { id: 22, use: "Retail", acres: 1.16, label: "RT-22", note: "Kirkwood frontage retail pad", cx: 53, cy: 25 },
  { id: 23, use: "Retail", acres: 2.03, label: "RT-23", note: "NE corner retail pad", cx: 52, cy: 17 },
  { id: 24, use: "Retail", acres: 1.21, label: "RT-24", note: "Cook Road frontage retail pad", cx: 16, cy: 44 },
  { id: 25, use: "Retail", acres: 1.38, label: "RT-25", note: "Cook Road frontage retail pad", cx: 16, cy: 41 },
  { id: 26, use: "Retail", acres: 1.21, label: "RT-26", note: "Cook Road frontage retail pad", cx: 16, cy: 35 },
  { id: 27, use: "Retail", acres: 1.03, label: "RT-27", note: "Cook Road frontage retail pad", cx: 16, cy: 29 },
  { id: 28, use: "Retail", acres: 1.03, label: "RT-28", note: "Cook Road frontage retail pad", cx: 16, cy: 27 },
  { id: 29, use: "Retail", acres: 1.04, label: "RT-29", note: "Cook Road frontage retail pad", cx: 16, cy: 24 },
  // Industrial / Commercial (light gray) — pads 10, 11, 12
  { id: 10, use: "Industrial", acres: 2.44, label: "CI-10", note: "Commercial / light industrial pad", cx: 43, cy: 60 },
  { id: 11, use: "Industrial", acres: 1.78, label: "CI-11", note: "Commercial / light industrial pad", cx: 44, cy: 67 },
  { id: 12, use: "Industrial", acres: 1.78, label: "CI-12", note: "Commercial / light industrial pad", cx: 45, cy: 72 },
  { id: 30, use: "Retail", acres: 1.5, label: "RT-30", note: "Bissonnet frontage pad", cx: 39, cy: 85 },
];

// Detention ponds (not numbered in LOTS schedule, shown on map)
const DETENTION = [
  { id: "D-N", acres: 10.89, label: "Detention North", cx: 38, cy: 12 },
  { id: "D-S", acres: 10.42, label: "Detention South", cx: 36, cy: 70 },
  { id: "D-SE", acres: 1.12, label: "Detention SE", cx: 44, cy: 80 },
];

function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, marginTop: 16, paddingBottom: 10, borderBottom: `2px solid ${STEEL}` }}>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", letterSpacing: 0.5 }}>{children}</h2>
    </div>
  );
}

export default function SitePlanTab() {
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [activeFilters, setActiveFilters] = useState(() => new Set(Object.keys(USE_COLORS)));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef(null);

  const allParcels = useMemo(() => [
    ...PARCELS,
    ...DETENTION.map(d => ({ ...d, use: "Detention", note: "Detention pond / drainage channel" })),
  ], []);

  const stats = useMemo(() => {
    const byUse = {};
    Object.keys(USE_COLORS).forEach(u => { byUse[u] = { count: 0, acres: 0 }; });
    PARCELS.forEach(p => {
      if (!byUse[p.use]) return;
      byUse[p.use].count++;
      byUse[p.use].acres += p.acres;
    });
    DETENTION.forEach(d => {
      byUse.Detention.count++;
      byUse.Detention.acres += d.acres;
    });
    // Override with legend totals (planning targets)
    Object.keys(USE_COLORS).forEach(u => {
      byUse[u].plannedAcres = USE_COLORS[u].totalAcres;
    });
    return byUse;
  }, []);

  const totalAcres = 136;
  const selected = selectedId ? allParcels.find(p => String(p.id) === String(selectedId)) : null;

  function toggleFilter(use) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(use)) next.delete(use);
      else next.add(use);
      return next;
    });
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.max(1, Math.min(4, z + delta)));
  }

  function onMouseDown(e) {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }
  function onMouseMove(e) {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }
  function onMouseUp() { setIsPanning(false); }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => onWheel(e);
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div>
      <SectionTitle icon="🗺️">Interactive Site Plan — 136-Acre Master Plan</SectionTitle>
      <div style={{ fontSize: 13, color: "#5A6B7A", marginBottom: 20, lineHeight: 1.6 }}>
        12000 Bissonnet Street, Houston TX. Bounded by Cook Road (west), S Kirkwood Road (east), and Bissonnet Street (south).
        Click any parcel to see details. Filter by land use, scroll to zoom, drag to pan.
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.entries(USE_COLORS).map(([key, cfg]) => {
          const active = activeFilters.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 14px", border: `2px solid ${cfg.fill}`,
                borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: active ? cfg.fill : "white",
                color: active ? (key === "Industrial" ? NAVY : "white") : NAVY,
                opacity: active ? 1 : 0.55, transition: "all 0.15s",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 2, background: cfg.fill, border: active ? "1px solid rgba(255,255,255,0.6)" : `1px solid ${cfg.fill}` }} />
              {cfg.label} • {cfg.totalAcres} ac
            </button>
          );
        })}
        <button
          onClick={() => setActiveFilters(new Set(Object.keys(USE_COLORS)))}
          style={{ padding: "8px 14px", border: `1px solid ${STEEL}`, borderRadius: 999, background: "white", color: NAVY, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Show All
        </button>
      </div>

      {/* Main grid: map + sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20, alignItems: "start" }}>
        {/* Map */}
        <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {/* Zoom controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${STEEL}`, background: "#F7F9FB" }}>
            <div style={{ fontSize: 11, color: "#7A8B9A", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {zoom > 1 ? "Drag to pan • Scroll to zoom" : "Scroll to zoom in"}
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button onClick={() => setZoom(z => Math.max(1, z - 0.25))} style={zoomBtn}>−</button>
              <div style={{ minWidth: 50, textAlign: "center", padding: "4px 8px", fontSize: 12, fontWeight: 600, color: NAVY }}>{Math.round(zoom * 100)}%</div>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} style={zoomBtn}>+</button>
              <button onClick={resetView} style={{ ...zoomBtn, fontSize: 11, width: "auto", padding: "4px 10px" }}>Reset</button>
            </div>
          </div>

          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              position: "relative", overflow: "hidden",
              cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
              background: "#0e1e2c", aspectRatio: "1470 / 834",
            }}
          >
            <div
              style={{
                position: "absolute", inset: 0,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.15s ease-out",
              }}
            >
              <img
                src={siteMapImg}
                alt="ITP Houston 136-acre site map"
                draggable={false}
                style={{ width: "100%", height: "100%", display: "block", userSelect: "none", pointerEvents: "none" }}
              />
              {/* Parcel hotspots overlay */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {allParcels.map(p => {
                  if (!activeFilters.has(p.use)) return null;
                  const isSelected = String(selectedId) === String(p.id);
                  const isHovered = String(hoverId) === String(p.id);
                  const color = USE_COLORS[p.use].fill;
                  const r = isSelected ? 2.2 : isHovered ? 1.9 : 1.5;
                  return (
                    <g key={p.id} style={{ cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); }}
                      onMouseEnter={() => setHoverId(p.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <circle cx={p.cx} cy={p.cy} r={r + 1.2} fill="white" opacity={isSelected || isHovered ? 0.9 : 0} />
                      <circle cx={p.cx} cy={p.cy} r={r} fill={color} stroke="white" strokeWidth={isSelected ? 0.5 : 0.3} />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Sidebar: details + stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Selected parcel */}
          {selected ? (
            <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7A8B9A", letterSpacing: 1, textTransform: "uppercase" }}>Parcel {selected.id}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", marginTop: 2 }}>{selected.label}</div>
                </div>
                <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A8B9A", fontSize: 18, padding: 0 }}>✕</button>
              </div>
              <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: USE_COLORS[selected.use].fill, color: selected.use === "Industrial" ? NAVY : "white", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
                {USE_COLORS[selected.use].label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#7A8B9A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Acres</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>{selected.acres.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#7A8B9A", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>% of Site</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>{((selected.acres / totalAcres) * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#5A6B7A", lineHeight: 1.5, paddingTop: 10, borderTop: `1px solid ${STEEL}` }}>
                {selected.note}
              </div>
            </div>
          ) : (
            <div style={{ background: "white", border: `1px dashed ${STEEL}`, borderRadius: 12, padding: 24, textAlign: "center", color: "#7A8B9A", fontSize: 13 }}>
              Click any parcel marker on the map to see details
            </div>
          )}

          {/* Stats */}
          <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7A8B9A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Site Composition</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", marginBottom: 4 }}>{totalAcres} <span style={{ fontSize: 14, color: "#7A8B9A", fontWeight: 500 }}>total acres</span></div>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 12, marginBottom: 14 }}>
              {Object.entries(USE_COLORS).map(([key, cfg]) => (
                <div key={key} style={{ width: `${(cfg.totalAcres / totalAcres) * 100}%`, background: cfg.fill }} title={`${cfg.label}: ${cfg.totalAcres} ac`} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(USE_COLORS).map(([key, cfg]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: cfg.fill, border: "1px solid rgba(0,0,0,0.1)" }} />
                    <span style={{ color: NAVY, fontWeight: 600 }}>{cfg.label}</span>
                  </div>
                  <div style={{ color: "#5A6B7A", fontVariantNumeric: "tabular-nums" }}>
                    <span style={{ fontWeight: 700, color: NAVY }}>{cfg.totalAcres}</span> ac
                    <span style={{ marginLeft: 6, fontSize: 11, color: "#94A3B0" }}>({((cfg.totalAcres / totalAcres) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const zoomBtn = {
  width: 28, height: 28, border: `1px solid ${STEEL}`, background: "white",
  color: NAVY, cursor: "pointer", borderRadius: 6, fontSize: 16, fontWeight: 700,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
