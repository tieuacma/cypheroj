"use server";

import {
  createProblem as serviceCreateProblem,
  getProblemById as serviceGetProblemById,
  updateProblem as serviceUpdateProblem,
  deleteProblem as serviceDeleteProblem,
  listProblems as serviceListProblems,
} from "@/lib/services/problems";
import type { ProblemInput, DbProblem } from "@/lib/db/types";
import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { connectMongoDB } from "@/lib/mongodb";
import { ProblemModel } from "@/lib/models/problem";

export interface SerializedProblem extends Omit<DbProblem, "created_at" | "updated_at"> {
  created_at?: string;
  updated_at?: string;
}

function serializeProblem(prob: DbProblem | null): SerializedProblem | null {
  if (!prob) return null;
  return {
    ...prob,
    created_at: prob.created_at?.toISOString(),
    updated_at: prob.updated_at?.toISOString(),
  };
}

export async function getProblemByIdAction(id: string): Promise<SerializedProblem | null> {
  const prob = await serviceGetProblemById(id);
  return serializeProblem(prob);
}

export async function createProblemAction(data: ProblemInput): Promise<SerializedProblem | null> {
  const prob = await serviceCreateProblem(data);
  revalidatePath("/problems");
  return serializeProblem(prob);
}

export async function updateProblemAction(
  currentId: string,
  payload: Partial<ProblemInput>
): Promise<SerializedProblem | null> {
  const prob = await serviceUpdateProblem(currentId, payload);
  revalidatePath("/problems");
  revalidatePath(`/problems/${currentId}`);
  revalidatePath(`/problems/${prob.id}`);
  return serializeProblem(prob);
}

export async function deleteProblemAction(id: string): Promise<void> {
  await serviceDeleteProblem(id);
  revalidatePath("/problems");
}

export async function listProblemsAction(): Promise<SerializedProblem[]> {
  const list = await serviceListProblems();
  const serialized = list.map(serializeProblem).filter((p): p is SerializedProblem => p !== null);
  return serialized;
}

export async function getStatsAction(): Promise<{ problems: number; submissions: number }> {
  try {
    await connectMongoDB();
    const problemsCount = await ProblemModel.countDocuments();

    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true });

    return {
      problems: problemsCount,
      submissions: error ? 0 : (count ?? 0),
    };
  } catch (err) {
    console.error("Failed to get stats", err);
    return { problems: 0, submissions: 0 };
  }
}
