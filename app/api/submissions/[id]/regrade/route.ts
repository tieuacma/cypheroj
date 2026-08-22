import { NextResponse } from "next/server";
import { isDbError, DbError } from "@/lib/errors/db-errors";
import { getSupabaseClient } from "@/lib/supabase";

function handleError(error: unknown) {
  if (isDbError(error)) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error("[POST /api/submissions/[id]/regrade]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const submissionId = Number(id);

  console.log("[POST /api/submissions/[id]/regrade] Starting regrade for submission:", submissionId);

  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    console.log("[POST /api/submissions/[id]/regrade] Invalid submission id:", submissionId);
    return NextResponse.json({ error: "Invalid submission id" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();

    // First check if submission exists
    const { data: existingSubmission, error: fetchError } = await supabase
      .from("submissions")
      .select("id, status")
      .eq("id", submissionId)
      .maybeSingle();

    if (fetchError) {
      console.error("[POST /api/submissions/[id]/regrade] Error fetching submission:", fetchError);
      throw new DbError("DATABASE_ERROR", fetchError.message, 500);
    }

    if (!existingSubmission) {
      console.log("[POST /api/submissions/[id]/regrade] Submission not found:", submissionId);
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    console.log("[POST /api/submissions/[id]/regrade] Found submission, current status:", existingSubmission.status);

    // Reset submission status to 'pending' to trigger re-grading
    const { data, error } = await supabase
      .from("submissions")
      .update({
        status: "pending",
        details: null,
        earned_points: 0,
        max_time_ms: null,
        max_memory_mb: null,
        error_log: null
      })
      .eq("id", submissionId)
      .select("id, status")
      .single();

    if (error) {
      console.error("[POST /api/submissions/[id]/regrade] Error updating submission:", error);
      throw new DbError("DATABASE_ERROR", error.message, 500);
    }

    if (!data) {
      console.log("[POST /api/submissions/[id]/regrade] Update returned no data");
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    console.log("[POST /api/submissions/[id]/regrade] Successfully updated submission to pending:", data);

    return NextResponse.json({
      success: true,
      message: "Submission re-queued for grading"
    });
  } catch (error) {
    return handleError(error);
  }
}
