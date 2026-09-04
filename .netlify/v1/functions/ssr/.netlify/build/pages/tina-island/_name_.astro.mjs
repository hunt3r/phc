import { PRIME_HEADER, PREVIEW_CONTENT_TYPE } from '@tinacms/bridge/preview';
import { R as ROUTE_TYPE_HEADER, g as REROUTE_DIRECTIVE_HEADER, D as DEFAULT_404_COMPONENT, A as AstroError, h as ActionNotFoundError, i as cspAlgorithmSchema, j as cspHashSchema, k as allowedDirectivesSchema, l as errorMap, n as createKey, S as SlotString } from '../../chunks/astro/server_DthtwOTf.mjs';
import { prependForwardSlash, removeTrailingForwardSlash, appendForwardSlash, removeLeadingForwardSlash } from '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import colors from 'piccolore';
import 'clsx';
import { D as DEFAULT_404_ROUTE, d as default404Instance } from '../../chunks/astro-designed-error-pages_DfWB2oJt.mjs';
import 'es-module-lexer';
import buffer from 'node:buffer';
import crypto from 'node:crypto';
import path, { posix } from 'node:path';
import 'esbuild';
import { i as idle_prebuilt_default, l as load_prebuilt_default, m as media_prebuilt_default, o as only_prebuilt_default, v as visible_prebuilt_default } from '../../chunks/astro_e8Q_Dv5v.mjs';
import { syntaxHighlightDefaults, markdownConfigDefaults } from '@astrojs/markdown-remark';
import { bundledThemes } from 'shiki';
import { z } from 'zod';
import { fileURLToPath, pathToFileURL } from 'node:url';
import debugPackage from 'debug';
import { N as NOOP_MIDDLEWARE_FN } from '../../chunks/noop-middleware_URwn52kB.mjs';
import { r as requestIs404Or500, i as isRequestServerIsland, n as notFound, a as normalizeTheLocale, b as redirectToFallback, c as redirectToDefaultLocale, d as requestHasLocale, e as defineMiddleware, S as SERVER_ISLAND_COMPONENT, f as SERVER_ISLAND_ROUTE, g as createEndpoint, R as RouteCache, s as sequence, h as findRouteToRewrite, j as RenderContext } from '../../chunks/index_C9HfpW_R.mjs';
import { r as requestStore, f as formsStore, s as sortByPriority, a as renderFormPayloadDiv, e as escapeAttr } from '../../chunks/request-context_DwoCG0Sw.mjs';
import { i as islands } from '../../chunks/islands_BU_NkMTS.mjs';
export { renderers } from '../../renderers.mjs';

function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments.map((segment) => {
    if (segment.length === 1 && segment[0].spread) {
      return "(?:\\/(.*?))?";
    } else {
      return "\\/" + segment.map((part) => {
        if (part.spread) {
          return "(.*?)";
        } else if (part.dynamic) {
          return "([^/]+?)";
        } else {
          return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
      }).join("");
    }
  }).join("");
  const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/") {
    initial = "";
  }
  return new RegExp(`^${pathname || initial}${trailing}`);
}
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") {
    return "\\/$";
  }
  if (addTrailingSlash === "never") {
    return "$";
  }
  return "\\/?$";
}

function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n) return (_, next) => next();
  const payload = {
    ...i18n,
    trailingSlash,
    base,
    format};
  const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
  const _noFoundForNonLocaleRoute = notFound(payload);
  const _requestHasLocale = requestHasLocale(payload.locales);
  const _redirectToFallback = redirectToFallback(payload);
  const prefixAlways = (context, response) => {
    const url = context.url;
    if (url.pathname === base + "/" || url.pathname === base) {
      return _redirectToDefaultLocale(context);
    } else if (!_requestHasLocale(context)) {
      return _noFoundForNonLocaleRoute(context, response);
    }
    return void 0;
  };
  const prefixOtherLocales = (context, response) => {
    let pathnameContainsDefaultLocale = false;
    const url = context.url;
    for (const segment of url.pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  };
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    if (requestIs404Or500(context.request, base)) {
      return response;
    }
    if (isRequestServerIsland(context.request, base)) {
      return response;
    }
    const { currentLocale } = context;
    switch (i18n.strategy) {
      // NOTE: theoretically, we should never hit this code path
      case "manual": {
        return response;
      }
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = _noFoundForNonLocaleRoute(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = _noFoundForNonLocaleRoute(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    return _redirectToFallback(context, response);
  };
}
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}

const NOOP_ACTIONS_MOD = {
  server: {}
};

const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url, isPrerendered } = context;
    if (isPrerendered) {
      return next();
    }
    if (SAFE_METHODS.includes(request.method)) {
      return next();
    }
    const isSameOrigin = request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}

function createDefaultRoutes(manifest) {
  const root = new URL(manifest.hrefRoot);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}

class Pipeline {
  constructor(logger, manifest, runtimeMode, renderers, resolve, serverLike, streaming, adapterName = manifest.adapterName, clientDirectives = manifest.clientDirectives, inlinedScripts = manifest.inlinedScripts, compressHTML = manifest.compressHTML, i18n = manifest.i18n, middleware = manifest.middleware, routeCache = new RouteCache(logger, runtimeMode), site = manifest.site ? new URL(manifest.site) : void 0, defaultRoutes = createDefaultRoutes(manifest), actions = manifest.actions) {
    this.logger = logger;
    this.manifest = manifest;
    this.runtimeMode = runtimeMode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.actions = actions;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual") {
      this.internalMiddleware.push(
        createI18nMiddleware(i18n, manifest.base, manifest.trailingSlash, manifest.buildFormat)
      );
    }
  }
  internalMiddleware;
  resolvedMiddleware = void 0;
  resolvedActions = void 0;
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    } else if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      const internalMiddlewares = [onRequest];
      if (this.manifest.checkOrigin) {
        internalMiddlewares.unshift(createOriginCheckMiddleware());
      }
      this.resolvedMiddleware = sequence(...internalMiddlewares);
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
  setActions(actions) {
    this.resolvedActions = actions;
  }
  async getActions() {
    if (this.resolvedActions) {
      return this.resolvedActions;
    } else if (this.actions) {
      return await this.actions();
    }
    return NOOP_ACTIONS_MOD;
  }
  async getAction(path) {
    const pathKeys = path.split(".").map((key) => decodeURIComponent(key));
    let { server } = await this.getActions();
    if (!server || !(typeof server === "object")) {
      throw new TypeError(
        `Expected \`server\` export in actions file to be an object. Received ${typeof server}.`
      );
    }
    for (const key of pathKeys) {
      if (!(key in server)) {
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join("."))
        });
      }
      server = server[key];
    }
    if (typeof server !== "function") {
      throw new TypeError(
        `Expected handler for action ${pathKeys.join(".")} to be a function. Received ${typeof server}.`
      );
    }
    return server;
  }
}

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug$1(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(colors.bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return colors.red(prefix.join(" "));
  }
  if (level === "warn") {
    return colors.yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return colors.dim(prefix[0]);
  }
  return colors.dim(prefix[0]) + " " + colors.blue(prefix.splice(1).join(" "));
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug$1(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug$1(this.label, message);
  }
}

