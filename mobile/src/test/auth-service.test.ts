import {
  createGuestAuthService,
  createSupabaseAuthService,
  getProtectedCacheSize,
  readProtectedCacheValue,
  writeProtectedCacheValue,
} from "@/features/auth";

describe("auth service", () => {
  it("keeps guest mode usable when auth is unavailable", async () => {
    const authService = createGuestAuthService(false);

    await expect(authService.getStatus()).resolves.toEqual({
      kind: "guest",
      authAvailable: false,
    });
    await expect(
      authService.requestEmailSignIn("parent@example.com"),
    ).resolves.toEqual({
      ok: false,
      message: "Sign-in needs Supabase public configuration.",
    });
  });

  it("clears protected cache on guest sign-out", async () => {
    const authService = createGuestAuthService(false);
    writeProtectedCacheValue("saved_places", ["place-a"]);

    await expect(authService.signOut()).resolves.toEqual({
      ok: true,
      message: "Guest session is clear.",
    });
    expect(getProtectedCacheSize()).toBe(0);
    expect(readProtectedCacheValue("saved_places")).toBeUndefined();
  });

  it("validates email before requesting a Supabase sign-in link", async () => {
    const client = createFakeAuthClient();
    const authService = createSupabaseAuthService(client);

    await expect(authService.requestEmailSignIn("bad-email")).resolves.toEqual({
      ok: false,
      message: "Enter a valid email address.",
    });
    expect(client.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("requests a normalized Supabase email sign-in link", async () => {
    const client = createFakeAuthClient();
    const authService = createSupabaseAuthService(client);

    await expect(
      authService.requestEmailSignIn(" Parent@Example.COM "),
    ).resolves.toEqual({
      ok: true,
      message: "Check your email for a sign-in link.",
    });
    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: "parent@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("clears protected cache on successful Supabase sign-out", async () => {
    const client = createFakeAuthClient();
    const authService = createSupabaseAuthService(client);
    writeProtectedCacheValue("profile", { userId: "user-a" });

    await expect(authService.signOut()).resolves.toEqual({
      ok: true,
      message: "Signed out.",
    });
    expect(client.auth.signOut).toHaveBeenCalled();
    expect(getProtectedCacheSize()).toBe(0);
  });
});

function createFakeAuthClient() {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: { session: null },
        error: null,
      })),
      signInWithOtp: jest.fn(async () => ({ error: null })),
      signOut: jest.fn(async () => ({ error: null })),
    },
  };
}
