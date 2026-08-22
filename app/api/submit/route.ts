import { NextResponse } from "next/server";
import { isDbError } from "@/lib/errors/db-errors";
import { createSubmission } from "@/lib/services/submissions";

function handleError(error: unknown) {
  if (isDbError(error)) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error("[POST /api/submit]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

interface SubmitBody {
  problem_id: string;
  source_code?: string;
  code?: string;
  language?: string;
}

export async function POST(request: Request) {
  let body: SubmitBody;

  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sourceCode = body.source_code ?? body.code;
  const language = body.language ?? "cpp";

  if (!body.problem_id || !sourceCode) {
    return NextResponse.json(
      { error: "problem_id and source_code (or code) are required" },
      { status: 400 }
    );
  }

  let submission;
  try {
    submission = await createSubmission({
      problem_id: body.problem_id,
      source_code: sourceCode,
      language,
    });
  } catch (error) {
    return handleError(error);
  }

  return NextResponse.json({
    submission_id: submission.id,
  });
}
