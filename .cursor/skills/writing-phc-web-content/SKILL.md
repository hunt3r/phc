---
name: writing-phc-web-content
description: Writes and rewrites visitor-facing copy for the PH&C website (phandc.net) in the firm's voice, following web-writing, SEO, and accessibility practice and stripping out AI-sounding tropes. Use when drafting or editing portfolio project write-ups, service and sector tag pages, About, staff bios, homepage hero slides, content cards, video descriptions, page titles, descriptions, alt text, or button labels, or when the user asks for marketing copy, web content, or creative writing for PH&C.
---

# Writing PH&C web content

PH&C, LLC is an owner's representative and construction management firm in Wayne, PA, founded in 2010 by Paul Harris. It manages planning, entitlement, procurement, and site construction for land owners, developers, REITs, businesses, and government agencies across Greater Philadelphia and the Mid-Atlantic. Most of the team are civil engineers and construction managers with 20 to 35 years in the field.

The reader is usually a developer, property owner, facilities lead, or lender deciding whether PH&C can handle their project. They know what a site plan is. They skim, and they are looking for proof: similar projects, named clients, permits handled, problems solved.

## Workflow

```
- [ ] 1. Find where the text will appear (see "Fields and limits")
- [ ] 2. Gather the facts from the repo; list anything missing
- [ ] 3. Draft
- [ ] 4. Run the checker and do the manual trope pass
- [ ] 5. Write it into the file, or hand it back with open questions
```

**1. Placement.** A description field, a project body, and a hero slide are different jobs. Read the target file and the neighboring entries so length, heading style, and structure match.

**2. Facts.** Pull from the project frontmatter (`location`, `client`, `date`, `size`, `projectCost`, `architect`, `engineer`, `contractor`, `sectors`, `services`), `src/content/entities/`, related tags, and staff bios. Never invent a number, tenant, client, date, permit, award, or quote. If a fact would make the copy better and isn't in the repo, write without it and ask the user for it in your reply. Do not leave placeholders like `[TBD]` in files; they get published.

**3. Draft** using the voice and structure rules below.

**4. Check.** Run the checker on the file, or pipe draft text to it:

```bash
node .cursor/skills/writing-phc-web-content/scripts/check-copy.mjs src/content/tags/retail.md
echo "draft text" | node .cursor/skills/writing-phc-web-content/scripts/check-copy.mjs
```

Fix every flag or keep it on purpose (for example, "landscape" when it means plantings). The script catches words and phrases. It cannot catch rhythm or vagueness, so also do the manual pass in [tropes.md](tropes.md).

**5. Deliver.** When editing files, change only the copy fields asked for. When the user wants options (headlines, hero lines), give two or three that differ in angle, not in synonyms.

## Voice

Write like a senior construction manager explaining the job to an owner across a site trailer table: direct, specific, calm, a little dry. Confidence comes from the details. (The quoted examples in this section illustrate style. They are not PH&C facts.)

- **"We" is PH&C, "you" is the owner.** Use "PH&C" by name once or twice per page, not in every paragraph.
- **Concrete beats abstract.** Name the permit (NPDES, PennDOT Highway Occupancy Permit), the agency, the acreage, the tenant, the township. "Coordinated PECO, Aqua, and PGW service to five pad sites" says more than "managed utility coordination."
- **Show the owner's outcome in money, time, or risk.** "Bid the site work separately from the building, so the owner paid no GC markup on $2M of earthwork" beats "saving costly markup fees." Only use figures the repo or user provides.
- **Use the trade's words correctly.** Terms like value engineering, pad-ready, escrow release, and constructability are fine for this audience. Spell out an acronym on first use only if a lender or business owner might not know it.
- **Plain verbs.** Manage, bid, permit, build, inspect, coordinate, negotiate, close out. Not leverage, streamline, elevate, or empower.
- **Restraint.** No exclamation points, no superlatives without proof, no "we're passionate about." The core values ("we treat our client's money like our own") are strong because they're plain; keep that register.
- **Active voice, past tense for finished work.** "PH&C managed the demolition," not "Demolition was managed." Completed projects are past tense. Avoid "nearing completion" or "now open" phrasing that goes stale.

