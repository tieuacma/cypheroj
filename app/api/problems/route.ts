import { NextResponse } from "next/server";
import { isDbError } from "@/lib/errors/db-errors";
import { createProblem, listProblems } from "@/lib/services/problems";
import type { CreateProblemInput } from "@/lib/db/types";

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
  let body: CreateProblemInput;

  try {
    body = (await request.json()) as CreateProblemInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const required: (keyof CreateProblemInput)[] = [
    "id",
    "title",
    "content",
    "category",
    "sample_input",
    "sample_output",
    "time_limit_ms",
    "memory_limit_mb",
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
