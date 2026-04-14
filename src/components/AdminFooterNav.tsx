import React, { useState } from "react";
import AdminPasscodeGate, { isAdminUnlocked } from "./AdminPasscodeGate";

const NAVY = "#0B3D5C";
const TEAL = "#0B4C72";

export type AdminTab = "data-vault" | "waterfall" | "tax-dashboard" | null;

interface NavItem {
  id: AdminTab;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "waterfall", icon: "💧", label: "Waterfall" },
  { id: "tax-dashboard", icon: "🏛️", label: "Tax Dashboard" },
  { id: "data-vault", icon: "📊", label: "Data Vault" },
];

interface AdminFooterNavProps {
  activeAdminTab: AdminTab;
  onTabSelect: (tab: AdminTab) => void;
}

export default function AdminFooterNav({ activeAdminTab, onTabSelect }: AdminFooterNavProps) {
  const [showGate, setShowGate] = useState(false);
  const [pendingTab, setPendingTab] = useState<AdminTab>(null);

  function handleTabClick(tab: AdminTab) {
    if (isAdminUnlocked()) {
      // Toggle: if already active, close it
      onTabSelect(activeAdminTab === tab ? null : tab);
    } else {
      // Show passcode gate
      setPendingTab(tab);
      setShowGate(true);
    }
  }

  function handleUnlocked() {
    setShowGate(false);
    if (pendingTab) {
      onTabSelect(pendingTab);
      setPendingTab(null);
    }
  }

  return (
    <>
      {showGate && (
        <AdminPasscodeGate
          onSuccess={handleUnlocked}
          onClose={() => {
            setShowGate(false);
            setPendingTab(null);
          }}
        />
      )}

      {/* Sticky footer bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          background: `linear-gradient(135deg,${NAVY} 0%,${TEAL} 100%)`,
          borderTop: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.25)",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: 56,
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginRight: 20,
            whiteSpace: "nowrap",
          }}
        >
          🔒 Admin
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  transition: "all 0.2s",
                  background: isActive ? "white" : "rgba(255,255,255,0.12)",
                  color: isActive ? NAVY : "rgba(255,255,255,0.85)",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* PLUSAdvantage brand */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 1,
            marginLeft: 20,
            whiteSpace: "nowrap",
          }}
        >
          PLUSAdvantage™
        </div>
      </div>
    </>
  );
}