function createAssetLink(href, base, assetsPrefix, queryParams) {
  let url = "";
  {
    url = href;
  }
  return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
  return new Set(
    stylesheets.map((s) => createStylesheetElement(s))
  );
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src)
    },
    children: ""
  };
}

function apply() {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", {
      value: crypto.webcrypto
    });
  }
  if (!globalThis.File) {
    Object.defineProperty(globalThis, "File", {
      value: buffer.File
    });
  }
}

apply();

function getDefaultClientDirectives() {
  return /* @__PURE__ */ new Map([
    ["idle", idle_prebuilt_default],
    ["load", load_prebuilt_default],
    ["media", media_prebuilt_default],
    ["only", only_prebuilt_default],
    ["visible", visible_prebuilt_default]
  ]);
}

const FONT_TYPES = ["woff2", "woff", "otf", "ttf", "eot"];

const weightSchema = z.union([z.string(), z.number()]);
const styleSchema = z.enum(["normal", "italic", "oblique"]);
const displaySchema = z.enum(["auto", "block", "swap", "fallback", "optional"]);
const familyPropertiesSchema = z.object({
  weight: weightSchema.optional(),
  style: styleSchema.optional(),
  display: displaySchema.optional(),
  stretch: z.string().optional(),
  featureSettings: z.string().optional(),
  variationSettings: z.string().optional(),
  unicodeRange: z.array(z.string()).nonempty().optional()
});
const fallbacksSchema = z.object({
  fallbacks: z.array(z.string()).optional(),
  optimizedFallbacks: z.boolean().optional()
});
const requiredFamilyAttributesSchema = z.object({
  name: z.string(),
  cssVariable: z.string()
});
const _fontProviderSchema = z.object({
  name: z.string(),
  config: z.record(z.string(), z.any()).optional(),
  init: z.custom((v) => typeof v === "function").optional(),
  resolveFont: z.custom((v) => typeof v === "function"),
  listFonts: z.custom((v) => typeof v === "function").optional()
}).strict();
const fontProviderSchema = z.custom((v) => {
  return _fontProviderSchema.safeParse(v).success;
}, "Invalid FontProvider object");
const fontFamilySchema = z.object({
  ...requiredFamilyAttributesSchema.shape,
  ...fallbacksSchema.shape,
  ...familyPropertiesSchema.omit({
    weight: true,
    style: true
  }).shape,
  provider: fontProviderSchema,
  options: z.record(z.string(), z.any()).optional(),
  weights: z.array(weightSchema).nonempty().optional(),
  styles: z.array(styleSchema).nonempty().optional(),
  subsets: z.array(z.string()).nonempty().optional(),
  formats: z.array(z.enum(FONT_TYPES)).nonempty().optional()
}).strict();

const StringSchema = z.object({
  type: z.literal("string"),
  optional: z.boolean().optional(),
  default: z.string().optional(),
  max: z.number().optional(),
  min: z.number().min(0).optional(),
  length: z.number().optional(),
  url: z.boolean().optional(),
  includes: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional()
});
const NumberSchema = z.object({
  type: z.literal("number"),
  optional: z.boolean().optional(),
  default: z.number().optional(),
  gt: z.number().optional(),
  min: z.number().optional(),
  lt: z.number().optional(),
  max: z.number().optional(),
  int: z.boolean().optional()
});
const BooleanSchema = z.object({
  type: z.literal("boolean"),
  optional: z.boolean().optional(),
  default: z.boolean().optional()
});
const EnumSchema = z.object({
  type: z.literal("enum"),
  values: z.array(
    // We use "'" for codegen so it can't be passed here
    z.string().refine((v) => !v.includes("'"), {
      message: `The "'" character can't be used as an enum value`
    })
  ),
  optional: z.boolean().optional(),
  default: z.string().optional()
});
const EnvFieldType = z.union([
  StringSchema,
  NumberSchema,
  BooleanSchema,
  EnumSchema.superRefine((schema, ctx) => {
    if (schema.default) {
      if (!schema.values.includes(schema.default)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The default value "${schema.default}" must be one of the specified values: ${schema.values.join(", ")}.`
        });
      }
    }
  })
]);
const PublicClientEnvFieldMetadata = z.object({
  context: z.literal("client"),
  access: z.literal("public")
});
const PublicServerEnvFieldMetadata = z.object({
  context: z.literal("server"),
  access: z.literal("public")
});
const SecretServerEnvFieldMetadata = z.object({
  context: z.literal("server"),
  access: z.literal("secret")
});
const _EnvFieldMetadata = z.union([
  PublicClientEnvFieldMetadata,
  PublicServerEnvFieldMetadata,
  SecretServerEnvFieldMetadata
]);
const EnvFieldMetadata = z.custom().superRefine((data, ctx) => {
  const result = _EnvFieldMetadata.safeParse(data);
  if (result.success) {
    return;
  }
  for (const issue of result.error.issues) {
    if (issue.code === z.ZodIssueCode.invalid_union) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `**Invalid combination** of "access" and "context" options:
  Secret client variables are not supported. Please review the configuration of \`env.schema.${ctx.path.at(-1)}\`.
  Learn more at https://docs.astro.build/en/guides/environment-variables/#variable-types`,
        path: ["context", "access"]
      });
    } else {
      ctx.addIssue(issue);
    }
  }
});
const EnvSchemaKey = z.string().min(1).refine(([firstChar]) => isNaN(Number.parseInt(firstChar)), {
  message: "A valid variable name cannot start with a number."
}).refine((str) => /^[A-Z0-9_]+$/.test(str), {
  message: "A valid variable name can only contain uppercase letters, numbers and underscores."
});
const EnvSchema = z.record(EnvSchemaKey, z.intersection(EnvFieldMetadata, EnvFieldType));

