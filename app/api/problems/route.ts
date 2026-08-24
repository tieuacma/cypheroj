import { NextResponse } from "next/server";
import { isDbError } from "@/lib/errors/db-errors";
import { createProblem, listProblems } from "@/lib/services/problems";
import type { CreateProblemInput } from "@/lib/db/types";
import {
  extractClientIp,
  checkIpBanStatus,
  verifyAdminKeyAndRecordAttempt,
} from "@/lib/services/ip-ban";

function handleError(error: unknown) {
  if (isDbError(error)) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error("[GET|POST /api/problems]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET() {
  try {
    const problems = await listProblems();
    return NextResponse.json(problems);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  let body: CreateProblemInput & { adminKey?: string; key?: string };

  try {
    body = (await request.json()) as CreateProblemInput & { adminKey?: string; key?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ip = extractClientIp(request);
  const banStatus = await checkIpBanStatus(ip);
  if (banStatus.isBanned) {
    return NextResponse.json(
      {
        error: `IP thiết bị đang bị cấm. Vui lòng thử lại sau ${Math.ceil(banStatus.remainingSeconds / 60)} phút.`,
        banned: true,
        remainingSeconds: banStatus.remainingSeconds,
      },
      { status: 403 }
    );
  }

  const adminKey = body.adminKey || body.key || request.headers.get("x-admin-key") || "";
  const adminValidation = await verifyAdminKeyAndRecordAttempt(ip, adminKey);
  if (!adminValidation.success) {
    return NextResponse.json(
      {
        error: adminValidation.message,
        banned: adminValidation.banned,
        remainingAttempts: adminValidation.remainingAttempts,
        remainingSeconds: adminValidation.remainingSeconds,
      },
      { status: adminValidation.banned ? 403 : 400 }
    );
  }

  delete body.adminKey;
  delete body.key;

  const required: (keyof CreateProblemInput)[] = [
    "id",
    "title",
    "content",
    "category",
    "sample_input",
    "sample_output",
    "time_limit_ms",
    "memory_limit_mb",
    "elo_rating",
    "is_subtask",
  ];

  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  try {
    const problem = await createProblem(body);
    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
