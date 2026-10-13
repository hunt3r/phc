---
title: Search engines and AI
order: 8
---

This guide is kept up to date with the website. It opens for reading. Use **Edit**, then **Save**, to correct the article. If something no longer matches the site, ask the person who manages the website.

Search engines can list the public site, and AI tools can read a clear summary of PH&C. You do not turn this on. It follows the pages and fields you already edit.

## What a search result uses

The name in the browser tab and in search results is the page title, with PH&C in front. A page titled Retail is shown as PH&C - Retail.

The short text under that name is the page's description. On a project or a tag, the search result uses about the first 160 characters. The full description still appears on the page.

When someone shares a link, the preview uses that same name, description, and a photo. The photo is the page's main image. If the page has no image, the preview uses the PH&C logo. See **Photos, videos, and content cards**.

Each public page has one official address, and search engines are pointed at that address.

## Which field to fill in

**Home**

- **Page Title** is the homepage name in the browser tab and in search results. If you leave it blank, the name is Home.
- **Subtitle**, under **Hero**, is the homepage summary in search results and in link previews. If you leave it blank, the site uses a standard sentence about PH&C. That subtitle is used even when the top of the homepage is the project slideshow.
- The share photo is the cover image of the first featured project. If none is featured, it is the Hero **Background Image**. See **Home page**.

**Portfolio**

- On a project, **Title** is the search name and **Description** is the summary. **Hero / cover image** is the share photo. **Location**, **Client**, **Date (e.g. 2020)**, and the checked **Sectors** and **Services** are included in the project summary search engines read. If Description is blank, that search result has no summary sentence. See **Portfolio projects**.
- The Portfolio page uses the **Label** of the Portfolio tag as its name, and that tag's **Image** as the share photo. Its search summary is a standard sentence about the portfolio. The tag's **Description** is the banner text visitors see.

**Tags**

- A sector or service page uses **Label** as the search name, **Description** as the summary, and **Image** as the share photo. If Description is blank, that search result has no summary sentence.
- The Services page uses the **Description** and **Image** of the Services tag. If that description is blank, the site uses a standard sentence about PH&C's services. The browser name of the Services page stays Services.
- See **Sectors, services, and tags**.

**About Us, Contact, and Pages**

- **Title** is the search name. **Description** is the summary and the line under the heading. **Featured Image** is the share photo.
- On About, if Description is blank, search results use a standard sentence about the team, and the line under the heading is left off the page.
- On Contact and on a page in **Pages**, if Description is blank, search results use a standard sentence that includes the page title.
- See **About, staff, and other pages** and **Contact, menus, and footer**.

**Staff**

- A profile uses **Name** as the search name. The first paragraph of **Bio** is the summary. If Bio is blank, the summary is the person's name and **Title**. **Profile Photo**, **Title**, and **Credentials** are included in the summary search engines read for that person.

The Testimonials page and the Videos page use a fixed name and summary.

## What search engines are told about the company

Every public page includes a company summary for search engines: PH&C, LLC, the Wayne office, info@phandc.net, founded in 2010 by Paul Harris, the regions the firm serves, and the LinkedIn and YouTube pages. Inner pages also include the breadcrumb trail, the same path shown at the top of the page.

The Services page also includes the five core services and a short set of common questions: what PH&C does, what an owner's representative is, where the firm works, what kinds of projects it manages, and when it was founded.

Those company facts, the five services, and the questions are part of the website. Ask the person who manages the website if they need to change. The address and email visitors see in the footer are edited on **Contact**, in **Contact Info (footer)**.

The site also publishes a list of its public pages so search engines can find them. The homepage, Portfolio, About, and project pages are treated as the most important. This guide stays inside the admin, so that public list leaves it out.

## What AI tools can read

Search engines and AI tools are allowed to read the public site. Two plain-text pages are published for them.

- `/llms.txt` is a short map. It has a one-line summary of the firm, the Wayne address, the email, the founding year, the regions served, and links to About, Services, Portfolio, Testimonials, and Contact. It then lists the five core services, and every project with its title, location, client, date, and description.
- `/llms-full.txt` is that same map, plus the About **Body**, the writeup of each service that has an **Order**, the services nested under those, and each project's details and **Body**. Project details include location, client, date, size, project cost, architect, and contractor when those fields are filled in. A service tag with no Order is left out of this detailed section, the same way it is left off the Services page.

A blank field is left out of these pages. Saving a project, the About page, or a service tag updates them after the site rebuilds.