const ASTRO_CONFIG_DEFAULTS = {
  root: ".",
  srcDir: "./src",
  publicDir: "./public",
  outDir: "./dist",
  cacheDir: "./node_modules/.astro",
  base: "/",
  trailingSlash: "ignore",
  build: {
    format: "directory",
    client: "./client/",
    server: "./server/",
    assets: "_astro",
    serverEntry: "entry.mjs",
    redirects: true,
    inlineStylesheets: "auto",
    concurrency: 1
  },
  image: {
    endpoint: { entrypoint: void 0, route: "/_image" },
    service: { entrypoint: "astro/assets/services/sharp", config: {} },
    responsiveStyles: false
  },
  devToolbar: {
    enabled: true
  },
  compressHTML: true,
  server: {
    host: false,
    port: 4321,
    open: false,
    allowedHosts: []
  },
  integrations: [],
  markdown: markdownConfigDefaults,
  vite: {},
  legacy: {
    collections: false
  },
  redirects: {},
  security: {
    checkOrigin: true,
    allowedDomains: [],
    actionBodySizeLimit: 1024 * 1024
  },
  env: {
    schema: {},
    validateSecrets: false
  },
  session: void 0,
  experimental: {
    clientPrerender: false,
    contentIntellisense: false,
    headingIdCompat: false,
    preserveScriptOrder: false,
    liveContentCollections: false,
    csp: false,
    staticImportMetaEnv: false,
    chromeDevtoolsWorkspace: false,
    failOnPrerenderConflict: false,
    svgo: false
  }
};
const highlighterTypesSchema = z.union([z.literal("shiki"), z.literal("prism")]).default(syntaxHighlightDefaults.type);
const AstroConfigSchema = z.object({
  root: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.root).transform((val) => new URL(val)),
  srcDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.srcDir).transform((val) => new URL(val)),
  publicDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.publicDir).transform((val) => new URL(val)),
  outDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.outDir).transform((val) => new URL(val)),
  cacheDir: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.cacheDir).transform((val) => new URL(val)),
  site: z.string().url().optional(),
  compressHTML: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.compressHTML),
  base: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.base),
  trailingSlash: z.union([z.literal("always"), z.literal("never"), z.literal("ignore")]).optional().default(ASTRO_CONFIG_DEFAULTS.trailingSlash),
  output: z.union([z.literal("static"), z.literal("server"), z.literal("hybrid")]).optional().default("static").refine((val) => val !== "hybrid", {
    message: 'The `output: "hybrid"` option has been removed. Use `output: "static"` (the default) instead, which now behaves the same way.'
  }),
  scopedStyleStrategy: z.union([z.literal("where"), z.literal("class"), z.literal("attribute")]).optional().default("attribute"),
  adapter: z.object({ name: z.string(), hooks: z.object({}).passthrough().default({}) }).optional(),
  integrations: z.preprocess(
    // preprocess
    (val) => Array.isArray(val) ? val.flat(Infinity).filter(Boolean) : val,
    // validate
    z.array(z.object({ name: z.string(), hooks: z.object({}).passthrough().default({}) })).default(ASTRO_CONFIG_DEFAULTS.integrations)
  ),
  build: z.object({
    format: z.union([z.literal("file"), z.literal("directory"), z.literal("preserve")]).optional().default(ASTRO_CONFIG_DEFAULTS.build.format),
    client: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.client).transform((val) => new URL(val)),
    server: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.server).transform((val) => new URL(val)),
    assets: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.assets),
    assetsPrefix: z.string().optional().or(z.object({ fallback: z.string() }).and(z.record(z.string())).optional()),
    serverEntry: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.serverEntry),
    redirects: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.build.redirects),
    inlineStylesheets: z.enum(["always", "auto", "never"]).optional().default(ASTRO_CONFIG_DEFAULTS.build.inlineStylesheets),
    concurrency: z.number().min(1).optional().default(ASTRO_CONFIG_DEFAULTS.build.concurrency)
  }).default({}),
  server: z.preprocess(
    // preprocess
    // NOTE: Uses the "error" command here because this is overwritten by the
    // individualized schema parser with the correct command.
    (val) => typeof val === "function" ? val({ command: "error" }) : val,
    // validate
    z.object({
      open: z.union([z.string(), z.boolean()]).optional().default(ASTRO_CONFIG_DEFAULTS.server.open),
      host: z.union([z.string(), z.boolean()]).optional().default(ASTRO_CONFIG_DEFAULTS.server.host),
      port: z.number().optional().default(ASTRO_CONFIG_DEFAULTS.server.port),
      headers: z.custom().optional(),
      allowedHosts: z.union([z.array(z.string()), z.literal(true)]).optional().default(ASTRO_CONFIG_DEFAULTS.server.allowedHosts)
    }).default({})
  ),
  redirects: z.record(
    z.string(),
    z.union([
      z.string(),
      z.object({
        status: z.union([
          z.literal(300),
          z.literal(301),
          z.literal(302),
          z.literal(303),
          z.literal(304),
          z.literal(307),
          z.literal(308)
        ]),
        destination: z.string()
      })
    ])
  ).default(ASTRO_CONFIG_DEFAULTS.redirects),
  prefetch: z.union([
    z.boolean(),
    z.object({
      prefetchAll: z.boolean().optional(),
      defaultStrategy: z.enum(["tap", "hover", "viewport", "load"]).optional()
    })
  ]).optional(),
  image: z.object({
    endpoint: z.object({
      route: z.literal("/_image").or(z.string()).default(ASTRO_CONFIG_DEFAULTS.image.endpoint.route),
      entrypoint: z.string().optional()
    }).default(ASTRO_CONFIG_DEFAULTS.image.endpoint),
    service: z.object({
      entrypoint: z.union([z.literal("astro/assets/services/sharp"), z.string()]).default(ASTRO_CONFIG_DEFAULTS.image.service.entrypoint),
      config: z.record(z.any()).default({})
    }).default(ASTRO_CONFIG_DEFAULTS.image.service),
    domains: z.array(z.string()).default([]),
    remotePatterns: z.array(
      z.object({
        protocol: z.string().optional(),
        hostname: z.string().optional(),
        port: z.string().optional(),
        pathname: z.string().optional()
      })
    ).default([]),
    layout: z.enum(["constrained", "fixed", "full-width", "none"]).optional(),
    objectFit: z.string().optional(),
    objectPosition: z.string().optional(),
    breakpoints: z.array(z.number()).optional(),
    responsiveStyles: z.boolean().default(ASTRO_CONFIG_DEFAULTS.image.responsiveStyles)
  }).default(ASTRO_CONFIG_DEFAULTS.image),
  devToolbar: z.object({
    enabled: z.boolean().default(ASTRO_CONFIG_DEFAULTS.devToolbar.enabled),
    placement: z.enum(["bottom-left", "bottom-center", "bottom-right"]).optional()
  }).default(ASTRO_CONFIG_DEFAULTS.devToolbar),
  markdown: z.object({
    syntaxHighlight: z.union([
      z.object({
        type: highlighterTypesSchema,
        excludeLangs: z.array(z.string()).optional().default(syntaxHighlightDefaults.excludeLangs)
      }).default(syntaxHighlightDefaults),
      highlighterTypesSchema,
      z.literal(false)
    ]).default(ASTRO_CONFIG_DEFAULTS.markdown.syntaxHighlight),
    shikiConfig: z.object({
      langs: z.custom().array().transform((langs) => {
        for (const lang of langs) {
          if (typeof lang === "object") {
            if (lang.id) {
              lang.name = lang.id;
            }
            if (lang.grammar) {
              Object.assign(lang, lang.grammar);
            }
          }
        }
        return langs;
      }).default([]),
      langAlias: z.record(z.string(), z.string()).optional().default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.langAlias),
      theme: z.enum(Object.keys(bundledThemes)).or(z.custom()).default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.theme),
      themes: z.record(
        z.enum(Object.keys(bundledThemes)).or(z.custom())
      ).default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.themes),
      defaultColor: z.union([z.literal("light"), z.literal("dark"), z.string(), z.literal(false)]).optional(),
      wrap: z.boolean().or(z.null()).default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.wrap),
      transformers: z.custom().array().default(ASTRO_CONFIG_DEFAULTS.markdown.shikiConfig.transformers)
    }).default({}),
    remarkPlugins: z.union([
      z.string(),
      z.tuple([z.string(), z.any()]),
      z.custom((data) => typeof data === "function"),
      z.tuple([z.custom((data) => typeof data === "function"), z.any()])
    ]).array().default(ASTRO_CONFIG_DEFAULTS.markdown.remarkPlugins),
    rehypePlugins: z.union([
      z.string(),
      z.tuple([z.string(), z.any()]),
      z.custom((data) => typeof data === "function"),
      z.tuple([z.custom((data) => typeof data === "function"), z.any()])
    ]).array().default(ASTRO_CONFIG_DEFAULTS.markdown.rehypePlugins),
    remarkRehype: z.custom((data) => data instanceof Object && !Array.isArray(data)).default(ASTRO_CONFIG_DEFAULTS.markdown.remarkRehype),
    gfm: z.boolean().default(ASTRO_CONFIG_DEFAULTS.markdown.gfm),
    smartypants: z.boolean().default(ASTRO_CONFIG_DEFAULTS.markdown.smartypants)
  }).default({}),
  vite: z.custom((data) => data instanceof Object && !Array.isArray(data)).default(ASTRO_CONFIG_DEFAULTS.vite),
  i18n: z.optional(
    z.object({
      defaultLocale: z.string(),
      locales: z.array(
        z.union([
          z.string(),
          z.object({
            path: z.string(),
            codes: z.string().array().nonempty()
          })
        ])
      ),
      domains: z.record(
        z.string(),
        z.string().url(
          "The domain value must be a valid URL, and it has to start with 'https' or 'http'."
        )
      ).optional(),
      fallback: z.record(z.string(), z.string()).optional(),
      routing: z.literal("manual").or(
        z.object({
          prefixDefaultLocale: z.boolean().optional().default(false),
          // TODO: Astro 6.0 change to false
          redirectToDefaultLocale: z.boolean().optional().default(true),
          fallbackType: z.enum(["redirect", "rewrite"]).optional().default("redirect")
        })
      ).optional().default({})
    }).optional()
  ),
  security: z.object({
    checkOrigin: z.boolean().default(ASTRO_CONFIG_DEFAULTS.security.checkOrigin),
    allowedDomains: z.array(
      z.object({
        hostname: z.string().optional(),
        protocol: z.string().optional(),
        port: z.string().optional()
      })
    ).optional().default(ASTRO_CONFIG_DEFAULTS.security.allowedDomains),
    actionBodySizeLimit: z.number().optional().default(ASTRO_CONFIG_DEFAULTS.security.actionBodySizeLimit)
  }).optional().default(ASTRO_CONFIG_DEFAULTS.security),
  env: z.object({
    schema: EnvSchema.optional().default(ASTRO_CONFIG_DEFAULTS.env.schema),
    validateSecrets: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.env.validateSecrets)
  }).strict().optional().default(ASTRO_CONFIG_DEFAULTS.env),
  session: z.object({
    driver: z.string().optional(),
    options: z.record(z.any()).optional(),
    cookie: z.object({
      name: z.string().optional(),
      domain: z.string().optional(),
      path: z.string().optional(),
      maxAge: z.number().optional(),
      sameSite: z.union([z.enum(["strict", "lax", "none"]), z.boolean()]).optional(),
      secure: z.boolean().optional(),
      partitioned: z.boolean().optional()
    }).or(z.string()).transform((val) => {
      if (typeof val === "string") {
        return { name: val };
      }
      return val;
    }).optional(),
    ttl: z.number().optional()
  }).optional(),
  experimental: z.object({
    clientPrerender: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.clientPrerender),
    contentIntellisense: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.contentIntellisense),
    headingIdCompat: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.headingIdCompat),
    preserveScriptOrder: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.preserveScriptOrder),
    fonts: z.array(fontFamilySchema).optional(),
    liveContentCollections: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.liveContentCollections),
    csp: z.union([
      z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.csp),
      z.object({
        algorithm: cspAlgorithmSchema,
        directives: z.array(allowedDirectivesSchema).optional(),
        styleDirective: z.object({
          resources: z.array(z.string()).optional(),
          hashes: z.array(cspHashSchema).optional()
        }).optional(),
        scriptDirective: z.object({
          resources: z.array(z.string()).optional(),
          hashes: z.array(cspHashSchema).optional(),
          strictDynamic: z.boolean().optional()
        }).optional()
      })
    ]).optional().default(ASTRO_CONFIG_DEFAULTS.experimental.csp),
    staticImportMetaEnv: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.staticImportMetaEnv),
    chromeDevtoolsWorkspace: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.chromeDevtoolsWorkspace),
    failOnPrerenderConflict: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.experimental.failOnPrerenderConflict),
    svgo: z.union([z.boolean(), z.custom((value) => value && typeof value === "object")]).optional().default(ASTRO_CONFIG_DEFAULTS.experimental.svgo)
  }).strict(
    `Invalid or outdated experimental feature.
Check for incorrect spelling or outdated Astro version.
See https://docs.astro.build/en/reference/experimental-flags/ for a list of all current experiments.`
  ).default({}),
  legacy: z.object({
    collections: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.legacy.collections)
  }).default({})
});

