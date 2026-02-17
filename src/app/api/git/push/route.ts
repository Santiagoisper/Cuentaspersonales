import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

async function runGit(args: string[]) {
  return execFileAsync("git", args, { cwd: process.cwd() });
}

async function tryRunGit(args: string[]) {
  try {
    await runGit(args);
  } catch {
    // Ignore optional cleanup failures.
  }
}

function sanitizeCommitMessage(value: unknown): string {
  const raw = String(value || "").replace(/[\r\n]+/g, " ").trim();
  if (!raw) return `Update all changes ${new Date().toISOString()}`;
  return raw.slice(0, 140);
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!token || !(await verifyToken(token)))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const commitMessage = sanitizeCommitMessage(body?.message);

    await runGit(["add", "-A"]);
    await tryRunGit(["reset", "HEAD", "--", ".dev.log", ".dev.out.log", ".dev.err.log"]);

    let committed = true;
    try {
      await runGit(["commit", "-m", commitMessage]);
    } catch (error) {
      const out = `${(error as { stdout?: string }).stdout || ""}\n${(error as { stderr?: string }).stderr || ""}`;
      if (out.includes("nothing to commit") || out.includes("working tree clean")) {
        committed = false;
      } else {
        throw error;
      }
    }

    const branchRes = await runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
    const branch = branchRes.stdout.trim() || "main";
    await runGit(["push", "origin", branch]);

    return NextResponse.json({
      success: true,
      committed,
      branch,
      message: committed ? "Commit y push realizados" : "Sin cambios para commit, push realizado",
    });
  } catch (error) {
    const details = `${(error as { stdout?: string }).stdout || ""}\n${(error as { stderr?: string }).stderr || ""}`.trim();
    return NextResponse.json(
      {
        error: "No se pudo subir al git",
        details: details || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
