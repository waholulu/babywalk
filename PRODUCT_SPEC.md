# Product Specification

## 1. Product identity

**Working name:** SproutScout  
**Tagline:** Your family’s best day, planned.  
**Audience:** English-speaking parents and caregivers in the United States.  
**Pilot geography:** North Jersey and New York City.  
**Primary child range:** 6 months to 8 years, with the MVP optimized for children under 5.

The name is provisional. Brand clearance is a business task, not an engineering assumption.

## 2. Problem

Parents currently search across maps, event sites, library calendars, park websites, social media, and local parenting accounts. The work is repetitive and the results rarely account for:

- the child’s age;
- nap or meal schedule;
- current weather;
- driving tolerance;
- indoor/outdoor preference;
- budget;
- stroller and bathroom needs;
- whether the family has already visited a place;
- the time required to return home.

A long list creates more decision work. SproutScout should reduce the list and explain why each recommendation fits today.

## 3. Product promise

Within 30 seconds, a parent should receive:

- three strong outing options; or
- one simple half-day plan with realistic timing.

Every recommendation must expose the important facts used to choose it. Uncertain facts must be labeled as uncertain or omitted.

## 4. MVP goals

1. Validate whether parents repeatedly use a personalized “what should we do today?” workflow.
2. Validate whether schedule-aware recommendations are more useful than a generic activity directory.
3. Collect structured feedback about missing place attributes.
4. Build a maintainable foundation for later event ingestion and monetization.

## 5. MVP non-goals

The MVP will not include:

- a parent social network or public feed;
- direct messaging or playdate matching;
- user-generated photos;
- live crowd estimation;
- ticket checkout inside the app;
- merchant self-service portals;
- nationwide data ingestion;
- automated scraping of hundreds of local sites;
- generative AI as the source of factual place data;
- child-facing experiences or accounts;
- complex family calendar synchronization;
- full-day travel itinerary planning.

## 6. Core user

**Primary persona:** A busy parent of a baby or toddler who has a two-to-four-hour free window and wants a low-friction local activity.

Typical situation:

- child age: 13 months;
- available window: 9:30 AM–1:30 PM;
- nap: 2:00 PM;
- drive limit: 25 minutes;
- budget: free or under $30;
- wants: stroller friendly, bathroom available, not too hot.

## 7. Jobs to be done

- “Help me decide where to go without researching ten websites.”
- “Do not recommend activities my child is too young for.”
- “Make sure we can get home before nap.”
- “Give me a backup if the weather changes.”
- “Tell me what I need to verify before leaving.”
- “Remember places we liked and avoid repeating them too often.”

## 8. Core screens

### 8.1 Lightweight onboarding

Required inputs:

- child age in months or an age band;
- home area or current location permission;
- typical maximum drive time;
- indoor/outdoor flexibility;
- default budget band.

Optional inputs:

- typical nap window;
- stroller requirement;
- interests;
- memberships;
- accessibility needs.

Do not request the child’s legal name or exact date of birth.

### 8.2 Home / “Plan today”

Inputs should be quick chips or sliders:

- available start and end time;
- drive-time limit;
- free / under $30 / flexible;
- indoor / outdoor / either;
- energy level: easy, normal, adventure;
- current location or saved area.

Primary actions:

- `Show 3 ideas`
- `Plan my morning`

### 8.3 Recommendation results

Each result card displays:

- place name and category;
- estimated travel time;
- recommended arrival window;
- price band;
- indoor/outdoor status;
- age fit;
- top two reasons it fits;
- one warning or verification item when relevant;
- data freshness/source label.

Never display unsupported claims such as “safe,” “clean,” “not crowded,” “changing table available,” or “open” unless the data source supports them and the freshness is shown.

### 8.4 Place detail

Display:

- essential structured facts;
- map location;
- source attribution;
- official website or call action where available;
- “verify before leaving” notes;
- save, visited, liked/disliked feedback;
- report incorrect information.

### 8.5 Day plan

A plan contains one or two stops, travel buffers, and a return-home target. It is intentionally simple.

Example:

```text
9:45 Leave home
10:10 Arrive at library story time
11:00 Walk to nearby playground (optional)
12:15 Start trip home
12:45 Home before 2:00 nap
```

