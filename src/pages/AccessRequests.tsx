import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminPasscodeGate, { isAdminUnlocked } from "@/components/AdminPasscodeGate";

const NAVY = "#0B3D5C";
const NAVY_DARK = "#072A40";
const GOLD = "#B8945A";
const LIGHT_GRAY = "#F5F7FA";
const BORDER = "#E1E7ED";
const MUTED = "#5A6B7A";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  investor_type: string;
  status: string;
  created_at: string;
  approved_at: string | null;
}

export default function AccessRequests() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "denied">("pending");

  useEffect(() => {
    if (unlocked) loadRequests();
  }, [unlocked]);

  async function loadRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setRequests((data as AccessRequest[]) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "approved" | "denied") {
    const { error } = await supabase
      .from("access_requests")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    loadRequests();
  }

  if (!unlocked) {
    return (
      <AdminPasscodeGate
        onSuccess={() => setUnlocked(true)}
        onClose={() => navigate("/")}
      />
    );
  }

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    denied: requests.filter((r) => r.status === "denied").length,
  };

  return (
    <div style={{ background: LIGHT_GRAY, minHeight: "100vh", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <header
        style={{
          background: "white",
          padding: "20px 32px",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>Admin</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "Georgia, serif" }}>
            Access Requests
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            background: "white",
            border: `1px solid ${BORDER}`,
            color: NAVY,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          ← Landing Page
        </button>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {(["pending", "approved", "denied", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                background: filter === f ? NAVY : "white",
                color: filter === f ? "white" : NAVY,
                border: `1px solid ${filter === f ? NAVY : BORDER}`,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              {f}
              {f !== "all" && (
                <span style={{ marginLeft: 8, opacity: 0.7 }}>
                  ({counts[f]})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: MUTED }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: "white",
              border: `1px solid ${BORDER}`,
              padding: 60,
              textAlign: "center",
              color: MUTED,
              borderRadius: 4,
            }}
          >
            No {filter === "all" ? "" : filter} requests.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "white",
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${
                    r.status === "approved" ? "#3FA86C" : r.status === "denied" ? "#C0392B" : GOLD
                  }`,
                  padding: 20,
                  borderRadius: 4,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: NAVY_DARK }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{r.company}</div>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        background: LIGHT_GRAY,
                        color: NAVY,
                        padding: "2px 8px",
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      {r.investor_type}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: NAVY, marginTop: 6 }}>
                    <a href={`mailto:${r.email}`} style={{ color: NAVY, textDecoration: "none" }}>
                      {r.email}
                    </a>
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>
                    Submitted {new Date(r.created_at).toLocaleString()}
                    {r.approved_at && ` · Approved ${new Date(r.approved_at).toLocaleString()}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {r.status === "pending" ? (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "approved")}
                        style={{
                          padding: "8px 14px",
                          background: "#3FA86C",
                          color: "white",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          cursor: "pointer",
                          borderRadius: 4,
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "denied")}
                        style={{
                          padding: "8px 14px",
                          background: "white",
                          color: "#C0392B",
                          border: `1px solid #C0392B`,
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          cursor: "pointer",
                          borderRadius: 4,
                        }}
                      >
                        Deny
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => updateStatus(r.id, "approved")}
                      style={{
                        padding: "8px 14px",
                        background: "white",
                        color: NAVY,
                        border: `1px solid ${BORDER}`,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                    >
                      Reset to Approved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
