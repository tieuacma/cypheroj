import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isDbError } from "@/lib/errors/db-errors";
import {
  deleteProblem,
  getProblemById,
  updateProblem,
} from "@/lib/services/problems";
import type { UpdateProblemInput } from "@/lib/db/types";
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

  console.error("[/api/problems/[id]]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const problem = await getProblemById(id);

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    return handleError(error);
  }
}

async function validateAdminKeyOrIpBan(request: Request, bodyKey?: string) {
  const ip = extractClientIp(request);
  const banStatus = await checkIpBanStatus(ip);

  if (banStatus.isBanned) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: `IP thiết bị của bạn đang bị cấm do nhập sai Key Admin. Thời gian cấm còn lại: ${Math.ceil(banStatus.remainingSeconds / 60)} phút.`,
          banned: true,
          remainingSeconds: banStatus.remainingSeconds,
        },
        { status: 403 }
      ),
    };
  }

  const key =
    bodyKey ||
    request.headers.get("x-admin-key") ||
    "";

  const result = await verifyAdminKeyAndRecordAttempt(ip, key);
  if (!result.success) {
    const status = result.banned ? 403 : 400;
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: result.message,
          banned: result.banned,
          failed_count: result.failed_count,
          remainingAttempts: result.remainingAttempts,
          remainingSeconds: result.remainingSeconds,
        },
        { status }
      ),
    };
  }

  return { allowed: true };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: UpdateProblemInput & { adminKey?: string; key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const adminValidation = await validateAdminKeyOrIpBan(request, body.adminKey || body.key);
  if (!adminValidation.allowed) {
    return adminValidation.response!;
  }

  // Remove adminKey fields before passing payload to service
  delete body.adminKey;
  delete body.key;

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const problem = await updateProblem(id, body);
    revalidatePath("/problems");
    revalidatePath(`/problems/${id}`);
    revalidatePath(`/problems/${problem.id}`);
    return NextResponse.json(problem);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const adminValidation = await validateAdminKeyOrIpBan(request);
  if (!adminValidation.allowed) {
    return adminValidation.response!;
  }

  try {
    await deleteProblem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