The app should not imply that real-world timing is guaranteed.

### 8.6 Saved and history

- saved places;
- recent visits;
- “do not recommend again” state;
- feedback history.

## 9. Recommendation behavior

### 9.1 Hard filters

A candidate is excluded when any verified condition is incompatible:

- outside maximum travel radius/time;
- clearly unsuitable age range;
- outside available time window;
- known closed during the visit window;
- known price exceeds hard budget;
- outdoor-only when the user explicitly requires indoor;
- would make the planned return time impossible;
- user blocked the place.

Unknown data should not automatically fail a candidate. It should reduce confidence and create a verification note.

### 9.2 Initial score

Use a transparent 100-point scoring model:

| Component | Max points | Description |
|---|---:|---|
| Age and activity fit | 25 | Match to child age and selected energy |
| Schedule fit | 20 | Fits available window and return target |
| Travel convenience | 15 | Drive time and route simplicity |
| Weather fit | 15 | Indoor/outdoor suitability |
| Budget fit | 10 | Price alignment |
| Amenities confidence | 5 | Stroller, bathroom, parking when verified |
| Novelty | 5 | Avoid excessive repetition |
| Family preference | 5 | Interests, likes, dislikes, memberships |

Keep the scoring function pure: input data in, scored candidates out. It must not make API calls.

### 9.3 Explanation

The app returns structured reason codes such as:

- `AGE_MATCH`
- `HOME_BEFORE_NAP`
- `UNDER_BUDGET`
- `WEATHER_MATCH`
- `SHORT_DRIVE`
- `MEMBERSHIP_VALUE`
- `NEW_TO_FAMILY`

UI copy is generated from those codes. An LLM may later rewrite the copy, but the underlying reasons remain deterministic and visible.

## 10. Data strategy

### Phase A: curated pilot

Create 50–100 manually reviewed places in North Jersey and NYC. Include libraries, playgrounds, waterfront walks, children’s museums, zoos, indoor play spaces, farms, and community centers.

Advantages:

- immediate testability;
- known data quality;
- no dependency on expensive APIs;
- easy debugging;
- direct learning about which attributes matter.

### Phase B: external provider adapters

Add server-side adapters for:

- place search/details;
- weather;
- event discovery;
- travel-time estimation.

Every imported record includes source, external ID, retrieval time, and field-level confidence where practical. Provider-specific objects must not leak into UI components.

### Phase C: local events

Start with manually entered or partner-provided events. Add automated ingestion only after measuring recurring use and reviewing provider terms.

## 11. AI boundaries

The first usable MVP can launch without a large-language-model API.

Allowed later uses:

- rewrite structured reasons into friendly prose;
- summarize official descriptions;
- create a concise day-plan narrative;
- classify free-text feedback for internal analysis.

Forbidden uses:

- invent business hours, prices, safety, accessibility, parking, crowd, or amenity facts;
- determine whether a place is open without source data;
- silently override hard filters;
- expose child/family information to a model without an approved privacy design;
- generate recommendations without a structured candidate set.

## 12. Success metrics

### Activation

- onboarding completion;
- first recommendation generated;
- first place detail opened;
- first save or navigation action.

### Value

- recommendation-to-detail click rate;
- “useful” feedback rate;
- outing intent: “we are going” action;
- repeat weekly usage;
- time from app open to decision.

### Quality

- incorrect-information reports per 100 viewed places;
- result sets with fewer than three viable candidates;
- recommendation rejection reasons;
- crashes and failed API calls.

Do not use “time spent in app” as the main success metric. The product should help users leave the app quickly and go somewhere.

## 13. MVP release gate

The MVP is ready for a 20–50-family pilot only when:

- all core flows work on real iOS and Android devices;
- no secret is embedded in the mobile bundle;
- recommendation logic has meaningful unit-test coverage;
- every public database table has reviewed access policies;
- a user can report incorrect place information;
- location permission denial has a functional fallback;
- staging and production are separate;
- privacy policy and support contact exist;
- at least 50 pilot places have freshness/source metadata;
- the team can roll back a bad mobile update or backend migration.
