import { connectMongoDB } from "@/lib/mongodb";
import {
  ProblemModel,
  PROBLEM_ID_PATTERN,
  type ProblemLean,
} from "@/lib/models/problem";
import type {
  CreateProblemInput,
  DbProblem,
  UpdateProblemInput,
} from "@/lib/db/types";
import { DbError } from "@/lib/errors/db-errors";

function toDbProblem(doc: ProblemLean): DbProblem {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    input_format: doc.input_format ?? "",
    output_format: doc.output_format ?? "",
    category: doc.category,
    group: doc.group,
    sample_input: doc.sample_input,
    sample_output: doc.sample_output,
    time_limit_ms: doc.time_limit_ms,
    memory_limit_mb: doc.memory_limit_mb,
    elo_rating: doc.elo_rating ?? 1000,
    is_subtask: doc.is_subtask,
    subtasks: doc.subtasks || [],
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

async function ensureProblemEloRatings(): Promise<void> {
  await ProblemModel.updateMany(
    { elo_rating: { $exists: false } },
    { $set: { elo_rating: 1000 } }
  );
}

function assertValidProblemId(id: string): void {
  if (!PROBLEM_ID_PATTERN.test(id)) {
    throw new DbError(
      "PROBLEM_ID_INVALID",
      `Invalid problem id "${id}". Use lowercase letters, numbers, and hyphens only.`
    );
  }
}

function normalizeCreateInput(input: CreateProblemInput): CreateProblemInput {
  return {
    ...input,
    id: input.id.trim().toLowerCase(),
    title: input.title.trim(),
    category: input.category.trim(),
    group: input.group?.trim() || "",
  };
}

export async function createProblem(input: CreateProblemInput): Promise<DbProblem> {
  try {
    await connectMongoDB();

    const payload = normalizeCreateInput(input);
    assertValidProblemId(payload.id);

    const existing = await ProblemModel.findOne({ id: payload.id }).lean();
    if (existing) {
      throw new DbError(
        "PROBLEM_ID_CONFLICT",
        `Problem id "${payload.id}" already exists.`,
        409
      );
    }

    const created = await ProblemModel.create(payload as Parameters<
      typeof ProblemModel.create
    >[0]);
    const doc = Array.isArray(created) ? created[0] : created;
    return toDbProblem(doc.toObject() as ProblemLean);
  } catch (error) {
    if (error instanceof DbError) throw error;
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new DbError(
        "PROBLEM_ID_CONFLICT",
        `Problem id "${input.id}" already exists.`,
        409
      );
    }
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to create problem.",
      500
    );
  }
}

export async function getProblemById(id: string): Promise<DbProblem | null> {
  try {
    await connectMongoDB();
    await ensureProblemEloRatings();
    const doc = await ProblemModel.findOne({ id }).lean<ProblemLean>();
    return doc ? toDbProblem(doc) : null;
  } catch (error) {
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to fetch problem.",
      500
    );
  }
}

export async function listProblems(): Promise<DbProblem[]> {
  try {
    await connectMongoDB();
    await ensureProblemEloRatings();
    const docs = await ProblemModel.find().sort({ created_at: -1 }).lean<ProblemLean[]>();
    return docs.map(toDbProblem);
  } catch (error) {
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to list problems.",
      500
    );
  }
}

/**
 * Updates a problem. Supports changing the string `id` when `payload.id` differs
 * from `currentId` (after uniqueness check).
 */
export async function updateProblem(
  currentId: string,
  payload: UpdateProblemInput
): Promise<DbProblem> {
  try {
    await connectMongoDB();

    const nextId = payload.id?.trim().toLowerCase();

    if (nextId) {
      assertValidProblemId(nextId);
      if (nextId !== currentId) {
        const conflict = await ProblemModel.findOne({ id: nextId }).lean();
        if (conflict) {
          throw new DbError(
            "PROBLEM_ID_CONFLICT",
            `Problem id "${nextId}" is already taken.`,
            409
          );
        }
      }
    }

    const updatePayload: UpdateProblemInput = { ...payload };
    if (nextId) updatePayload.id = nextId;
    if (payload.title !== undefined) updatePayload.title = payload.title.trim();
    if (payload.category !== undefined) {
      updatePayload.category = payload.category.trim();
    }
    if (payload.group !== undefined) {
      updatePayload.group = payload.group.trim();
    }

    const updated = await ProblemModel.findOneAndUpdate(
      { id: currentId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean<ProblemLean>();

    if (!updated) {
      throw new DbError(
        "PROBLEM_NOT_FOUND",
        `Problem "${currentId}" not found.`,
        404
      );
    }

    return toDbProblem(updated);
  } catch (error) {
    if (error instanceof DbError) throw error;
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new DbError(
        "PROBLEM_ID_CONFLICT",
        `Problem id "${payload.id}" already exists.`,
        409
      );
    }
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to update problem.",
      500
    );
  }
}

export async function deleteProblem(id: string): Promise<void> {
  try {
    await connectMongoDB();
    const deleted = await ProblemModel.findOneAndDelete({ id }).lean();
    if (!deleted) {
      throw new DbError("PROBLEM_NOT_FOUND", `Problem "${id}" not found.`, 404);
    }
  } catch (error) {
    if (error instanceof DbError) throw error;
    throw new DbError(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Failed to delete problem.",
      500
    );
  }
}
