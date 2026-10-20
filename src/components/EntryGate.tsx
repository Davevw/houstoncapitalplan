import React, { useState } from "react";
import AdminPasscodeGate, { getAccessRole } from "./AdminPasscodeGate";

/**
 * Passcode-only entry gate for the app. Accepts the viewer code (USER)
 * and the admin codes (HC01 / ML01), all case-insensitive. No email needed.
 */
export default function EntryGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => getAccessRole() !== null);

  if (unlocked) return <>{children}</>;

  return (
    <AdminPasscodeGate
      locked
      allowUserRole
      title="ITP Houston Capital Plan"
      subtitle="Enter your passcode to continue."
      onSuccess={() => setUnlocked(true)}
      onClose={() => {}}
    />
  );
}
