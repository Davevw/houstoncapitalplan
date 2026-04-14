import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, Download } from "lucide-react";
import { jvReports } from "@/data/jvReports";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

export default function JVReports() {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const selected = jvReports[0];

  const viewUrl = `https://drive.google.com/file/d/${selected.driveId}/view`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${selected.driveId}`;

  useEffect(() => {
    fetch(selected.htmlFile)
      .then((res) => res.text())
      .then(setHtmlContent)
      .catch(() => setHtmlContent("<p>Failed to load report.</p>"));
  }, [selected.htmlFile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "20px 28px", borderBottom: `3px solid ${GOLD}` }}>
        <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
          📋 JV Reports
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "4px 0 0", letterSpacing: 0.3 }}>
          Joint Venture Partner Reports · ITP Houston Capital Plan
        </p>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: "1px solid #E0E4E8", background: "white" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, flex: 1 }}>
              {selected.title} — {selected.month} {selected.year}
            </span>
            <a href={downloadUrl}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: GOLD, color: NAVY, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              <Download size={13} /> Download
            </a>
          </div>

          <div style={{ flex: 1, background: "#F0F2F5", minHeight: 500 }}>
            <iframe
              srcDoc={htmlContent}
              title={`${selected.title} — ${selected.month} ${selected.year}`}
              sandbox="allow-scripts"
              style={{ width: "100%", height: "100%", border: "none", background: "#f4f4f4" }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 20px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#7A8B9A", letterSpacing: 1, borderTop: "1px solid #E0E4E8", background: "white" }}>
        PLUSAdvantage™ 2026 — CONFIDENTIAL
      </div>

    </div>
  );
}
