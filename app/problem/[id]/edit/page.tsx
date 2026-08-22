import { redirect } from "next/navigation";

interface EditProblemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const { id } = await params;
  redirect(`/problems/${id}/edit`);
}
