import { getProblemById } from "@/lib/services/problems";
import { notFound } from "next/navigation";
import { EditProblemClient } from "./EditProblemClient";
import type { SerializedProblem } from "@/lib/actions/problems";

interface EditProblemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const { id } = await params;
  const problem = await getProblemById(id);

  if (!problem) {
    notFound();
  }

  // Convert Date objects to strings for Client Component serialization
  const serialized: SerializedProblem = {
    ...problem,
    created_at: problem.created_at?.toISOString(),
    updated_at: problem.updated_at?.toISOString(),
  };

  return <EditProblemClient problem={serialized} />;
}
