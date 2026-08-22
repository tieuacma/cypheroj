import { NextResponse } from "next/server";
import { isDbError } from "@/lib/errors/db-errors";
import {
  deleteProblem,
  getProblemById,
  updateProblem,
} from "@/lib/services/problems";
import type { UpdateProblemInput } from "@/lib/db/types";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: UpdateProblemInput;
  try {
    body = (await request.json()) as UpdateProblemInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const problem = await updateProblem(id, body);
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteProblem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
