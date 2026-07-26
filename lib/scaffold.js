// Lógica do `rayo init`: copia o projeto-template pra pasta destino e instala a skill.
import { cpSync, mkdirSync, existsSync, readdirSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = path.join(PKG_ROOT, "template");
const SKILL = path.join(PKG_ROOT, "SKILL.md");

/**
 * Cria um projeto rayo em `destDir`.
 * @returns {{dir: string, created: boolean}}
 */
export function scaffold(destDir) {
  const dir = path.resolve(destDir);
  if (existsSync(dir) && readdirSync(dir).length > 0) {
    throw new Error(`a pasta "${destDir}" já existe e não está vazia`);
  }
  mkdirSync(dir, { recursive: true });

  // 1) copia o projeto Remotion (o motor + as funções)
  cpSync(TEMPLATE, dir, { recursive: true });

  // o npm não publica arquivos ".gitignore"; ele viaja como "gitignore" e vira dotfile aqui
  const gi = path.join(dir, "gitignore");
  if (existsSync(gi)) renameSync(gi, path.join(dir, ".gitignore"));

  // 2) instala a skill localmente pro Claude Code da pessoa achar
  const skillDir = path.join(dir, ".claude", "skills", "rayo");
  mkdirSync(skillDir, { recursive: true });
  cpSync(SKILL, path.join(skillDir, "SKILL.md"));

  return { dir, created: true };
}
