import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { initializeDatabase } from "@/lib/init-db";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const appPassword = process.env.APP_PASSWORD || "admin123";

    if (password === appPassword) {
      // Initialize database on first successful login
      await initializeDatabase();

      const token = await createToken();
      const response = NextResponse.json({ success: true });
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400, // 24 hours
      });
      return response;
    }

    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
