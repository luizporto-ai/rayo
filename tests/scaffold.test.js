import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { scaffold } from "../lib/scaffold.js";

test("init creates a runnable project with the skill installed", () => {
  const base = mkdtempSync(path.join(tmpdir(), "rayo-"));
  const dest = path.join(base, "proj");
  try {
    const { dir } = scaffold(dest);
    assert.equal(dir, dest);
    // motor
    assert.ok(existsSync(path.join(dir, "package.json")), "package.json");
    assert.ok(existsSync(path.join(dir, "src", "edit", "edit.ts")), "EDL");
    assert.ok(existsSync(path.join(dir, "src", "Root.tsx")), "Root");
    assert.ok(existsSync(path.join(dir, "scripts", "transcribe.mjs")), "transcribe");
    // gitignore vira dotfile (npm não publica ".gitignore")
    assert.ok(existsSync(path.join(dir, ".gitignore")), ".gitignore written");
    assert.ok(!existsSync(path.join(dir, "gitignore")), "no leftover gitignore");
    // skill instalada localmente
    assert.ok(
      existsSync(path.join(dir, ".claude", "skills", "rayo", "SKILL.md")),
      "skill installed"
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("init refuses a non-empty directory", () => {
  const base = mkdtempSync(path.join(tmpdir(), "rayo-"));
  try {
    scaffold(path.join(base, "a"));
    assert.throws(() => scaffold(base), /não está vazia/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
