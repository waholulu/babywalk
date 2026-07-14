# Beginner Debugging Playbook

## Rule zero

Do not change multiple layers at once. First determine whether the failure is in:

1. local toolchain;
2. Expo bundler/native build;
3. UI/state;
4. domain logic;
5. network/client configuration;
6. Edge Function;
7. database/RLS;
8. external provider;
9. staging/production configuration.

## Minimum bug report

Copy this template into an issue or agent prompt:

```text
Expected:
Actual:
Exact error text:
First time observed:
Last known working commit:
Branch/commit:
Device and OS:
Expo/app build profile:
Backend environment:
Steps to reproduce:
Frequency:
Screenshots/log excerpt with secrets removed:
What changed immediately before it began:
```

## Fast triage sequence

### 1. Confirm repository state

```bash
git status
git log -5 --oneline
```

Check that the right branch and environment are active.

### 2. Run the smallest relevant check

- Type error: `npm run typecheck`
- Lint error: `npm run lint`
- Domain bug: targeted unit test
- UI bug: component test, then real device
- Backend bug: local function invocation and database logs
- RLS bug: test as the actual anon/authenticated user, not service role

### 3. Reduce input

Replace provider/network data with a fixed fixture. If the bug disappears, the boundary or external data is likely involved. If it remains, inspect domain/UI logic.

### 4. Inspect structured state

In development only, show:

- normalized user constraints;
- candidate exclusion reasons;
- score breakdown;
- provider status and retrieval timestamp;
- active environment name.

Never display secrets or full tokens.

### 5. Add a regression test

For deterministic logic and parsing bugs, reproduce the exact bad input in a test before the fix. A bug that cannot be reproduced should not trigger a broad refactor.

## Common failure patterns

### “Works in Expo Go but not the build”

The project may use a native package not included in Expo Go, or native configuration may be stale. Use a development build for production-grade work. Rebuild after native dependency/config changes.

### “Environment variable is undefined”

- Confirm the correct env file/profile.
- Confirm whether the variable is client-safe and intentionally public.
- Restart the bundler after changes.
- Do not rename a secret with `EXPO_PUBLIC_` just to make it visible.

### “Supabase query returns empty data”

- Confirm active backend URL/project.
- Check authentication state.
- Inspect RLS policies.
- Test the same query with a user JWT, not service role.
- Confirm ownership fields and indexes.

### “Storage/database says row violates RLS”

Treat this as a policy/design problem, not as a reason to disable RLS. Verify insert `WITH CHECK`, select policy needed for returned rows, owner ID, JWT, and storage-specific policies.

### “Provider request works locally but fails on device”

- Ensure the request is server-side when a secret is required.
- Check Edge Function CORS and authentication.
- Validate URL and environment.
- Check timeout and response schema.
- Confirm provider key restrictions and quotas.

### “Recommendation looks wrong”

Use the score inspector:

1. Was the place incorrectly included before scoring?
2. Was a hard filter unknown versus false?
3. Which score component dominated?
4. Was a preference allowed to override a hard incompatibility?
5. Did stale or low-confidence data receive too much weight?

Do not patch individual place names into scoring logic.

### “Agent fixed it by disabling a check”

Revert the workaround. Checks may be changed only when the project rule itself is wrong, with a documented decision. Never accept `eslint-disable`, `@ts-ignore`, skipped tests, permissive RLS, or empty catch blocks as an unexplained fix.

## Cache reset ladder

Use the least destructive step first:

1. reload the app;
2. restart Metro;
3. clear Metro cache;
4. reinstall JavaScript dependencies from lockfile;
5. rebuild development client after native changes;
6. reset local Supabase only after confirming seed/migrations are safe.

Do not delete lockfiles or regenerate native projects casually.

## Safe logging

Use event names and IDs, not raw personal objects. Redact tokens, coordinates, addresses, and provider keys before sharing logs with an agent.
