import React, { useState } from "react";

const NAVY = "#0B3D5C";
const ADMIN_CODE = "HC01";
const SESSION_KEY = "admin_unlocked";
const ROLE_KEY = "itph_access_role";

// ── Role-based access (KCC Capital Plan pattern) ───────────────
// "admin" → full access: all tabs + Admin menu (Data Vault, Waterfall,
//            Tax Dashboard, JV Reports, Capital Model)
// "user"  → viewer access: the 8 non-sensitive tabs ONLY. No Expenditures,
//            no Deemed Capital, no Admin menu.
export type AccessRole = "admin" | "user" | null;

const ADMIN_CODES = ["HC01", "ROY01", "ML01"];
const USER_CODES = ["USER"];

export function resolveRole(code: string): AccessRole {
  const c = code.trim().toUpperCase();
  if (ADMIN_CODES.includes(c)) return "admin";
  if (USER_CODES.includes(c)) return "user";
  return null;
}

export function getAccessRole(): AccessRole {
  try {
    // Back-compat: sessions unlocked before roles existed are admin sessions.
    if (sessionStorage.getItem(SESSION_KEY) === "true") return "admin";
    const r = sessionStorage.getItem(ROLE_KEY);
    if (r === "admin" || r === "user") return r;
    return null;
  } catch {
    return null;
  }
}

export function unlockRole(role: Exclude<AccessRole, null>): void {
  try {
    sessionStorage.setItem(ROLE_KEY, role);
    if (role === "admin") sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    // ignore
  }
}

export function isAdminUnlocked(): boolean {
  return getAccessRole() === "admin";
}

export function unlockAdmin(): void {
  unlockRole("admin");
}

interface AdminPasscodeGateProps {
  onSuccess: () => void;
  onClose: () => void;
  /** When true, accepts the "user" viewer passcode as well as admin codes. */
  allowUserRole?: boolean;
  title?: string;
  subtitle?: string;
  /** When set, the gate cannot be dismissed (entry gate mode). */
  locked?: boolean;
}

export default function AdminPasscodeGate({
  onSuccess,
  onClose,
  allowUserRole = false,
  title,
  subtitle,
  locked = false,
}: AdminPasscodeGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit() {
    const role = resolveRole(code);
    if (role === "admin" || (role === "user" && allowUserRole)) {
      unlockRole(role);
      onSuccess();
    } else {
      setError(true);
      setCode("");
    }
  }

  return (
    // Overlay
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: locked ? "rgba(7,42,64,0.92)" : "rgba(0,0,0,0.65)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (!locked && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "40px 36px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          textAlign: "center",
          maxWidth: 360,
          width: "90%",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: NAVY,
            fontFamily: "Georgia,serif",
            marginBottom: 6,
          }}
        >
          {title ?? "Admin Access Required"}
        </div>
        <div
          style={{ fontSize: 13, color: "#7A8B9A", marginBottom: 24, lineHeight: 1.5 }}
        >
          {subtitle ?? "This section is restricted to authorized administrators."}
        </div>

        <input
          type="password"
          value={code}
          autoFocus
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape" && !locked) onClose();
          }}
          placeholder="Enter access code"
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: `2px solid ${error ? "#E85D75" : "#D0D7DE"}`,
            fontSize: 15,
            textAlign: "center",
            letterSpacing: 6,
            marginBottom: 8,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />

        {error && (
          <div
            style={{
              fontSize: 12,
              color: "#E85D75",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Invalid access code. Please try again.
          </div>
        )}
        {!error && <div style={{ height: 28 }} />}

        <div style={{ display: "flex", gap: 10 }}>
          {!locked && (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 8,
                background: "white",
                color: "#7A8B9A",
                fontSize: 14,
                fontWeight: 600,
                border: "1.5px solid #D0D7DE",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: 8,
              background: NAVY,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
