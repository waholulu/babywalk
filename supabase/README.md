# Local Supabase

Run these commands from the repository root.

```bash
npx supabase start
npx supabase status
npx supabase db reset
npx supabase stop
```

On Windows, Docker Desktop must be installed and running. If `docker` is not on
the current shell PATH yet, open a new terminal or temporarily add:

```powershell
$env:Path = 'C:\Program Files\Docker\Docker\resources\bin;' + $env:Path
```

Do not commit local service keys from `supabase status` into app code or docs.
