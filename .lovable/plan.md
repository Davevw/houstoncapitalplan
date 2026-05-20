## Goal
Fix the incorrect text shown on the entrance-arch logo in `03-bissonnet-entrance.jpg` (currently displayed on the Design Standards → Artist's Renderings section).

## Approach

1. Download the current `03-bissonnet-entrance.jpg` from the Supabase vault (`itph-data-vault/Renderings/`).
2. Use AI image editing (`imagegen--edit_image`) to **remove the text from the arch logo entirely**, leaving a clean architectural arch. Rationale: the left column already displays the proper ITPH logo and name, so a clean arch avoids any risk of the AI re-rendering garbled "International Trade Park Houston" text (image models routinely misspell long phrases on signage).
3. QA the edited image — zoom in on the arch to confirm the text is gone and the rest of the rendering (streetscape, landscaping, lighting, perspective) is unchanged.
4. Re-upload the corrected file to Supabase at the same path (`Renderings/03-bissonnet-entrance.jpg`) so the live site picks it up immediately (no code change needed — the `VAULT` URL is unchanged).
5. If you'd prefer the arch to actually read "International Trade Park Houston", I'll attempt that variant as well and we pick the better result. Text-on-signage in AI edits is unreliable, so the clean-arch version is the safer default.

## Files touched
- None in the codebase. Only the asset in Supabase storage is replaced.

## Confirm before I proceed
- Default: **remove the text**, clean arch.
- Alternative: try a text version reading "International Trade Park Houston" first, fall back to clean if illegible.
