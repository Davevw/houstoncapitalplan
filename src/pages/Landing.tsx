import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAVY = "#0B3D5C";
const NAVY_DARK = "#072A40";
const GOLD = "#B8945A";
const LIGHT_GRAY = "#F5F7FA";
const BORDER = "#E1E7ED";
const MUTED = "#5A6B7A";

const ROLES = [
  "Buyer",
  "Buyer Agent",
  "Lender",
  "Equity Partner",
  "Other",
];

export default function Landing() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim();

    if (!trimmedName || !trimmedEmail || !trimmedCompany || !investorType) {
      setError("All fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("access_requests").insert({
        name: trimmedName.slice(0, 200),
        email: trimmedEmail.toLowerCase().slice(0, 255),
        company: trimmedCompany.slice(0, 200),
        investor_type: investorType,
      });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Submission failed. Please try again or contact the advisor directly.");
    } finally {
      setSubmitting(false);
    }
  }

  const highlights = [
    { icon: "📐", text: "136 total acres" },
    { icon: "🏗️", text: "Infrastructure engineering complete" },
    { icon: "🏛️", text: "MUD 584 approved" },
    { icon: "🏢", text: "Mixed-use development program" },
    { icon: "✅", text: "Environmental process advanced" },
    { icon: "📋", text: "Construction-ready July 2026" },
  ];

  const protectedLinks = [
    { label: "View Offering Memorandum", href: "#offering-memorandum" },
    { label: "View Financial Model", href: "#financial-model" },
    { label: "Access Data Room", href: "#data-room" },
    { label: "Schedule Buyer Call", href: "#schedule-call" },
    { label: "Contact Advisor", href: "#contact" },
  ];

  return (
    <div style={{ background: "white", color: NAVY_DARK, fontFamily: "Georgia, 'Times New Roman', serif", minHeight: "100vh" }}>
      {/* Top bar */}
      <header
        style={{
          borderBottom: `1px solid ${BORDER}`,
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "white",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: NAVY, textTransform: "uppercase" }}>
          Mixed Use Houston
        </div>
        <div style={{ fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>
          Confidential Offering
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
          color: "white",
          padding: "96px 32px 88px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: 24,
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
            }}
          >
            Institutional Land Investment Opportunity
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 56px)",
              lineHeight: 1.1,
              margin: 0,
              fontWeight: 400,
              letterSpacing: -0.5,
            }}
          >
            Institutional Development Opportunity — Houston
          </h1>
          <div
            style={{
              fontSize: "clamp(16px, 2.2vw, 20px)",
              color: "rgba(255,255,255,0.85)",
              marginTop: 20,
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 300,
            }}
          >
            136-Acre Entitled Development Platform
          </div>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 720,
              margin: "32px auto 0",
              color: "rgba(255,255,255,0.78)",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 300,
            }}
          >
            A rare opportunity to acquire a fully entitled, MUD-approved, infrastructure-designed development platform
            with approved infrastructure financing and near-term execution potential.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 44, flexWrap: "wrap" }}>
            <a
              href="#access"
              style={{
                padding: "14px 36px",
                background: GOLD,
                color: NAVY_DARK,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: 2,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              Request Access
            </a>
            <a
              href="#contact"
              style={{
                padding: "14px 36px",
                background: "transparent",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.5)",
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              Contact Advisor
            </a>
          </div>
        </div>
      </section>

      {/* Location bar removed for confidentiality */}

      {/* Teaser highlights */}
      <section style={{ padding: "80px 32px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 700,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Project Highlights
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 400, marginTop: 12, color: NAVY }}>
            Construction-Ready Development Platform
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {highlights.map((h, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: `1px solid ${BORDER}`,
                padding: "32px 28px",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{h.icon}</div>
              <div
                style={{
                  fontSize: 16,
                  color: NAVY_DARK,
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {h.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Confidentiality notice */}
      <section style={{ background: LIGHT_GRAY, padding: "64px 32px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: GOLD,
              fontWeight: 700,
              marginBottom: 16,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Confidentiality Notice
          </div>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: NAVY_DARK,
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 300,
              margin: 0,
            }}
          >
            This opportunity is being marketed on a confidential basis. Access to the Offering Memorandum, financial
            model, data room, and detailed due diligence materials is restricted to qualified parties following advisor
            approval and receipt of an access code.
          </p>
        </div>
      </section>

      {/* Access Request Form */}
      <section id="access" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: GOLD,
                fontWeight: 700,
                fontFamily: "Helvetica, Arial, sans-serif",
              }}
            >
              Qualified Access
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 400, marginTop: 12, color: NAVY }}>
              Request Information
            </h2>
            <p
              style={{
                fontSize: 14,
                color: MUTED,
                fontFamily: "Helvetica, Arial, sans-serif",
                fontWeight: 300,
                marginTop: 12,
                lineHeight: 1.6,
              }}
            >
              Submit your information below. The advisor will review your request and follow up with access
              credentials and offering materials.
            </p>
          </div>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              style={{
                background: "white",
                border: `1px solid ${BORDER}`,
                padding: 40,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {([
                { label: "Full Name", value: name, set: setName, type: "text", placeholder: "Jane Smith" },
                { label: "Email", value: email, set: setEmail, type: "email", placeholder: "jane@firm.com" },
                { label: "Company / Firm", value: company, set: setCompany, type: "text", placeholder: "Smith Capital Partners" },
              ] as const).map((field) => (
                <div key={field.label}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: MUTED,
                      fontWeight: 600,
                      marginBottom: 8,
                      fontFamily: "Helvetica, Arial, sans-serif",
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => {
                      field.set(e.target.value);
                      setError(null);
                    }}
                    placeholder={field.placeholder}
                    maxLength={255}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: `1.5px solid ${BORDER}`,
                      fontSize: 15,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "Helvetica, Arial, sans-serif",
                      borderRadius: 2,
                      background: "white",
                      color: NAVY_DARK,
                    }}
                  />
                </div>
              ))}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: MUTED,
                    fontWeight: 600,
                    marginBottom: 8,
                    fontFamily: "Helvetica, Arial, sans-serif",
                  }}
                >
                  Investor Type
                </label>
                <select
                  value={investorType}
                  onChange={(e) => {
                    setInvestorType(e.target.value);
                    setError(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: `1.5px solid ${BORDER}`,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    borderRadius: 2,
                    background: "white",
                    color: investorType ? NAVY_DARK : MUTED,
                  }}
                >
                  <option value="">Select investor type…</option>
                  {INVESTOR_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#C0392B",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    textAlign: "center",
                    padding: "8px 0",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: submitting ? MUTED : NAVY,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  border: "none",
                  cursor: submitting ? "wait" : "pointer",
                  marginTop: 8,
                  borderRadius: 2,
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>

              <p
                style={{
                  fontSize: 11,
                  color: MUTED,
                  fontFamily: "Helvetica, Arial, sans-serif",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Your information will be kept confidential and used solely for access review.
              </p>
            </form>
          ) : (
            <div
              style={{
                background: "white",
                border: `1px solid ${BORDER}`,
                borderTop: `3px solid ${GOLD}`,
                padding: 48,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: GOLD,
                  fontWeight: 700,
                  marginBottom: 12,
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
              >
                Request Received
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: NAVY,
                  margin: "0 0 16px",
                }}
              >
                Thank you, {name.trim().split(" ")[0]}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: NAVY_DARK,
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Your access request has been submitted for review. The advisor will contact you at{" "}
                <strong style={{ color: NAVY }}>{email.trim()}</strong> upon approval.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        style={{
          background: NAVY_DARK,
          color: "white",
          padding: "72px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: GOLD,
            fontWeight: 700,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          Project Advisor
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 400, marginTop: 12, marginBottom: 28 }}>
          Inquiries
        </h2>
        <div style={{ fontSize: 16, lineHeight: 2, fontFamily: "Helvetica, Arial, sans-serif", color: "rgba(255,255,255,0.85)" }}>
          <div>
            <a href="mailto:dave@wrfco.com" style={{ color: "white", textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}>
              dave@wrfco.com
            </a>
          </div>
          <div>
            <a href="tel:7606720145" style={{ color: "white", textDecoration: "none" }}>
              760-672-0145
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "white",
          padding: "32px",
          textAlign: "center",
          fontSize: 11,
          color: MUTED,
          fontFamily: "Helvetica, Arial, sans-serif",
          letterSpacing: 0.5,
          lineHeight: 1.7,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        Confidential offering. Information subject to change. Access restricted to qualified parties only.
        <div style={{ marginTop: 8, fontSize: 10, color: "#9AA8B5" }}>
          © {new Date().getFullYear()} Confidential Offering
        </div>
      </footer>
    </div>
  );
}
