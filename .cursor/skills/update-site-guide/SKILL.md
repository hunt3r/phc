---
name: update-site-guide
description: Updates the PH&C team's Tina site guide when editor workflows, Tina fields, or visitor-facing results of those edits change. Use when editing Tina collections, admin labels, page content behavior, menus, projects, tags, staff, contact, photos, videos, content cards, or when the user mentions the site guide, How to use this site, or editor documentation.
---

# Update the site guide

The guide lives in `src/content/guides/` and appears in Tina as **How to use this site**. It is the only copy the team reads. Update the article that covers the change. Do not add a public page for it.

## Voice

Write for the PH&C team, not developers.

- Use the Tina sidebar labels and field labels as they appear in the admin.
- Say what to click, what the field changes on the site, and what happens if it is left blank.
- No file paths, code, commands, or setup steps.
- Keep the opening note on every article: the guide is maintained with the website and should not be edited in the admin.
- Numbered filenames and the `order` field set reading order. Do not renumber unless an article is added or removed.

## Which article to edit

- `01-start-here.md` — signing in, the left menu, saving, and where to go for a task. Update the menu list when a collection is added, removed, or renamed.
- `02-home-page.md` — homepage banner, slideshow, latest projects, quotes, videos, and the Home settings that control counts and the hero.
- `03-portfolio-projects.md` — creating a project and what each Portfolio field does on the project page and cards.
- `04-sectors-services-and-tags.md` — Tags, parents, sectors, services, and how checking them attaches a project.
- `05-about-staff-and-pages.md` — About Us, Staff, profile pages, and Pages.
- `06-contact-menus-and-footer.md` — Contact, the footer contact block, header and footer links, and the footer description.
- `07-photos-videos-and-content-cards.md` — uploads, YouTube videos, Promote to home page, and content card options.

A change that spans two areas updates both articles. Add a new article only when a new editor-facing area does not fit these. Put it last, give it the next number, and add it to this list and to Start here.

## Check before finishing

- The field names in the article match `tina/config.ts`.
- Blank, default, and "only if" behavior matches the page that renders it.
- The article still tells the team not to edit the guide.
