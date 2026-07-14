import { ClientEnv } from "@/lib/env";
import { createSupabaseClient } from "@/lib/supabase";

import { clearProtectedCache } from "./protected-cache";

export type AuthStatus =
  | { kind: "guest"; authAvailable: boolean }
  | { kind: "signed_in"; email?: string };

export type AuthActionResult =
  { ok: true; message: string } | { ok: false; message: string };

export type AuthService = {
  getStatus: () => Promise<AuthStatus>;
  requestEmailSignIn: (email: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

type SupabaseAuthClient = {
  auth: {
    getSession: () => Promise<{
      data: { session: null | { user: { email?: string } } };
      error: null | { message: string };
    }>;
    signInWithOtp: (input: {
      email: string;
      options: { shouldCreateUser: boolean };
    }) => Promise<{ error: null | { message: string } }>;
    signOut: () => Promise<{ error: null | { message: string } }>;
  };
};

export function createAuthService(env: ClientEnv): AuthService {
  if (env.supabase === undefined) {
    return createGuestAuthService(false);
  }

  return createSupabaseAuthService(createSupabaseClient(env.supabase));
}

export function createGuestAuthService(authAvailable: boolean): AuthService {
  return {
    async getStatus() {
      return { kind: "guest", authAvailable };
    },
    async requestEmailSignIn() {
      return {
        ok: false,
        message: "Sign-in needs Supabase public configuration.",
      };
    },
    async signOut() {
      clearProtectedCache();
      return { ok: true, message: "Guest session is clear." };
    },
  };
}

export function createSupabaseAuthService(
  client: SupabaseAuthClient,
): AuthService {
  return {
    async getStatus() {
      const { data, error } = await client.auth.getSession();

      if (error !== null || data.session === null) {
        return { kind: "guest", authAvailable: true };
      }

      return { kind: "signed_in", email: data.session.user.email };
    },
    async requestEmailSignIn(email) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        return { ok: false, message: "Enter a valid email address." };
      }

      const { error } = await client.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });

      if (error !== null) {
        return { ok: false, message: "Sign-in link could not be sent." };
      }

      return { ok: true, message: "Check your email for a sign-in link." };
    },
    async signOut() {
      const { error } = await client.auth.signOut();

      if (error !== null) {
        return { ok: false, message: "Sign-out failed. Try again." };
      }

      clearProtectedCache();
      return { ok: true, message: "Signed out." };
    },
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