const AstroConfigRefinedSchema = z.custom().superRefine((config, ctx) => {
  if (config.build.assetsPrefix && typeof config.build.assetsPrefix !== "string" && !config.build.assetsPrefix.fallback) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The `fallback` is mandatory when defining the option as an object.",
      path: ["build", "assetsPrefix"]
    });
  }
  for (let i = 0; i < config.image.remotePatterns.length; i++) {
    const { hostname, pathname } = config.image.remotePatterns[i];
    if (hostname && hostname.includes("*") && !(hostname.startsWith("*.") || hostname.startsWith("**."))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "wildcards can only be placed at the beginning of the hostname",
        path: ["image", "remotePatterns", i, "hostname"]
      });
    }
    if (pathname && pathname.includes("*") && !(pathname.endsWith("/*") || pathname.endsWith("/**"))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "wildcards can only be placed at the end of a pathname",
        path: ["image", "remotePatterns", i, "pathname"]
      });
    }
  }
  if (config.outDir.toString().startsWith(config.publicDir.toString())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The value of `outDir` must not point to a path within the folder set as `publicDir`, this will cause an infinite loop",
      path: ["outDir"]
    });
  }
  if (config.i18n) {
    const { defaultLocale, locales: _locales, fallback, domains } = config.i18n;
    const locales = _locales.map((locale) => {
      if (typeof locale === "string") {
        return locale;
      } else {
        return locale.path;
      }
    });
    if (!locales.includes(defaultLocale)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The default locale \`${defaultLocale}\` is not present in the \`i18n.locales\` array.`,
        path: ["i18n", "locales"]
      });
    }
    if (fallback) {
      for (const [fallbackFrom, fallbackTo] of Object.entries(fallback)) {
        if (!locales.includes(fallbackFrom)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `The locale \`${fallbackFrom}\` key in the \`i18n.fallback\` record doesn't exist in the \`i18n.locales\` array.`,
            path: ["i18n", "fallbacks"]
          });
        }
        if (fallbackFrom === defaultLocale) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `You can't use the default locale as a key. The default locale can only be used as value.`,
            path: ["i18n", "fallbacks"]
          });
        }
        if (!locales.includes(fallbackTo)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `The locale \`${fallbackTo}\` value in the \`i18n.fallback\` record doesn't exist in the \`i18n.locales\` array.`,
            path: ["i18n", "fallbacks"]
          });
        }
      }
    }
    if (domains) {
      const entries = Object.entries(domains);
      const hasDomains = domains ? Object.keys(domains).length > 0 : false;
      if (entries.length > 0 && !hasDomains) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `When specifying some domains, the property \`i18n.routing.strategy\` must be set to \`"domains"\`.`,
          path: ["i18n", "routing", "strategy"]
        });
      }
      if (hasDomains) {
        if (!config.site) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The option `site` isn't set. When using the 'domains' strategy for `i18n`, `site` is required to create absolute URLs for locales that aren't mapped to a domain.",
            path: ["site"]
          });
        }
        if (config.output !== "server") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Domain support is only available when `output` is `"server"`.',
            path: ["output"]
          });
        }
      }
      for (const [domainKey, domainValue] of entries) {
        if (!locales.includes(domainKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `The locale \`${domainKey}\` key in the \`i18n.domains\` record doesn't exist in the \`i18n.locales\` array.`,
            path: ["i18n", "domains"]
          });
        }
        if (!domainValue.startsWith("https") && !domainValue.startsWith("http")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The domain value must be a valid URL, and it has to start with 'https' or 'http'.",
            path: ["i18n", "domains"]
          });
        } else {
          try {
            const domainUrl = new URL(domainValue);
            if (domainUrl.pathname !== "/") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `The URL \`${domainValue}\` must contain only the origin. A subsequent pathname isn't allowed here. Remove \`${domainUrl.pathname}\`.`,
                path: ["i18n", "domains"]
              });
            }
          } catch {
          }
        }
      }
    }
  }
  if (config.experimental.fonts && config.experimental.fonts.length > 0) {
    for (let i = 0; i < config.experimental.fonts.length; i++) {
      const { cssVariable } = config.experimental.fonts[i];
      if (!cssVariable.startsWith("--") || cssVariable.includes(" ") || cssVariable.includes(":")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `**cssVariable** property "${cssVariable}" contains invalid characters for CSS variable generation. It must start with -- and be a valid indent: https://developer.mozilla.org/en-US/docs/Web/CSS/ident.`,
          path: ["fonts", i, "cssVariable"]
        });
      }
    }
  }
});

