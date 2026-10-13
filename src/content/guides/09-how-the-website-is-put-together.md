---
title: How the website is put together
order: 9
---

This guide is kept up to date with the website. It opens for reading. Use **Edit**, then **Save**, to correct the article. If something no longer matches the site, ask the person who manages the website.

This article explains the services behind the public site, who needs a login, and what happens after you click **Save**. Day-to-day editing starts with **Start here**.

## The pieces

Several services work together. Setup for them is handled outside this guide.

- **Tina** is the editor. Open the website and add `/admin` to the end of the address, then sign in. The left menu is **How to use this site**, **Portfolio**, **Tags**, **About Us**, **Contact**, **Pages**, **Staff**, **Site Settings**, and **Home**.
- **GitHub** holds a copy of every page. When you click **Save**, Tina writes that change into GitHub.
- **Netlify** builds the public website from the GitHub copy and hosts phandc.net. A save is live after Netlify finishes that rebuild, usually within a minute or two.
- **Cloudinary** stores the photos you upload. See **Photos, videos, and content cards**.
- **GoDaddy** holds the phandc.net domain name and points visitors at the site Netlify hosts. Those address settings live in the GoDaddy account.
- **YouTube** is where videos are hosted. The site embeds them. See **Photos, videos, and content cards**.

## Logins to keep

Ask the person who manages the website for access. Keep passwords with that person.

Editors who update pages only need the Tina login.

Someone on the team should also be able to sign in to each of these:

- **Tina**, at [tina.io](https://tina.io), to edit the site and to manage who else can sign in.
- **GitHub**, at [github.com](https://github.com), because that is where saved pages are stored. A change in Tina shows up there as an update to the website files.
- **Netlify**, at [netlify.com](https://www.netlify.com), to see builds, the live site, and messages sent through the contact form.
- **Cloudinary**, at [cloudinary.com](https://cloudinary.com), because uploaded photos are stored there.
- **GoDaddy**, at [godaddy.com](https://www.godaddy.com), because that account owns phandc.net and controls where the domain points.

## What each service costs

Prices change. Use the vendor's own pricing page:

- [GitHub pricing](https://github.com/pricing)
- [Tina pricing](https://tina.io/pricing)
- [Netlify pricing](https://www.netlify.com/pricing/)
- [Cloudinary pricing](https://cloudinary.com/pricing)
- [GoDaddy domain pricing](https://www.godaddy.com/domains). Domain pricing covers the name and the address settings that point phandc.net at Netlify.

## What happens when you click Save

1. You edit a page in Tina and click **Save**.
2. Tina writes that page into GitHub.
3. GitHub tells Netlify that something changed.
4. Netlify rebuilds the public website from the updated copy.
5. The live page updates. Refresh it if you still see the previous version. This usually takes a minute or two.

A photo uploads to Cloudinary as soon as you add it. The page that uses the photo still waits for the rebuild above.

A visitor's message on the contact form goes to Netlify on its own. It leaves the pages unchanged, and it is available in the Netlify account without waiting for a rebuild. The address and other details on the Contact page are edited under **Contact**. See **Contact, menus, and footer**.
