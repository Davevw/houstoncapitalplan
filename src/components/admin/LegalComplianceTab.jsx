import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, X, Download } from "lucide-react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";
const STEEL = "#E0E4E8";

const CCR_CATEGORY = "CC&Rs / HOA Documents";

export default function LegalComplianceTab() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchDocuments(); }, []);

  async function fetchDocuments() {
    const { data } = await supabase
      .from("vault_documents")
      .select("*")
      .eq("category", CCR_CATEGORY)
      .order("uploaded_at", { ascending: false });
    if (data) setDocuments(data);
  }

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(20);
    const ext = file.name.split(".").pop().toLowerCase();
    const folderName = "CCRs_HOA_Documents";
    const filePath = `${folderName}/${Date.now()}_${file.name}`;

    const { error: storageError } = await supabase.storage
      .from("itph-data-vault")
      .upload(filePath, file);
    setUploadProgress(70);
    if (storageError) {
      console.error(storageError);
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("vault_documents").insert({
      name: file.name,
      description: "",
      category: CCR_CATEGORY,
      file_path: filePath,
      file_type: ext,
      file_size: file.size,
    });
    setUploadProgress(100);
    if (!dbError) await fetchDocuments();
    setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
  }

  function getDocUrl(filePath) {
    const { data } = supabase.storage.from("itph-data-vault").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    await supabase.storage.from("itph-data-vault").remove([doc.file_path]);
    await supabase.from("vault_documents").delete().eq("id", doc.id);
    await fetchDocuments();
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: NAVY, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontFamily: "Georgia,serif", fontWeight: 700, margin: 0 }}>
          Legal & Compliance
        </h1>
        <div style={{ fontSize: 13, color: "#5A6B7A", marginTop: 6 }}>
          Restricted-access document repository for legal, governance, and compliance materials.
        </div>
      </div>

      {/* CC&Rs / HOA Section */}
      <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          background: NAVY, color: "white", padding: "14px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `3px solid ${GOLD}`,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>CC&Rs / HOA Documents</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
              Covenants, Conditions & Restrictions; HOA governance documents
            </div>
          </div>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 0.6 }}>
            {documents.length} {documents.length === 1 ? "DOCUMENT" : "DOCUMENTS"}
          </div>
        </div>

        {/* Upload area */}
        <div style={{ padding: 18, background: CREAM, borderBottom: `1px solid ${STEEL}` }}>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px", background: NAVY, color: "white",
              border: "none", borderRadius: 6, cursor: uploading ? "wait" : "pointer",
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Upload size={16} />
            {uploading ? `Uploading… ${uploadProgress}%` : "Upload CC&R / HOA Document"}
          </button>
          <div style={{ fontSize: 11, color: "#7A6B4A", marginTop: 10 }}>
            Accepted: PDF, DOCX, XLSX, images. Files are stored securely in the project vault.
          </div>
        </div>

        {/* Document list */}
        <div style={{ padding: 18 }}>
          {documents.length === 0 ? (
            <div style={{
              padding: "32px 16px", textAlign: "center", color: "#9AA8B5",
              fontSize: 13, fontStyle: "italic",
            }}>
              No CC&R or HOA documents uploaded yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {documents.map((doc) => (
                <div key={doc.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", border: `1px solid ${STEEL}`, borderRadius: 8,
                  background: "white",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 6, background: CREAM,
                    display: "flex", alignItems: "center", justifyContent: "center", color: NAVY,
                    flexShrink: 0,
                  }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#7A8B9A", marginTop: 2 }}>
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                      {doc.file_type ? ` · ${doc.file_type.toUpperCase()}` : ""}
                    </div>
                  </div>
                  <a
                    href={getDocUrl(doc.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 12px", background: GOLD, color: NAVY,
                      borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 700,
                    }}
                  >
                    <Download size={14} /> Download
                  </a>
                  <button
                    onClick={() => handleDelete(doc)}
                    aria-label="Delete document"
                    style={{
                      background: "transparent", border: "1px solid #E8B8B8",
                      color: "#CC0000", borderRadius: 6, cursor: "pointer",
                      width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
