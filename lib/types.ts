export type TestcaseVerdict =
  | "pending"
  | "running"
  | "ac"
  | "wa"
  | "tle"
  | "re"
  | "ce";

export type SubmissionPhase = "idle" | "compiling" | "running" | "done";

export type FinalVerdictStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Runtime Error"
  | "Compilation Error";

export interface SampleTest {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  timeLimit: number;
  memoryLimit: number;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  samples: SampleTest[];
  group?: string;
  category?: string;
  acRate?: string;
  acCount?: number;
}

export interface TestcaseDetail {
  index: number;
  status: TestcaseVerdict;
  input?: string;
  expectedOutput?: string;
  userOutput?: string;
  timeTaken?: number;
  memoryTaken?: number;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  code: string;
  username: string;
  timestamp: string;
  status: FinalVerdictStatus | "Pending" | "Running" | "Compilation Error" | "Runtime Error";
  testcases: TestcaseDetail[];
}

export interface SubmitRequest {
  problem_id: string;
  code: string;
  username?: string;
}

export type StreamEvent =
  | { type: "compile"; status: "success" | "error"; message: string }
  | { type: "testcase"; index: number; status: TestcaseVerdict }
  | {
      type: "verdict";
      status: FinalVerdictStatus;
      passed: number;
      total: number;
    };

export const DEFAULT_CPP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // your code here
    return 0;
}`;

export const TESTCASE_COUNT = 20;

export function createInitialTestcases(): TestcaseVerdict[] {
  return Array.from({ length: TESTCASE_COUNT }, () => "pending" as TestcaseVerdict);
}
