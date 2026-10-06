import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { profileSeed } from "./auth-user";

const user = (fields: Partial<User>) => ({ id: "u1", user_metadata: {}, ...fields }) as User;

describe("profileSeed", () => {
  it("uses the display name and email of an email account", () => {
    expect(profileSeed(user({ email: "ana@example.com", user_metadata: { display_name: "Ana Souza" } }))).toEqual({
      name: "Ana Souza",
      email: "ana@example.com",
    });
  });

  it("falls back to the social full name when the account has no email column", () => {
    expect(profileSeed(user({ email: undefined, user_metadata: { full_name: "Ana Souza", email: "ana@example.com" } }))).toEqual({
      name: "Ana Souza",
      email: "ana@example.com",
    });
  });

  it("uses the part of the email before the @ when there is no name", () => {
    expect(profileSeed(user({ email: "ana@example.com" }))).toEqual({ name: "ana", email: "ana@example.com" });
  });

  it("never returns an empty name or an empty email", () => {
    expect(profileSeed(user({ email: "" }))).toEqual({ name: "Fonoaudióloga", email: null });
  });
});
