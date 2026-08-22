export type DbErrorCode =
  | "PROBLEM_NOT_FOUND"
  | "PROBLEM_ID_CONFLICT"
  | "PROBLEM_ID_INVALID"
  | "SUBMISSION_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR";

export class DbError extends Error {
  readonly code: DbErrorCode;
  readonly status: number;

  constructor(code: DbErrorCode, message: string, status = 400) {
    super(message);
    this.name = "DbError";
    this.code = code;
    this.status = status;
  }
}

export function isDbError(error: unknown): error is DbError {
  return error instanceof DbError;
}
