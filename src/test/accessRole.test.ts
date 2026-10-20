import { describe, it, expect } from "vitest";
import { resolveRole } from "@/components/AdminPasscodeGate";

describe("passcode roles", () => {
  it("USER is the viewer code, case-insensitive", () => {
    expect(resolveRole("USER")).toBe("user");
    expect(resolveRole("user")).toBe("user");
    expect(resolveRole("UsEr")).toBe("user");
  });
  it("HC01 and ML01 are admin codes, case-insensitive", () => {
    expect(resolveRole("HC01")).toBe("admin");
    expect(resolveRole("hc01")).toBe("admin");
    expect(resolveRole("ML01")).toBe("admin");
    expect(resolveRole("ml01")).toBe("admin");
  });
  it("ROY01 no longer works", () => {
    expect(resolveRole("ROY01")).toBeNull();
  });
});
