# Technical Architecture

## 1. Chosen stack

### Mobile

- **Expo + React Native + TypeScript**
- **Expo Router** for file-based navigation
- **React Native Maps** or the currently supported Expo-compatible map package selected during implementation
- **TanStack Query** for server state and caching
- **React Hook Form + Zod** for validated forms
- React Context or a very small store for temporary app state; do not add a global state library until a concrete need exists
- **Jest with `jest-expo`** and React Native Testing Library
- **Maestro** for a small number of critical end-to-end smoke flows after the MVP flow is stable

### Backend

- **Supabase Postgres** for durable data
- **Supabase Auth** for optional accounts
- **Supabase Storage** only when a concrete file need appears
- **Supabase Edge Functions** for external API calls, secret handling, normalization, and recommendation orchestration
- SQL migrations and seed files committed to Git

### Delivery and operations

- GitHub for source control and pull requests
- GitHub Actions for lint, type checking, and tests
- Expo development builds for production-grade local testing
- EAS Build and EAS Submit for store binaries/submission
- Separate local, staging, and production environments
- Error monitoring provider added before external beta; keep it behind a small wrapper

## 2. Why this stack

The stack uses one primary language—TypeScript—across the mobile app and Edge Functions while retaining SQL for the database. Expo provides a relatively gentle path from local development to iOS and Android builds. Supabase supports a reproducible local stack and migration-driven backend. The combination is appropriate for a solo developer using coding agents because code, schema, and deployment logic can remain in one repository.

## 3. System boundaries

```text
Mobile App
  ├── UI and navigation
  ├── local form state
  ├── server-state cache
  ├── permission handling
  └── presentation of structured explanations
          |
          | authenticated HTTPS
          v
Supabase
  ├── Postgres + RLS
  ├── Auth
  ├── Edge Functions
  │     ├── places adapter
  │     ├── weather adapter
  │     ├── travel-time adapter
  │     ├── event adapter
  │     └── recommendation orchestration
  └── scheduled maintenance jobs (later)
          |
          v
External Providers
  ├── place data
  ├── weather data
  ├── event data
  └── optional language model
```

## 4. Code organization

Expected mobile layout:

```text
mobile/
├── app/                       # Expo Router routes only
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── onboarding/
│   ├── recommendations/
│   ├── places/[id].tsx
│   ├── plan/[id].tsx
│   └── settings/
├── src/
│   ├── components/            # Reusable UI primitives
│   ├── features/
│   │   ├── onboarding/
│   │   ├── recommendations/
│   │   ├── places/
│   │   ├── plans/
│   │   └── feedback/
│   ├── domain/                # Pure types and business rules
│   │   ├── recommendation/
│   │   ├── scheduling/
│   │   └── place/
│   ├── data/                  # Repositories and API clients
│   ├── hooks/
│   ├── lib/                   # Supabase, logging, configuration
│   ├── theme/
│   └── test/
├── assets/
├── app.config.ts
├── eas.json
└── package.json
```

Backend layout:

```text
supabase/
├── config.toml
├── migrations/
├── seed.sql
├── functions/
│   ├── _shared/
│   ├── get-candidates/
│   ├── get-weather/
│   └── build-day-plan/
└── tests/
```

## 5. Architectural rules

### 5.1 Routes are thin

Files in `mobile/app/` should assemble feature components, not contain substantial business logic, SQL, or provider transformations.

### 5.2 Domain logic is pure

Recommendation scoring, age fit, time-window checks, budget checks, and plan timing live under `src/domain/`. These functions:

- accept explicit inputs;
- return explicit outputs;
- have no network or filesystem calls;
- do not read global environment variables;
- are covered by unit tests.

### 5.3 Repositories hide persistence

UI code calls repository interfaces such as:

```ts
interface PlaceRepository {
  listCandidates(input: CandidateQuery): Promise<PlaceCandidate[]>;
  getById(id: string): Promise<PlaceDetail | null>;
  savePlace(id: string): Promise<void>;
}
```

The UI should not build raw Supabase queries.

### 5.4 External providers are adapters

Each provider maps its response into internal types. Example:

```ts
interface WeatherProvider {
  getForecast(input: WeatherRequest): Promise<WeatherSnapshot>;
}
```

Provider response JSON must be validated at the boundary. Never pass unvalidated external data directly into scoring.

### 5.5 Secrets stay server-side

The mobile app may contain only publishable client configuration such as the Supabase URL and anon key. External provider secret keys and the Supabase service role key must remain in server-side secret storage and never use the `EXPO_PUBLIC_` prefix.

### 5.6 Unknown is a first-class value

Do not convert missing facts to false. Model attributes with `true | false | unknown` or explicit confidence metadata where the distinction affects recommendations.

## 6. Recommendation pipeline

```text
User constraints
  -> normalize input
  -> retrieve candidate places/events
  -> apply hard filters
  -> calculate score components
  -> attach reason codes and warnings
  -> diversify categories
  -> select top three
  -> optionally build one- or two-stop plan
  -> optionally rewrite structured copy with an LLM
```

The pipeline output should be serializable and inspectable:

```ts
interface RecommendationResult {
  candidateId: string;
  totalScore: number;
  scoreBreakdown: Record<ScoreComponent, number>;
  reasonCodes: ReasonCode[];
  warnings: RecommendationWarning[];
  confidence: 'high' | 'medium' | 'low';
}
```

A developer debug screen may display this breakdown in non-production builds.

## 7. Location and travel time

### MVP

- Obtain current coordinates only after user action and permission.
- Support manual city/ZIP-area fallback.
- Store a coarse saved area, not a precise home address.
- For curated data, begin with approximate travel distance or a provider adapter.
- Treat travel time as an estimate and add buffers.

### Later

A routing provider can replace simple distance estimates without changing the domain interfaces.

## 8. Offline and degraded behavior

The app should remain understandable when a provider fails:

- cached or curated candidates may still display;
- weather failure removes weather scoring and shows a warning;
- map failure preserves list view and address;
- optional LLM failure falls back to deterministic template copy;
- auth failure should not destroy local unsaved input;
- provider errors should have correlation IDs in server logs.

## 9. Observability

Use a tiny wrapper rather than direct vendor calls throughout the code:

```ts
logger.info('recommendation_generated', metadata);
logger.warn('weather_unavailable', metadata);
logger.error('place_provider_failed', error, metadata);
```

Never log:

- auth tokens;
- API keys;
- precise home coordinates;
- child identifiers;
- raw family profile payloads;
- external provider responses that may contain restricted data.

## 10. Environments

| Environment | App | Backend | Purpose |
|---|---|---|---|
| Local | Expo development server/build | Local Supabase | Normal coding and tests |
| Staging | Internal EAS build/update | Staging Supabase | Device QA and pilot checks |
| Production | Store build | Production Supabase | Public users |

Do not point a development build at production by convenience.

## 11. Decision log

When a significant choice changes, append a dated entry to this file or create a small architecture decision record. Examples:

- changing maps provider;
- adding a new state library;
- introducing a background job service;
- moving recommendation logic from client to server;
- storing new child/family information;
- adopting an LLM provider.

Every decision entry includes context, decision, alternatives, consequences, and rollback plan.
