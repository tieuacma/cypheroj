import { NextResponse } from "next/server";
import { isDbError } from "@/lib/errors/db-errors";
import { getSubmissionById } from "@/lib/services/submissions";

function handleError(error: unknown) {
  if (isDbError(error)) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error("[GET /api/submissions/[id]]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const submissionId = Number(id);

  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return NextResponse.json({ error: "Invalid submission id" }, { status: 400 });
  }

  try {
    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    return handleError(error);
  }
}
