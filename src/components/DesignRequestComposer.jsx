import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAVY = "#0B3D5C";
const STEEL = "#E5E7EB";
const AMBER = "#C58A1A";

const CLIENT_TYPES = [
  "Retail Developer",
  "Industrial / Logistics",
  "Multifamily Developer",
  "Mixed-Use JV Partner",
  "Medical Office",
  "Hospitality",
  "Institutional Land Fund",
  "Family Office",
  "Other",
];

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#7A8B9A", fontWeight: 700, marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ marginTop: 6, fontSize: 11, color: "#8A99A8", fontStyle: "italic" }}>{hint}</div>}
    </div>
  );
}

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  border: `1.5px solid ${STEEL}`,
  borderRadius: 8,
  fontSize: 14,
  color: "#1F2937",
  fontFamily: "inherit",
  background: "#FCFCFD",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export default function DesignRequestComposer({ onSubmitted }) {
  // step: form -> clarify -> submitting -> success
  const [step, setStep] = useState("form");

  const [conceptName, setConceptName] = useState("");
  const [description, setDescription] = useState("");
  const [priorityLots, setPriorityLots] = useState("");
  const [clientType, setClientType] = useState(CLIENT_TYPES[0]);
  const [submittedBy, setSubmittedBy] = useState("Mark");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function reset() {
    setConceptName("");
    setDescription("");
    setPriorityLots("");
    setClientType(CLIENT_TYPES[0]);
    setQuestions([]);
    setAnswers({});
    setErrorMsg("");
    setStep("form");
  }

  async function handleGenerateClarifications() {
    setErrorMsg("");
    if (!conceptName.trim() || !description.trim()) {
      setErrorMsg("Concept name and description are required.");
      return;
    }
    setLoadingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-design-clarifications", {
        body: {
          concept_name: conceptName,
          description,
          priority_lots: priorityLots,
          target_client_type: clientType,
        },
      });
      if (error) throw error;
      const qs = Array.isArray(data?.questions) && data.questions.length
        ? data.questions
        : [
            "Which lots or frontage corridors should be reserved for anchor users?",
            "What tenant mix do you envision driving long-term value creation?",
          ];
      setQuestions(qs);
      setAnswers(Object.fromEntries(qs.map((q, i) => [i, ""])));
      setStep("clarify");
    } catch (e) {
      console.error(e);
      setErrorMsg("Could not generate clarifications. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  }

  async function handleFinalSubmit() {
    setErrorMsg("");
    setStep("submitting");
    const ts = new Date().toISOString();
    const clarifications = questions.map((q, i) => ({
      question: q,
      response: answers[i] || "",
      timestamp: ts,
    }));
    const { error } = await supabase.from("design_requests").insert({
      concept_name: conceptName,
      description,
      priority_lots: priorityLots || null,
      target_client_type: clientType,
      clarifications,
      submitted_by: submittedBy,
    });
    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setStep("clarify");
      return;
    }
    setStep("success");
    if (onSubmitted) {
      onSubmitted({ concept_name: conceptName, target_client_type: clientType });
    }
  }

  return (
    <div style={{
      background: "white",
      border: `1px solid ${STEEL}`,
      borderRadius: 14,
      padding: "32px 36px",
      boxShadow: "0 2px 12px rgba(11,61,92,0.06)",
      marginBottom: 32,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#7A8B9A", fontWeight: 700, marginBottom: 6 }}>
            ITPH Master Plan · Scenario Composer
          </div>
          <h2 style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: 26, color: NAVY, fontWeight: 700 }}>
            Request New Design Concept
          </h2>
        </div>
        <select
          value={submittedBy}
          onChange={(e) => setSubmittedBy(e.target.value)}
          style={{ ...inputBase, width: "auto", padding: "8px 14px", fontSize: 12 }}
        >
          <option value="Mark">Submitted by: Mark</option>
          <option value="David">Submitted by: David</option>
        </select>
      </div>
      <p style={{ fontSize: 13, color: "#5A6B7A", lineHeight: 1.65, marginTop: 8, marginBottom: 28, maxWidth: 760 }}>
        Create a new master plan scenario by describing the desired land use strategy, tenant orientation,
        and district priorities for the ITPH site.
      </p>

      {step === "success" ? (
        <div style={{
          background: "#F0FAF3",
          border: "1px solid #BFE5CB",
          borderLeft: "4px solid #2E8B57",
          padding: "24px 28px",
          borderRadius: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 26, height: 26, borderRadius: "50%", background: "#2E8B57",
              color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700,
            }}>✓</span>
            <h3 style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: 19, color: "#1F5A36" }}>
              Design Request Submitted
            </h3>
          </div>
          <p style={{ margin: "8px 0 16px", fontSize: 13, color: "#3A5A48", lineHeight: 1.6, maxWidth: 640 }}>
            Your concept request has been added to the scenario pipeline. Once processed, the new design concept
            will automatically appear within the Design Concepts library.
          </p>
          <button onClick={reset} style={{
            background: "white",
            color: NAVY,
            border: `1.5px solid ${NAVY}`,
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Submit Another Request
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Concept Name">
                <input
                  type="text"
                  value={conceptName}
                  onChange={(e) => setConceptName(e.target.value)}
                  placeholder="e.g., Logistics Corridor, Restaurant Row, Medical Village, Innovation Campus"
                  style={inputBase}
                  disabled={step !== "form"}
                />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Design Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the development configuration you're envisioning. Which districts should emphasize retail, multifamily, industrial, office, hospitality, or flex uses? What tenant profile or market strategy are you targeting?"
                  rows={6}
                  style={{ ...inputBase, resize: "vertical", minHeight: 140, lineHeight: 1.6 }}
                  disabled={step !== "form"}
                />
              </Field>
            </div>
            <Field label="Priority Lots (optional)">
              <input
                type="text"
                value={priorityLots}
                onChange={(e) => setPriorityLots(e.target.value)}
                placeholder="e.g., Corner lots 2–4 for restaurants, frontage lots for retail"
                style={inputBase}
                disabled={step !== "form"}
              />
            </Field>
            <Field label="Target Client Type">
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                style={inputBase}
                disabled={step !== "form"}
              >
                {CLIENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {errorMsg && (
            <div style={{ fontSize: 12, color: "#E85D75", fontWeight: 600, marginTop: 4, marginBottom: 12 }}>
              {errorMsg}
            </div>
          )}

          {step === "form" && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                onClick={handleGenerateClarifications}
                disabled={loadingAi}
                style={{
                  background: NAVY,
                  color: "white",
                  border: "none",
                  padding: "13px 26px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  cursor: loadingAi ? "wait" : "pointer",
                  opacity: loadingAi ? 0.7 : 1,
                }}
              >
                {loadingAi ? "Analyzing concept…" : "Generate Clarification Questions →"}
              </button>
            </div>
          )}

          {(step === "clarify" || step === "submitting") && (
            <div style={{
              marginTop: 28,
              background: "#F7F9FB",
              borderLeft: `3px solid ${NAVY}`,
              borderRadius: 8,
              padding: "24px 28px 20px",
            }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#7A8B9A", fontWeight: 700, marginBottom: 4 }}>
                Strategic Clarifications
              </div>
              <div style={{ fontSize: 13, color: "#5A6B7A", marginBottom: 22, fontStyle: "italic" }}>
                A few thoughts to sharpen the scenario before it enters the pipeline.
              </div>

              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 14, color: NAVY, lineHeight: 1.55, marginBottom: 10, fontWeight: 500 }}>
                    {q}
                  </div>
                  <textarea
                    value={answers[i] || ""}
                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    placeholder="Your response…"
                    rows={3}
                    style={{
                      ...inputBase,
                      background: "white",
                      resize: "vertical",
                      minHeight: 70,
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                    disabled={step === "submitting"}
                  />
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => setStep("form")}
                  disabled={step === "submitting"}
                  style={{
                    background: "transparent",
                    color: "#5A6B7A",
                    border: `1px solid ${STEEL}`,
                    padding: "10px 18px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Edit Concept
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={step === "submitting"}
                  style={{
                    background: AMBER,
                    color: "white",
                    border: "none",
                    padding: "13px 28px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    cursor: step === "submitting" ? "wait" : "pointer",
                    boxShadow: "0 2px 8px rgba(197,138,26,0.25)",
                  }}
                >
                  {step === "submitting" ? "Submitting…" : "Confirm & Submit Design Request"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