function resolveDirAsUrl(dir, root) {
  let resolvedDir = path.resolve(root, dir);
  if (!resolvedDir.endsWith(path.sep)) {
    resolvedDir += path.sep;
  }
  return pathToFileURL(resolvedDir);
}
function createRelativeSchema(cmd, fileProtocolRoot) {
  let originalBuildClient;
  let originalBuildServer;
  const AstroConfigRelativeSchema = AstroConfigSchema.extend({
    root: z.string().default(ASTRO_CONFIG_DEFAULTS.root).transform((val) => resolveDirAsUrl(val, fileProtocolRoot)),
    srcDir: z.string().default(ASTRO_CONFIG_DEFAULTS.srcDir).transform((val) => resolveDirAsUrl(val, fileProtocolRoot)),
    compressHTML: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.compressHTML),
    publicDir: z.string().default(ASTRO_CONFIG_DEFAULTS.publicDir).transform((val) => resolveDirAsUrl(val, fileProtocolRoot)),
    outDir: z.string().default(ASTRO_CONFIG_DEFAULTS.outDir).transform((val) => resolveDirAsUrl(val, fileProtocolRoot)),
    cacheDir: z.string().default(ASTRO_CONFIG_DEFAULTS.cacheDir).transform((val) => resolveDirAsUrl(val, fileProtocolRoot)),
    build: z.object({
      format: z.union([z.literal("file"), z.literal("directory"), z.literal("preserve")]).optional().default(ASTRO_CONFIG_DEFAULTS.build.format),
      // NOTE: `client` and `server` are transformed relative to the default outDir first,
      // later we'll fix this to be relative to the actual `outDir`
      client: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.client).transform((val) => {
        originalBuildClient = val;
        return resolveDirAsUrl(
          val,
          path.resolve(fileProtocolRoot, ASTRO_CONFIG_DEFAULTS.outDir)
        );
      }),
      server: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.server).transform((val) => {
        originalBuildServer = val;
        return resolveDirAsUrl(
          val,
          path.resolve(fileProtocolRoot, ASTRO_CONFIG_DEFAULTS.outDir)
        );
      }),
      assets: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.assets),
      assetsPrefix: z.string().optional().or(z.object({ fallback: z.string() }).and(z.record(z.string())).optional()),
      serverEntry: z.string().optional().default(ASTRO_CONFIG_DEFAULTS.build.serverEntry),
      redirects: z.boolean().optional().default(ASTRO_CONFIG_DEFAULTS.build.redirects),
      inlineStylesheets: z.enum(["always", "auto", "never"]).optional().default(ASTRO_CONFIG_DEFAULTS.build.inlineStylesheets),
      concurrency: z.number().min(1).optional().default(ASTRO_CONFIG_DEFAULTS.build.concurrency)
    }).optional().default({}),
    server: z.preprocess(
      // preprocess
      (val) => {
        if (typeof val === "function") {
          return val({ command: "preview" });
        }
        return val;
      },
      // validate
      z.object({
        open: z.union([z.string(), z.boolean()]).optional().default(ASTRO_CONFIG_DEFAULTS.server.open),
        host: z.union([z.string(), z.boolean()]).optional().default(ASTRO_CONFIG_DEFAULTS.server.host),
        port: z.number().optional().default(ASTRO_CONFIG_DEFAULTS.server.port),
        headers: z.custom().optional(),
        streaming: z.boolean().optional().default(true),
        allowedHosts: z.union([z.array(z.string()), z.literal(true)]).optional().default(ASTRO_CONFIG_DEFAULTS.server.allowedHosts)
      }).optional().default({})
    )
  }).transform((config) => {
    if (config.outDir.toString() !== resolveDirAsUrl(ASTRO_CONFIG_DEFAULTS.outDir, fileProtocolRoot).toString()) {
      const outDirPath = fileURLToPath(config.outDir);
      config.build.client = resolveDirAsUrl(originalBuildClient, outDirPath);
      config.build.server = resolveDirAsUrl(originalBuildServer, outDirPath);
    }
    if (config.trailingSlash === "never") {
      config.base = prependForwardSlash(removeTrailingForwardSlash(config.base));
      config.image.endpoint.route = prependForwardSlash(
        removeTrailingForwardSlash(config.image.endpoint.route)
      );
    } else if (config.trailingSlash === "always") {
      config.base = prependForwardSlash(appendForwardSlash(config.base));
      config.image.endpoint.route = prependForwardSlash(
        appendForwardSlash(config.image.endpoint.route)
      );
    } else {
      config.base = prependForwardSlash(config.base);
      config.image.endpoint.route = prependForwardSlash(config.image.endpoint.route);
    }
    return config;
  });
  return AstroConfigRelativeSchema;
}

