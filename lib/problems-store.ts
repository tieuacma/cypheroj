import { Problem, Submission } from "./types";
import { getAllProblems as getMockProblems } from "./mock-problems";

const PROBLEMS_KEY = "cypheroj_problems_v1";
const SUBMISSIONS_KEY = "cypheroj_submissions_v1";

// Helper to check if window is available (client-side)
const isClient = typeof window !== "undefined";

export function getProblems(): Problem[] {
  if (!isClient) return getMockProblems();
  
  const saved = localStorage.getItem(PROBLEMS_KEY);
  if (!saved) {
    // Initialize with mock problems if not already present
    const mocks = getMockProblems();
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(mocks));
    return mocks;
  }
  
  try {
    return JSON.parse(saved) as Problem[];
  } catch (e) {
    console.error("Failed to parse stored problems", e);
    return getMockProblems();
  }
}

export function getProblem(id: string): Problem | null {
  const list = getProblems();
  return list.find((p) => p.id === id) ?? null;
}

export function saveProblem(problem: Problem): void {
  if (!isClient) return;
  
  const list = getProblems();
  const index = list.findIndex((p) => p.id === problem.id);
  if (index !== -1) {
    list[index] = problem;
  } else {
    list.push(problem);
  }
  
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(list));
}

export function getSubmissions(): Submission[] {
  if (!isClient) return [];
  
  const saved = localStorage.getItem(SUBMISSIONS_KEY);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved) as Submission[];
  } catch (e) {
    console.error("Failed to parse stored submissions", e);
    return [];
  }
}

export function getSubmission(id: string): Submission | null {
  const list = getSubmissions();
  return list.find((s) => s.id === id) ?? null;
}

export function saveSubmission(submission: Submission): void {
  if (!isClient) return;
  
  const list = getSubmissions();
  const index = list.findIndex((s) => s.id === submission.id);
  if (index !== -1) {
    list[index] = submission;
  } else {
    list.unshift(submission); // Newest submissions first
  }
  
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
}
