import { describe, expect, test } from "bun:test";
import { oauthReturnPath } from "./oauth-return-path";
describe("OAuth return paths", () => {
  test("keeps a local consent request and fragment", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#confirm")).toBe("/.lovable/oauth/consent?authorization_id=abc#confirm");
  });
  test("rejects external and ambiguous destinations", () => {
    for (const value of ["https://outside.invalid", "//outside.invalid", "/\\outside.invalid", "/\nother"]) {
      expect(oauthReturnPath(value)).toBe("/");
    }
  });
});