## Web structure

- **Front-load.** The first sentence of a page says what it is and why it matters to the owner. Do not restate the title or open with a general truth ("Every great project starts with...").
- **One idea per paragraph,** 2 to 4 sentences. Vary sentence length naturally; don't make every paragraph the same shape.
- **Headings.** The page title is the H1. Body headings start at `##`. Write headings that say something ("Utilities for five pad sites"), not labels ("Overview", "Our Approach"). Match the case style already used on that page.
- **Lists** for parallel items a reader will scan: scope items, tenants, permits. Keep list items parallel in grammar. Prose for reasoning and narrative.
- **Links.** Link text names the destination: "see our [retail projects](/portfolio/retail)". Never "click here", "learn more", or "click on the above links." Use current site paths (`/portfolio/<slug>`, `/services/<slug>`, `/about`, `/contact`), not old `phandc.net/...-overview/` WordPress URLs. Link to two or three related projects or services where they genuinely relate.
- **One call to action at most,** at the end, and specific: "Tell us about your site" over "Contact us today to get started!"
- **SEO.** Pick the phrase a client would search ("owner's representative Philadelphia", "self-storage development Delaware") and use it naturally in the title, description, first paragraph, and one heading. Never repeat it to pad. Place names (town, county, state) belong in project copy because people search by them.
- **Accessibility.** Alt text describes what the photo shows and why it's there, in under 125 characters, without "image of" or "photo of." "Graded pad and curb line at the future ALDI, Roosevelt Boulevard" not "Redevelopment Project - image 3." Don't put meaning only in bold or color.

## Fields and limits

The site prefixes every browser and search title with `PH&C - `.

| Content | Field | Where it shows | Target |
| --- | --- | --- | --- |
| Portfolio project | Title | H1, card title (2 lines), search name | Under 55 characters. Project or tenant name, town, state: "Nabisco Plaza Redevelopment, Philadelphia, PA". No dates or status. |
| Portfolio project | Description | Card (3 lines), search summary | 110 to 155 characters, one or two full sentences. What was built, where, and PH&C's role. Search cuts at 160. |
| Portfolio project | Body | Project page | 150 to 400 words. Lead with the owner's goal or the hard part, then scope, then outcome. A "Scope" list is fine. |
| Service or sector tag | Label | Heading, nav, cards | The service name as clients say it. Title Case, matching sibling tags. |
| Service or sector tag | Description | Banner text, service cards, search summary | 110 to 155 characters. What the service is and the owner's benefit. |
| Service or sector tag | Body | Tag page | 120 to 300 words. What PH&C does, when an owner needs it, what they get. Link to a project that shows it. |
| About, Contact, Pages | Description | Line under the heading, search summary | 110 to 155 characters. |
| Staff | Bio | Profile page; first paragraph is the search summary | Third person. Paragraph one: role and what they handle on projects, in two or three sentences. Then career history, then credentials. First name after first mention. |
| Home hero slide | Title / Description | Homepage banner | Title under 8 words. Description one sentence, under 20 words. |
| Button | Button text / CTA Text | Buttons | 2 to 4 words, verb first: "See retail projects", "Start a project". |
| Video | Description | Video cards | One or two sentences on what the viewer will see. |
| Customer quote | Quote | Testimonials, homepage | Only real quotes, verbatim. Fix typos only with the user's approval. |

## File conventions

- Frontmatter strings use plain `PH&C`. In markdown bodies, Tina saves `PH\&C`; match whatever the file already uses.
- Quote a frontmatter string with single quotes when it contains a colon or apostrophe, and double any apostrophe inside it (`'PH&C''s role'`).
- Editing copy does not change editor steps, so the site guide does not need an update for copy-only work.

## Additional resources

- [tropes.md](tropes.md): the full list of AI patterns to remove, with replacements. Read it before step 4.
- [examples.md](examples.md): before and after rewrites of real PH&C copy.
