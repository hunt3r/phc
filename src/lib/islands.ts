/**
 * Island registry for Tina visual editing.
 *
 * Each entry maps an island name to:
 *   - `fetch`:  a Tina data loader (from `tina-data.ts`),
 *   - `component`: the Astro component re-rendered on every keystroke,
 *   - `wrapper`: the outer element the bridge swaps into (must match the
 *      `wrapper` prop passed to the page-side `<TinaIsland>`),
 *   - `propsFromData`: projects the fetched `QueryResult` onto the component's
 *      props.
 *
 * The single dynamic route `src/pages/tina-island/[name].ts` reads this
 * registry via `experimental_createIslandRoute()`.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type {
  PortfolioQuery,
  TagsQuery,
  AboutQuery,
  PagesQuery,
  HomeQuery,
  StaffQuery,
  SiteQuery,
} from '../../tina/__generated__/types';

import PortfolioBody from '../components/islands/PortfolioBody.astro';
import TagBody from '../components/islands/TagBody.astro';
import TagHero from '../components/islands/TagHero.astro';
import AboutBody from '../components/islands/AboutBody.astro';
import PageBody from '../components/islands/PageBody.astro';
import HomeBody from '../components/islands/HomeBody.astro';
import StaffBody from '../components/islands/StaffBody.astro';
import SiteSettings from '../components/islands/SiteSettings.astro';
import ContentCardsBody from '../components/islands/ContentCardsBody.astro';

import {
  getPortfolio,
  getTag,
  getAbout,
  getPage,
  getHome,
  getStaff,
  getSite,
} from './tina-data';

export const islands: IslandRegistry = {
  portfolio: {
    fetch: (_request, params) => getPortfolio(params.get('slug') ?? ''),
    component: PortfolioBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<PortfolioQuery>).data?.portfolio,
    }),
  },
  tag: {
    fetch: (_request, params) => getTag(params.get('slug') ?? ''),
    component: TagBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<TagsQuery>).data?.tags,
    }),
  },
  // Hero region for the /portfolio and /services landing pages, which render a
  // root tag through a custom HeroPage template.
  tagHero: {
    fetch: (_request, params) => getTag(params.get('slug') ?? ''),
    component: TagHero,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<TagsQuery>).data?.tags,
    }),
  },
  about: {
    fetch: () => getAbout(),
    component: AboutBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<AboutQuery>).data?.about,
    }),
  },
  page: {
    fetch: (_request, params) => getPage(params.get('slug') ?? ''),
    component: PageBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<PagesQuery>).data?.pages,
    }),
  },
  home: {
    fetch: () => getHome(),
    component: HomeBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<HomeQuery>).data?.home,
    }),
  },
  staff: {
    fetch: () => getStaff(),
    component: StaffBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<StaffQuery>).data?.staff,
    }),
  },
  site: {
    fetch: () => getSite(),
    component: SiteSettings,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as QueryResult<SiteQuery>).data?.site,
    }),
  },

  // Content-card regions. Each fetches the same document as its body island but
  // renders only the `contentCards` list (a separate region on the page), so
  // both islands can point at the same Tina form and edit different parts.
  portfolioCards: {
    fetch: (_request, params) => getPortfolio(params.get('slug') ?? ''),
    component: ContentCardsBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      cards: (data as QueryResult<PortfolioQuery>).data?.portfolio?.contentCards,
      sectionId: 'portfolio-card',
      allowFullBleed: true,
    }),
  },
  tagCards: {
    fetch: (_request, params) => getTag(params.get('slug') ?? ''),
    component: ContentCardsBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      cards: (data as QueryResult<TagsQuery>).data?.tags?.contentCards,
      sectionId: 'tag-card',
      // Tag cards always render inside a sidebar column (category, service,
      // and portfolio-index pages), so full-bleed is disabled there.
      allowFullBleed: false,
    }),
  },
  pageCards: {
    fetch: (_request, params) => getPage(params.get('slug') ?? ''),
    component: ContentCardsBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      cards: (data as QueryResult<PagesQuery>).data?.pages?.contentCards,
      sectionId: 'page-card',
      allowFullBleed: true,
    }),
  },
  aboutCards: {
    fetch: () => getAbout(),
    component: ContentCardsBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      cards: (data as QueryResult<AboutQuery>).data?.about?.contentCards,
      sectionId: 'about-card',
      allowFullBleed: true,
    }),
  },
  homeCards: {
    fetch: () => getHome(),
    component: ContentCardsBody,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      cards: (data as QueryResult<HomeQuery>).data?.home?.contentCards,
      sectionId: 'home-card',
      allowFullBleed: true,
    }),
  },
};
