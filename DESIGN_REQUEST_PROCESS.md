# ITPH Design Request → Scenario Process

_Established May 28-29, 2026. Filed by Beast._

---

## Trigger

Mark (or any authorized user) submits a design concept through the **Design Request Composer** on the Houston Capital Plan web app. The request lands in the Supabase `design_requests` table with status `submitted`.

## Process (Beast executes)

### Step 1: Read the Request
```
Supabase: design_requests → status = "submitted"
```
Pull: concept_name, description, priority_lots, target_client_type, clarifications (Q&A pairs), submitted_by.

### Step 2: Build the Scenario
Using the request brief + clarification answers:
- Assign each of the 30 lots to a district (retail, flex, multifamily, industrial, common)
- Apply pricing: Corner retail $18/SF, Frontage retail $15/SF, Flex $10/SF, Multifamily $7/SF
- Calculate per-lot gross revenue (acres × 43,560 × $/SF)
- Generate district summary (acreage, %, lot count, revenue per district)
- Total revenue across all districts

### Step 3: Write to Supabase
Insert the completed scenario into `design_scenarios` table:
```json
{
  "slug": "kebab-case-name",
  "name": "Concept Name",
  "tagline": "One-line summary",
  "description": "Full description from Mark's brief + Beast's interpretation",
  "target_profile": "Who this is optimized for",
  "status": "published",
  "district_summary": { ... },
  "lot_assignments": { "1": "retail", "2": "flex", ... }
}
```

### Step 4: Update Request Status
```
Supabase: design_requests → id = [request_id] → status = "converted"
```

### Step 5: Update Bundled JSON (backup)
Append the scenario to `src/data/scenarios.json` → git commit → git push.
This is fallback data — the live app reads Supabase first.

### Step 6: Notify
- Status card in the app automatically updates (reads from Supabase)
- No Lovable re-publish needed for data-only changes

---

## Reference Data

### Lot Positions (fixed across all scenarios)
| Position | Lots |
|----------|------|
| Corner | 1, 12, 14, 15, 23 |
| Frontage | 2, 3, 4, 8, 17, 18, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30 |
| Interior | 5, 6, 7, 9, 10, 11, 13, 16, 19 |

### Road Assignments (fixed)
| Lot | Road |
|-----|------|
| 1 | Cook/Bissonnet Corner |
| 2-4 | Bissonnet Frontage |
| 5-7 | S Kirkwood corridor |
| 8 | Cook/ITPH Frontage |
| 9-10 | Cook Corridor Interior |
| 11-12 | Interior / ITPH-Cook |
| 13-16 | Interior (large multifamily parcels) |
| 17-18 | Bissonnet/Collector |
| 19-24 | Collector/ITPH corridor |
| 25-29 | Interior Frontage |
| 30 | Bissonnet/S Kirkwood Corner |

### Pricing Tiers
| District | Position | $/SF |
|----------|----------|------|
| Retail | Corner | $18 |
| Retail | Frontage | $15 |
| Flex | Any | $10 |
| Multifamily | Any | $7 |
| Industrial | Any | $8 |

### Total Site
- 30 lots, ~99.6 acres (136 total with infrastructure)
- Development Standards v1 = constant across all scenarios

---

## Completed Scenarios (as of May 29, 2026)

| # | Scenario | Source | Date |
|---|----------|--------|------|
| 1 | Town Center | Bundled (original 5) | May 27 |
| 2 | Logistics Corridor | Bundled | May 27 |
| 3 | Workforce Village | Bundled | May 27 |
| 4 | Premium Pad Strategy | Bundled | May 27 |
| 5 | Balanced Mixed-Use | Bundled | May 27 |
| 6 | Restaurant Row | Design Request (Mark) | May 28 |
| 7 | Retail Intersection Clustering | Broker feedback | May 29 |
| 8 | Walking Nature Retail Concept | Design Request (Mark) | May 29 |

---

_When a new design request arrives, Beast follows Steps 1-6 above. No manual intervention needed beyond the initial submit._
