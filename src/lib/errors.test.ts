import { describe, expect, it } from "vitest";
import { toApiError } from "./errors";

describe("toApiError", () => {
  it("treats a profile foreign key violation as a session that no longer exists", () => {
    const error = {
      code: "23503",
      message: 'insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"',
    };
    expect(toApiError(error).code).toBe("notSignedIn");
  });

  it("keeps other foreign key violations as unknown errors", () => {
    const error = { code: "23503", message: 'violates foreign key constraint "children_therapist_id_fkey"' };
    expect(toApiError(error).code).toBe("unknown");
  });

  it("maps the existing signed-out cases", () => {
    expect(toApiError({ code: "PGRST301" }).code).toBe("notSignedIn");
    expect(toApiError({ message: "not_authenticated" }).code).toBe("notSignedIn");
    expect(toApiError({ name: "AuthSessionMissingError" }).code).toBe("notSignedIn");
  });
});