async function validateConfig(userConfig, root, cmd) {
  const AstroConfigRelativeSchema = createRelativeSchema(cmd, root);
  return await validateConfigRefined(
    await AstroConfigRelativeSchema.parseAsync(userConfig, { errorMap })
  );
}
async function validateConfigRefined(updatedConfig) {
  return await AstroConfigRefinedSchema.parseAsync(updatedConfig, { errorMap });
}

const nodeLogDestination = {
  write(event) {
    let dest = process.stderr;
    if (levels[event.level] < levels["error"]) {
      dest = process.stdout;
    }
    let trailingLine = event.newLine ? "\n" : "";
    if (event.label === "SKIP_FORMAT") {
      dest.write(event.message + trailingLine);
    } else {
      dest.write(getEventPrefix(event) + " " + event.message + trailingLine);
    }
    return true;
  }
};
const debuggers = {};
function debug(type, ...messages) {
  const namespace = `astro:${type}`;
  debuggers[namespace] = debuggers[namespace] || debugPackage(namespace);
  return debuggers[namespace](...messages);
}
globalThis._astroGlobalDebug = debug;

const ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
const ROUTE_SPREAD = /^\.{3}.+$/;
function getParts(part, file) {
  const result = [];
  part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
    if (!str) return;
    const dynamic = i % 2 === 1;
    const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];
    if (!content || dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content)) {
      throw new Error(`Invalid route ${file} \u2014 parameter name must match /^[a-zA-Z0-9_$]+$/`);
    }
    result.push({
      content,
      dynamic,
      spread: dynamic && ROUTE_SPREAD.test(content)
    });
  });
  return result;
}

function validateSegment(segment, file = "") {
  if (!file) file = segment;
  if (segment.includes("][")) {
    throw new Error(`Invalid route ${file} \u2014 parameters must be separated`);
  }
  if (countOccurrences("[", segment) !== countOccurrences("]", segment)) {
    throw new Error(`Invalid route ${file} \u2014 brackets are unbalanced`);
  }
  if ((/.+\[\.\.\.[^\]]+\]/.test(segment) || /\[\.\.\.[^\]]+\].+/.test(segment)) && file.endsWith(".astro")) {
    throw new Error(`Invalid route ${file} \u2014 rest parameter must be a standalone segment`);
  }
}
function countOccurrences(needle, haystack) {
  let count = 0;
  for (const hay of haystack) {
    if (hay === needle) count += 1;
  }
  return count;
}

class ContainerPipeline extends Pipeline {
  /**
   * Internal cache to store components instances by `RouteData`.
   * @private
   */
  #componentsInterner = /* @__PURE__ */ new WeakMap();
  static create({
    logger,
    manifest,
    renderers,
    resolve,
    serverLike,
    streaming
  }) {
    return new ContainerPipeline(
      logger,
      manifest,
      "development",
      renderers,
      resolve,
      serverLike,
      streaming
    );
  }
  componentMetadata(_routeData) {
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base,
      outDir: this.manifest.outDir
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { componentInstance, routeData, newUrl, pathname };
  }
  insertRoute(route, componentInstance) {
    this.#componentsInterner.set(route, {
      page() {
        return Promise.resolve(componentInstance);
      },
      renderers: this.manifest.renderers,
      onRequest: this.resolvedMiddleware
    });
  }
  // At the moment it's not used by the container via any public API
  async getComponentByRoute(routeData) {
    const page = this.#componentsInterner.get(routeData);
    if (page) {
      return page.page();
    }
    throw new Error("Couldn't find component for route " + routeData.pathname);
  }
}

