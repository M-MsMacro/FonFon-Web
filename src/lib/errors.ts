import { t } from "./strings";

export type ApiErrorCode =
  | "childNotFound"
  | "roleConflict"
  | "notSignedIn"
  | "offline"
  | "unknown";

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    detail?: string,
  ) {
    super(detail ?? code);
  }

  get messagePt(): string {
    switch (this.code) {
      case "offline":
        return t.failure.offline;
      case "childNotFound":
        return t.failure.childNotFound;
      case "roleConflict":
        return t.failure.roleConflict;
      case "notSignedIn":
        return t.failure.notSignedIn;
      default:
        return t.failure.generic;
    }
  }
}

type SupabaseLikeError = { message?: string; code?: string; name?: string };

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const e = (error ?? {}) as SupabaseLikeError;
  const message = e.message ?? "";
  if (e.code === "PGRST301" || e.code === "PGRST303" || message === "not_authenticated") {
    return new ApiError("notSignedIn", message);
  }
  if (message === "child_not_found") return new ApiError("childNotFound", message);
  if (message === "role_conflict") return new ApiError("roleConflict", message);
  if (e.name === "AuthSessionMissingError") return new ApiError("notSignedIn", message);
  if (e.code === "23503" && /profiles_id_fkey/.test(message)) return new ApiError("notSignedIn", message);
  if (e.name === "TypeError" || /failed to fetch|network|load failed/i.test(message)) {
    return new ApiError("offline", message);
  }
  return new ApiError("unknown", message);
}

export const messageFor = (error: unknown): string => toApiError(error).messagePt;
