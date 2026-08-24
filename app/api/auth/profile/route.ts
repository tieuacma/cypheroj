import { NextResponse } from "next/server";
import { verifyAuthToken, updateStudentProfile } from "@/lib/services/auth";
import { isDbError } from "@/lib/errors/db-errors";

export async function PUT(request: Request) {
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
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload || !payload.username) {
      return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
    }

    const body = await request.json();
    const updatedUser = await updateStudentProfile(payload.username, body);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (isDbError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[PUT /api/auth/profile]", error);
    return NextResponse.json({ error: "Lỗi cập nhật hồ sơ." }, { status: 500 });
  }
}
