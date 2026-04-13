import React, { useState } from "react";

const NAVY = "#0B3D5C";
const ADMIN_CODE = "HC01";
const SESSION_KEY = "admin_unlocked";

export function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function unlockAdmin(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    // ignore
  }
}

interface AdminPasscodeGateProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AdminPasscodeGate({ onSuccess, onClose }: AdminPasscodeGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit() {
    if (code.toUpperCase() === ADMIN_CODE.toUpperCase()) {
      unlockAdmin();
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
        background: "rgba(0,0,0,0.65)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
          Admin Access Required
        </div>
        <div
          style={{ fontSize: 13, color: "#7A8B9A", marginBottom: 24, lineHeight: 1.5 }}
        >
          This section is restricted to authorized administrators.
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
            if (e.key === "Escape") onClose();
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
