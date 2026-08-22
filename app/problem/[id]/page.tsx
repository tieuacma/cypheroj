import { redirect } from "next/navigation";

interface ProblemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params;
  redirect(`/problems/${id}`);
}
