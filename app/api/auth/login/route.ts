import { NextResponse } from "next/server";
import { loginStudent } from "@/lib/services/auth";
import { isDbError } from "@/lib/errors/db-errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usernameOrEmail, password } = body;

    const { user, token } = await loginStudent(usernameOrEmail, password);

    const response = NextResponse.json({ success: true, user, token });
    response.cookies.set("cypher_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    if (isDbError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Lỗi đăng nhập." }, { status: 500 });
  }
}
