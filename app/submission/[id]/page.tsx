import { SubmissionDetailsClient } from "@/components/SubmissionDetailsClient";

interface SubmissionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const { id } = await params;

  return <SubmissionDetailsClient id={id} />;
}
