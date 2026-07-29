/**
 * Unit tests for auth/session database — src/lib/db.ts
 * These tests pass in isolation since db.ts has no ESM-only deps.
 */

import { describe, it, expect } from "vitest";
import { getDb, createSession, getSession, generateSessionToken } from "../db";

describe("auth (db)", () => {
  it("getDb returns a database instance", () => {
    const db = getDb();
    expect(db).toBeDefined();
    expect(typeof db).toBe("object");
  });

  it("generateSessionToken creates unique tokens", () => {
    const t1 = generateSessionToken();
    const t2 = generateSessionToken();
    const t3 = generateSessionToken();
    expect(t1).toBeTruthy();
    expect(typeof t1).toBe("string");
    expect(t1.length).toBeGreaterThan(10);
    expect(new Set([t1, t2, t3]).size).toBe(3);
  });

  it("createSession stores and returns session with correct userId", () => {
    const session = createSession("test-user-auth-1");
    expect(session.userId).toBe("test-user-auth-1");
    expect(session.token).toBeTruthy();
    expect(session.createdAt).toBeDefined();
  });

  it("getSession retrieves an existing session", () => {
    const created = createSession("test-user-retrieve");
    const retrieved = getSession(created.token);
    expect(retrieved).toBeDefined();
    expect(retrieved?.userId).toBe("test-user-retrieve");
    expect(retrieved?.token).toBe(created.token);
  });

  it("getSession returns undefined for unknown token", () => {
    expect(getSession("completely-non-existent-token-xyz")).toBeUndefined();
  });

  it("createSession creates distinct tokens per call for same user", () => {
    const s1 = createSession("multi-session-user");
    const s2 = createSession("multi-session-user");
    expect(s1.token).not.toBe(s2.token);
    // Both should be independently retrievable
    expect(getSession(s1.token)).toBeDefined();
    expect(getSession(s2.token)).toBeDefined();
  });
});
