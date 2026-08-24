import { NextResponse } from "next/server";
import { verifyAuthToken, getStudentProfile } from "@/lib/services/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/cypher_token=([^;]+)/);
        if (match) token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = verifyAuthToken(token);
    if (!payload || !payload.username) {
      return NextResponse.json({ user: null });
    }

    const fullUser = await getStudentProfile(payload.username);
    return NextResponse.json({ user: fullUser });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json({ user: null });
  }
}
