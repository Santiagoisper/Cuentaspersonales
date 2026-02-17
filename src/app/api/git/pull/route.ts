import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

async function runGit(args: string[]) {
  return execFileAsync("git", args, { cwd: process.cwd() });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!token || !(await verifyToken(token)))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const branchRes = await runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
    const branch = branchRes.stdout.trim() || "main";
    const pullRes = await runGit(["pull", "origin", branch]);

    return NextResponse.json({
      success: true,
      branch,
      message: "Pull realizado",
      details: `${pullRes.stdout || ""}\n${pullRes.stderr || ""}`.trim(),
    });
  } catch (error) {
    const details = `${(error as { stdout?: string }).stdout || ""}\n${(error as { stderr?: string }).stderr || ""}`.trim();
    return NextResponse.json(
      {
        error: "No se pudo hacer pull",
        details: details || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
