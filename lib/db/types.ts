export interface SubtaskConfig {
  label: string;
  points: number;
}

/** MongoDB Problem document (snake_case matches persistence layer). */
export interface DbProblem {
  id: string;
  title: string;
  content: string;
  input_format: string;
  output_format: string;
  category: string;
  sample_input: string;
  sample_output: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  is_subtask: boolean;
  subtasks: SubtaskConfig[];
  created_at?: Date;
  updated_at?: Date;
}

/** Form / API payload for creating or updating a problem. */
export type ProblemInput = Omit<DbProblem, "created_at" | "updated_at">;

export type CreateProblemInput = ProblemInput;

export type UpdateProblemInput = Partial<ProblemInput>;

export const PROBLEM_CATEGORIES = [
  "Quy hoạch động",
  "Đồ thị",
  "Toán học",
  "Đệ quy / DP",
  "Greedy",
  "Cấu trúc dữ liệu",
  "String",
  "General",
] as const;

export function getProblemTotalPoints(problem: Pick<DbProblem, "is_subtask" | "subtasks">): number {
  if (problem.is_subtask && problem.subtasks.length > 0) {
    return problem.subtasks.reduce((sum, s) => sum + s.points, 0);
  }
  return 100;
}

/** Supabase submissions table row. */
export type SubmissionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "internal_error";

export interface SubmissionDetailEntry {
  subtask_index?: number;
  testcase_index?: number;
  status: string;
  time_ms?: number;
  memory_mb?: number;
  message?: string;
}

export interface DbSubmission {
  id: number;
  problem_id: string;
  source_code: string;
  language: string;
  status: SubmissionStatus;
  total_points: number;
  earned_points: number;
  max_time_ms: number | null;
  max_memory_mb: number | null;
  details: SubmissionDetailEntry[] | null;
  error_log: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubmissionInput {
  problem_id: string;
  source_code: string;
  language: string;
}

export interface CreateSubmissionResult {
  id: number;
  problem_id: string;
  status: SubmissionStatus;
  created_at: string;
}
