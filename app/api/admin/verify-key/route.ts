import { NextResponse } from "next/server";
import {
  extractClientIp,
  checkIpBanStatus,
  verifyAdminKeyAndRecordAttempt,
} from "@/lib/services/ip-ban";

export async function GET(request: Request) {
  try {
    const ip = extractClientIp(request);
    const banStatus = await checkIpBanStatus(ip);
    return NextResponse.json({
      ip,
      banned: banStatus.isBanned,
      remainingSeconds: banStatus.remainingSeconds,
      failed_count: banStatus.failedCount,
    });
  } catch (error) {
    console.error("[GET /api/admin/verify-key]", error);
    return NextResponse.json({ error: "Lỗi kiểm tra IP ban." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = extractClientIp(request);
    let body: { key?: string; adminKey?: string } = {};

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const key = body.key ?? body.adminKey ?? "";
    const result = await verifyAdminKeyAndRecordAttempt(ip, key);

    if (!result.success) {
      const status = result.banned ? 403 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/admin/verify-key]", error);
    return NextResponse.json({ error: "Lỗi xác thực Admin key." }, { status: 500 });
  }
}
