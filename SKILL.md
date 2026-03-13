---
name: idle-rpg-asset-creator-hq
description: >-
  Generate high-quality 512x512 RPG assets for idle games using a strict solid-white
  background workflow. Always produce the main subject centered over a pure static
  white background (#FFFFFF), with no transparency, no checkerboard, no fake alpha,
  and no blended scene background. This white-background standard exists so downstream
  pipelines can apply real background removal and edge cleanup. Optionally produce
  separate overlay effect frames and a combined preview GIF. Prioritize clean silhouettes,
  game readability, and post-processing compatibility.
---

# idle-rpg-asset-creator-hq

Generate layered RPG assets for idle/MMO-style games using a **white-background-first**
workflow optimized for later background removal, edge cleanup, WebP export, and
animation pipelines.

This skill does **not** rely on AI-generated fake transparency for the production base.

Instead, it enforces:

1. **Base sprite on white** = subject centered over a pure static white background
2. **Overlay frames** = optional effect-only layers for later composition
3. **Preview GIF** = optional combined visualization for quick review

This workflow is intended for pipelines where the asset will later be:
- cleaned with real remove-bg
- edge-corrected
- converted to WebP
- turned into GIF or spritesheet
- animated using fake-idle or effect passes

---

## Primary objective

The most important requirement is:

**Always deliver the main asset over a pure, static, uniform white background (#FFFFFF).**

This is non-negotiable.

The purpose is to guarantee:
- predictable background removal
- better edge extraction
- less matte contamination
- less fake transparency
- more reliable post-processing

The base image must be suitable for later cutout processing in a controlled pipeline.

---

## Non-negotiable rule

The base image must always use:
- solid white background
- static white fill
- uniform white from edge to edge
- no transparency
- no gradient
- no vignette
- no scenery
- no atmospheric backdrop
- no decorative frame
- no colored background
- no textured wall/floor
- no fake studio background

If any pixel outside the subject is not plain white, the result is invalid.

---

## Output contract

### Required output
- `base_png_white`

### Optional outputs
- `overlay_frames`
- `preview_gif`

### File naming
- Base sprite on white: `subject_base_white.png`
- Overlay sequence: `overlay_frame_00.png` ... `overlay_frame_NN.png`
- Combined preview: `preview.gif`

---

## Hard rules

### 1) Base image background rule
The `base_png_white` must:
- contain the subject centered on canvas
- use a **pure solid white background (#FFFFFF)**
- have **no transparency**
- have **no checkerboard**
- have **no gray/off-white background**
- have **no shadowed studio backdrop**
- have **no gradient**
- have **no environment**
- have **no text**
- have **no watermark**
- have **no decorative border**
- have **no floor or pedestal unless explicitly requested**

### 2) White must be uniform
The background must be:
- flat
- static
- perfectly white
- visually clean
- identical across the entire empty area

Do not simulate a cutout with:
- soft white fog
- bloom wash
- faded white mist
- near-white matte
- textured paper white
- dirty white
- blue-white or gray-white tones

Use plain white only.

### 3) No fake transparency in base
Do not try to deliver:
- embedded alpha
- soft background fade
- pseudo-cutout
- partially transparent edge blending
- semi-transparent export tricks

The base must be a normal image on a white background, ready for real background removal later.

### 4) No baked effects in base unless explicitly requested
If the subject uses:
- aura
- flame
- lightning
- poison cloud
- sparkles
- magical glow
- mist
- energy arcs

Then:
- keep the core subject readable
- avoid merging the effect so aggressively that remove-bg becomes harder
- prefer putting strong VFX into `overlay_frames`

### 5) Readability first
The subject should occupy about **60–75% of the canvas**.
Silhouette clarity is more important than excessive detail.
The image must remain readable when reduced to icon size.

---

## Accepted parameters

- `subject`: string  
  What to generate.  
  Examples: `"orc warrior"`, `"steel breastplate"`, `"shadow dagger"`, `"mana orb"`

- `style`: `pixel | chibi | painted`  
  Default: `pixel`

- `size`: `128x128 | 252x252 | 512x512`  
  Default: `512x512`

- `pose`: `front | 3q | side | topdown-item`  
  Default: `3q`

- `frames`: integer  
  Number of overlay frames. Default: `12`

- `loop_duration`: float  
  Full animation loop duration in seconds. Default: `1.0`

- `effect`: string  
  Optional effect description and color  
  Example: `"ember swirl orange"`, `"holy glow gold"`, `"void smoke purple"`

- `effect_intensity`: integer from `0` to `100`  
  Default: `30`

- `palette`: string  
  Optional palette constraint

- `preserve_silhouette`: boolean  
  Default: `true`

- `output`: array  
  Any of: `["base_png_white", "overlay_frames", "preview_gif"]`

---

## Strict generation behavior

### When `base_png_white` is requested
Generate:
- one main subject
- centered on canvas
- over a pure static white background
- no transparency
- no scene composition
- no cinematic environment
- no fake cutout tricks

### When `overlay_frames` is requested
Generate:
- separate effect visuals
- designed for later composition
- keep subject readability safe
- avoid turning the effect into a white-background contamination problem

### When `preview_gif` is requested
Generate:
- a quick combined preview for review
- preview is not the production source
- the production source remains the white-background base image

---

## Base sprite specification

The base sprite is the production input for downstream remove-bg.

It must be:
- centered
- clean
- readable
- isolated in composition
- placed over a pure white background
- free from background clutter
- suitable for later extraction

### Base sprite must include
- full intended subject
- essential form details
- material readability
- strong silhouette
- palette coherence

### Base sprite must not include
- scene background
- floor texture
- atmospheric depth fog
- environmental storytelling elements
- decorative panel
- colored backdrop
- gradient white
- dirty white
- shadowy studio wall

---

## White-background enforcement

Use these rules whenever generating the base:

- Background color must be exactly white in appearance.
- Empty canvas area must stay plain and static.
- Do not add ambiance behind the subject.
- Do not create presentation-style backgrounds.
- Do not add painterly white clouds behind the subject.
- Do not tint the white background with nearby colors.
- Do not use soft fade-to-white edges.

### Visual acceptance check
A valid `base_png_white` should look like:
- subject in the center
- everything outside it clean white
- no transparency
- no visual trickery
- no scene elements

If the background looks like anything other than plain white, the result is invalid.

---

## Subject separation guidelines

Even though the final cutout will happen later, the image should already help the remove-bg process:

- keep the subject visually distinct from the white background
- avoid washing out white or very pale asset edges
- preserve contour readability
- use subtle outline or contrast when needed
- do not let highlights disappear into the white field

### Outline policy
When `preserve_silhouette = true`:
- allow a subtle 1–2 px darker outline where useful
- reinforce contour clarity against white
- avoid thick sticker-like borders unless stylistically intended

This is especially important for:
- silver armor
- white bone items
- ice items
- angelic effects
- pale cloth
- reflective weapons

---

## Overlay specification

Overlay frames are secondary layers.

They exist to:
- animate glow
- animate magic
- animate sparks
- animate smoke
- animate aura
- animate impact shimmer

They should:
- stay visually separable from the base
- preserve visibility of the subject
- respect `effect_intensity`
- avoid making later extraction harder when previewed together

### Intensity guide
- `0–15`: subtle shimmer
- `16–35`: light readable effect
- `36–60`: noticeable effect, still gameplay-safe
- `61–80`: strong effect, silhouette preserved
- `81–100`: dramatic effect, but core subject still readable

Even at high intensity:
- do not fully hide the item or character
- do not replace the silhouette with pure VFX noise
- do not flatten the asset into a glow blob

---

## Pixel-art / game-readability guidelines

- Prefer limited palettes: roughly `12–24` colors when possible
- Preserve material contrast
- Avoid muddy gradients
- Avoid over-texturing small assets
- Prioritize silhouette over noisy micro-detail
- Keep internal contrast strong enough for small UI display
- Ensure the subject reads clearly even before background removal

### Special note for light-colored subjects
If the subject contains white, silver, ivory, pale blue, or gold highlights:
- increase edge clarity
- reinforce separation from the white background
- avoid overexposed highlights
- keep contour readable for downstream segmentation

---

## Prompt template

Use this internal structure when generating assets:

Subject: {subject}  
Style: {style}  
Size: {size}  
Pose: {pose}  
Background: pure solid static white (#FFFFFF), no transparency  
Base sprite rule: centered subject only, no scene, no frame, no gradient, no fake alpha, no environmental background  
Effect: {effect or none}  
Effect intensity: {effect_intensity}  
Frames: {frames}  
Outputs: {output}  
Readability rule: subject occupies ~60–75% of canvas and remains legible at small scale  
Silhouette rule: preserve clear contour against white  
Export rule: base image must be optimized for later real background removal

---

## Output examples

### Example A — static item
**Input**
- subject: `iron sword`
- style: `pixel`
- size: `512x512`
- output: `["base_png_white"]`

**Expected**
- `iron_sword_base_white.png`
- sword centered
- full white static background
- no transparency
- no glow
- no floor shadow
- no backdrop scene

### Example B — animated low-effect item
**Input**
- subject: `mana orb`
- style: `pixel`
- size: `512x512`
- effect: `soft blue arcane swirl`
- effect_intensity: `25`
- frames: `12`
- output: `["base_png_white","overlay_frames","preview_gif"]`

**Expected**
- clean orb base on white in `base_png_white`
- separate magical swirl in overlay frames
- preview GIF for inspection

### Example C — boss with strong aura
**Input**
- subject: `void knight boss`
- style: `pixel`
- size: `512x512`
- effect: `purple-black void flames`
- effect_intensity: `80`
- frames: `16`
- preserve_silhouette: `true`
- output: `["base_png_white","overlay_frames","preview_gif"]`

**Expected**
- boss centered on solid white
- silhouette preserved
- aura controlled for readability
- overlay separated when requested

---

## Failure conditions

The generation is invalid if any of the following happens in `base_png_white`:

- background is not fully white
- background includes gradients
- background includes texture
- background includes scenery
- transparency is present
- fake transparency is simulated
- subject is fused into environmental effects
- halo contamination makes later cutout harder
- subject is too small on canvas
- subject is clipped
- excessive blur harms game readability

If invalid, regenerate with stricter white-background enforcement.

---

## Regeneration fallback rules

If the output includes any unwanted background artifacts:
1. Regenerate the image with a **pure static white background**
2. Remove all environmental/contextual elements
3. Remove background styling and gradients
4. Re-center subject and preserve silhouette
5. Reduce edge contamination
6. Re-export as normal PNG with white background only

Priority order:
1. pure white background
2. readable silhouette
3. clean edge separation
4. controllable effect usage
5. preview polish

---

## Testing and evals

Include at least these tests in `evals/evals.json`:

1. **Static icon**
   - subject only
   - white background only
   - verify no transparency and no scenery

2. **Animated item, low effect**
   - clean base on white
   - subtle overlay
   - preview combined

3. **Boss, strong effect**
   - intense overlay
   - silhouette preserved
   - white background remains plain and uniform

### Evaluation criteria
- Is the base image on a pure solid white background?
- Is the background uniform and static?
- Is transparency absent?
- Is the subject centered and readable?
- Are effects controlled and separated when requested?
- Is the asset suitable for later remove-bg and game compositing?

---

## Packaging notes

Keep:
- palettes in `assets/palettes/`
- reusable prompt fragments in `prompts/templates.md`
- eval cases in `evals/evals.json`

This skill should remain compact, explicit, and biased toward production-ready assets
prepared for later real background removal.

---

## Improvement rule

When iterating on this skill, always optimize for:

1. stricter pure-white background consistency
2. better subject separation against white
3. cleaner downstream remove-bg results
4. stronger in-game readability
5. overlays that enhance, never obscure, the subject