function createManifest(manifest, renderers, middleware) {
  function middlewareInstance() {
    return {
      onRequest: NOOP_MIDDLEWARE_FN
    };
  }
  return {
    hrefRoot: import.meta.url,
    srcDir: manifest?.srcDir ?? ASTRO_CONFIG_DEFAULTS.srcDir,
    buildClientDir: manifest?.buildClientDir ?? ASTRO_CONFIG_DEFAULTS.build.client,
    buildServerDir: manifest?.buildServerDir ?? ASTRO_CONFIG_DEFAULTS.build.server,
    publicDir: manifest?.publicDir ?? ASTRO_CONFIG_DEFAULTS.publicDir,
    outDir: manifest?.outDir ?? ASTRO_CONFIG_DEFAULTS.outDir,
    cacheDir: manifest?.cacheDir ?? ASTRO_CONFIG_DEFAULTS.cacheDir,
    trailingSlash: manifest?.trailingSlash ?? ASTRO_CONFIG_DEFAULTS.trailingSlash,
    buildFormat: manifest?.buildFormat ?? ASTRO_CONFIG_DEFAULTS.build.format,
    compressHTML: manifest?.compressHTML ?? ASTRO_CONFIG_DEFAULTS.compressHTML,
    assets: manifest?.assets ?? /* @__PURE__ */ new Set(),
    assetsPrefix: manifest?.assetsPrefix ?? void 0,
    entryModules: manifest?.entryModules ?? {},
    routes: manifest?.routes ?? [],
    adapterName: "",
    clientDirectives: manifest?.clientDirectives ?? getDefaultClientDirectives(),
    renderers: renderers ?? manifest?.renderers ?? [],
    base: manifest?.base ?? ASTRO_CONFIG_DEFAULTS.base,
    userAssetsBase: manifest?.userAssetsBase ?? "",
    componentMetadata: manifest?.componentMetadata ?? /* @__PURE__ */ new Map(),
    inlinedScripts: manifest?.inlinedScripts ?? /* @__PURE__ */ new Map(),
    i18n: manifest?.i18n,
    checkOrigin: false,
    allowedDomains: manifest?.allowedDomains ?? [],
    actionBodySizeLimit: 1024 * 1024,
    middleware: manifest?.middleware ?? middlewareInstance,
    key: createKey(),
    csp: manifest?.csp
  };
}
class experimental_AstroContainer {
  #pipeline;
  /**
   * Internally used to check if the container was created with a manifest.
   * @private
   */
  #withManifest = false;
  constructor({
    streaming = false,
    manifest,
    renderers,
    resolve,
    astroConfig
  }) {
    this.#pipeline = ContainerPipeline.create({
      logger: new Logger({
        level: "info",
        dest: nodeLogDestination
      }),
      manifest: createManifest(manifest, renderers),
      streaming,
      serverLike: true,
      renderers: renderers ?? manifest?.renderers ?? [],
      resolve: async (specifier) => {
        if (this.#withManifest) {
          return this.#containerResolve(specifier, astroConfig);
        } else if (resolve) {
          return resolve(specifier);
        }
        return specifier;
      }
    });
  }
  async #containerResolve(specifier, astroConfig) {
    const found = this.#pipeline.manifest.entryModules[specifier];
    if (found) {
      return new URL(found, astroConfig?.build.client).toString();
    }
    return found;
  }
  /**
   * Creates a new instance of a container.
   *
   * @param {AstroContainerOptions=} containerOptions
   */
  static async create(containerOptions = {}) {
    const { streaming = false, manifest, renderers = [], resolve } = containerOptions;
    const astroConfig = await validateConfig(ASTRO_CONFIG_DEFAULTS, process.cwd(), "container");
    return new experimental_AstroContainer({
      streaming,
      manifest,
      renderers,
      astroConfig,
      resolve
    });
  }
  /**
   * Use this function to manually add a **server** renderer to the container.
   *
   * This function is preferred when you require to use the container with a renderer in environments such as on-demand pages.
   *
   * ## Example
   *
   * ```js
   * import reactRenderer from "@astrojs/react/server.js";
   * import vueRenderer from "@astrojs/vue/server.js";
   * import customRenderer from "../renderer/customRenderer.js";
   * import { experimental_AstroContainer as AstroContainer } from "astro/container"
   *
   * const container = await AstroContainer.create();
   * container.addServerRenderer(reactRenderer);
   * container.addServerRenderer(vueRenderer);
   * container.addServerRenderer("customRenderer", customRenderer);
   * ```
   *
   * @param options {object}
   * @param options.name The name of the renderer. The name **isn't** arbitrary, and it should match the name of the package.
   * @param options.renderer The server renderer exported by integration.
   */
  addServerRenderer(options) {
    const { renderer } = options;
    if (!renderer.check || !renderer.renderToStaticMarkup) {
      throw new Error(
        "The renderer you passed isn't valid. A renderer is usually an object that exposes the `check` and `renderToStaticMarkup` functions.\nUsually, the renderer is exported by a /server.js entrypoint e.g. `import renderer from '@astrojs/react/server.js'`"
      );
    }
    if (isNamedRenderer(renderer)) {
      this.#pipeline.manifest.renderers.push({
        name: renderer.name,
        ssr: renderer
      });
    } else if ("name" in options) {
      this.#pipeline.manifest.renderers.push({
        name: options.name,
        ssr: renderer
      });
    } else {
      throw new Error(
        "The renderer name must be provided when adding a server renderer that is not a named renderer."
      );
    }
  }
  /**
   * Use this function to manually add a **client** renderer to the container.
   *
   * When rendering components that use the `client:*` directives, you need to use this function.
   *
   * ## Example
   *
   * ```js
   * import reactRenderer from "@astrojs/react/server.js";
   * import { experimental_AstroContainer as AstroContainer } from "astro/container"
   *
   * const container = await AstroContainer.create();
   * container.addServerRenderer(reactRenderer);
   * container.addClientRenderer({
   * 	name: "@astrojs/react",
   * 	entrypoint: "@astrojs/react/client.js"
   * });
   * ```
   *
   * @param options {object}
   * @param options.name The name of the renderer. The name **isn't** arbitrary, and it should match the name of the package.
   * @param options.entrypoint The entrypoint of the client renderer.
   */
  addClientRenderer(options) {
    const { entrypoint, name } = options;
    const rendererIndex = this.#pipeline.manifest.renderers.findIndex((r) => r.name === name);
    if (rendererIndex === -1) {
      throw new Error(
        "You tried to add the " + name + " client renderer, but its server renderer wasn't added. You must add the server renderer first. Use the `addServerRenderer` function."
      );
    }
    const renderer = this.#pipeline.manifest.renderers[rendererIndex];
    renderer.clientEntrypoint = entrypoint;
    this.#pipeline.manifest.renderers[rendererIndex] = renderer;
  }
  // NOTE: we keep this private via TS instead via `#` so it's still available on the surface, so we can play with it.
  // @ts-expect-error @ematipico: I plan to use it for a possible integration that could help people
  static async createFromManifest(manifest) {
    const astroConfig = await validateConfig(ASTRO_CONFIG_DEFAULTS, process.cwd(), "container");
    const container = new experimental_AstroContainer({
      manifest,
      astroConfig
    });
    container.#withManifest = true;
    return container;
  }
  #insertRoute({
    path,
    componentInstance,
    params = {},
    type = "page"
  }) {
    const pathUrl = new URL(path, "https://example.com");
    const routeData = this.#createRoute(pathUrl, params, type);
    this.#pipeline.manifest.routes.push({
      routeData,
      file: "",
      links: [],
      styles: [],
      scripts: []
    });
    this.#pipeline.insertRoute(routeData, componentInstance);
    return routeData;
  }
  /**
   * @description
   * It renders a component and returns the result as a string.
   *
   * ## Example
   *
   * ```js
   * import Card from "../src/components/Card.astro";
   *
   * const container = await AstroContainer.create();
   * const result = await container.renderToString(Card);
   *
   * console.log(result); // it's a string
   * ```
   *
   *
   * @param {AstroComponentFactory} component The instance of the component.
   * @param {ContainerRenderOptions=} options Possible options to pass when rendering the component.
   */
  async renderToString(component, options = {}) {
    if (options.slots) {
      options.slots = markAllSlotsAsSlotString(options.slots);
    }
    const response = await this.renderToResponse(component, options);
    return await response.text();
  }
  /**
   * @description
   * It renders a component and returns the `Response` as result of the rendering phase.
   *
   * ## Example
   *
   * ```js
   * import Card from "../src/components/Card.astro";
   *
   * const container = await AstroContainer.create();
   * const response = await container.renderToResponse(Card);
   *
   * console.log(response.status); // it's a number
   * ```
   *
   *
   * @param {AstroComponentFactory} component The instance of the component.
   * @param {ContainerRenderOptions=} options Possible options to pass when rendering the component.
   */
  async renderToResponse(component, options = {}) {
    const { routeType = "page", slots } = options;
    const request = options?.request ?? new Request("https://example.com/");
    const url = new URL(request.url);
    const componentInstance = routeType === "endpoint" ? component : this.#wrapComponent(component, options.params);
    const routeData = this.#insertRoute({
      path: request.url,
      componentInstance,
      params: options.params,
      type: routeType
    });
    const renderContext = await RenderContext.create({
      pipeline: this.#pipeline,
      routeData,
      status: 200,
      request,
      pathname: url.pathname,
      locals: options?.locals ?? {},
      partial: options?.partial ?? true,
      clientAddress: ""
    });
    if (options.params) {
      renderContext.params = options.params;
    }
    if (options.props) {
      renderContext.props = options.props;
    }
    return renderContext.render(componentInstance, slots);
  }
  /**
   * It stores an Astro **page** route. The first argument, `route`, gets associated to the `component`.
   *
   * This function can be useful when you want to render a route via `AstroContainer.renderToString`, where that
   * route eventually renders another route via `Astro.rewrite`.
   *
   * @param {string} route - The URL that will render the component.
   * @param {AstroComponentFactory} component - The component factory to be used for rendering the route.
   * @param {Record<string, string | undefined>} params - An object containing key-value pairs of route parameters.
   */
  insertPageRoute(route, component, params) {
    const url = new URL(route, "https://example.com/");
    const routeData = this.#createRoute(url, params ?? {}, "page");
    this.#pipeline.manifest.routes.push({
      routeData,
      file: "",
      links: [],
      styles: [],
      scripts: []
    });
    const componentInstance = this.#wrapComponent(component, params);
    this.#pipeline.insertRoute(routeData, componentInstance);
  }
  #createRoute(url, params, type) {
    const segments = removeLeadingForwardSlash(url.pathname).split(posix.sep).filter(Boolean).map((s) => {
      validateSegment(s);
      return getParts(s, url.pathname);
    });
    return {
      route: url.pathname,
      component: "",
      generate(_data) {
        return "";
      },
      params: Object.keys(params),
      pattern: getPattern(
        segments,
        ASTRO_CONFIG_DEFAULTS.base,
        ASTRO_CONFIG_DEFAULTS.trailingSlash
      ),
      prerender: false,
      segments,
      type,
      fallbackRoutes: [],
      isIndex: false,
      origin: "internal"
    };
  }
  /**
   * If the provided component isn't a default export, the function wraps it in an object `{default: Component }` to mimic the default export.
   * @param componentFactory
   * @param params
   * @private
   */
  #wrapComponent(componentFactory, params) {
    if (params) {
      return {
        default: componentFactory,
        getStaticPaths() {
          return [{ params }];
        }
      };
    }
    return { default: componentFactory };
  }
}
function isNamedRenderer(renderer) {
  return !!renderer?.name;
}
function markAllSlotsAsSlotString(slots) {
  const markedSlots = {};
  for (const slotName in slots) {
    markedSlots[slotName] = new SlotString(slots[slotName], null);
  }
  return markedSlots;
}

