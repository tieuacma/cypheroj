import { getSupabaseClient } from "@/lib/supabase";
import { getProblemById } from "@/lib/services/problems";
import type {
  CreateSubmissionInput,
  CreateSubmissionResult,
  DbSubmission,
} from "@/lib/db/types";
import { DbError } from "@/lib/errors/db-errors";

export async function createSubmission(
  input: CreateSubmissionInput
): Promise<CreateSubmissionResult> {
  const { problem_id, source_code, language } = input;

  if (!problem_id?.trim()) {
    throw new DbError("VALIDATION_ERROR", "problem_id is required.");
  }
  if (!source_code?.trim()) {
    throw new DbError("VALIDATION_ERROR", "source_code is required.");
  }
  if (!language?.trim()) {
    throw new DbError("VALIDATION_ERROR", "language is required.");
  }

  const problem = await getProblemById(problem_id);
  if (!problem) {
    throw new DbError(
      "PROBLEM_NOT_FOUND",
      `Problem "${problem_id}" does not exist in MongoDB.`,
      404
    );
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        problem_id: problem.id,
        source_code,
        language,
        status: "pending",
      })
      .select("id, problem_id, status, created_at")
      .single();

    if (error) {
      throw new DbError("DATABASE_ERROR", error.message, 500);
    }

    return data as CreateSubmissionResult;
  } catch (error) {
    if (error instanceof DbError) throw error;
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to create submission.",
      500
    );
  }
}

export async function getSubmissionById(
  id: number
): Promise<DbSubmission | null> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new DbError("DATABASE_ERROR", error.message, 500);
    }

    return (data as DbSubmission | null) ?? null;
  } catch (error) {
    if (error instanceof DbError) throw error;
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to fetch submission.",
      500
    );
  }
}