function experimental_createIslandRoute(islands) {
  return async ({ params, request, url }) => {
    const rejection = rejectIfUnsafe(request);
    if (rejection) return rejection;
    const island = islands[params.name ?? ""];
    if (!island) {
      return new Response(`Unknown island "${params.name}"`, { status: 404 });
    }
    const priming = request.headers.get(PRIME_HEADER) !== null;
    try {
      const forms = [];
      const html = await requestStore.run(
        request,
        () => formsStore.run(forms, async () => {
          const data = await island.fetch(request, url.searchParams);
          const container = await experimental_AstroContainer.create();
          return container.renderToString(island.component, {
            props: island.propsFromData(data, url.searchParams)
          });
        })
      );
      const body = (priming ? renderFormPayloads(forms) : "") + wrapIsland(html, island.wrapper, url);
      return new Response(body, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    } catch {
      return new Response("Island render failed", { status: 500 });
    }
  };
}
function rejectIfUnsafe(request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes(PREVIEW_CONTENT_TYPE)) {
    return new Response("Not Found", { status: 404 });
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
}
function renderFormPayloads(forms) {
  return sortByPriority(forms).map((form) => renderFormPayloadDiv(form, form.priority === "primary")).join("");
}
function wrapIsland(html, wrapper, url) {
  const cls = wrapper.className ? ` class="${escapeAttr(wrapper.className)}"` : "";
  const marker = escapeAttr(`${url.pathname}${url.search}`);
  return `<${wrapper.tag}${cls} data-tina-island="${marker}">${html}</${wrapper.tag}>`;
}

const prerender = false;
const ALL = experimental_createIslandRoute(islands);

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
