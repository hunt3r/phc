const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://phandc.net", "SSR": true};
function adminOrigins() {
  const env = Object.assign(__vite_import_meta_env__, { _: process.env._ });
  const raw = env?.PUBLIC_TINA_ADMIN_ORIGIN;
  if (!raw) return null;
  const origins = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return origins.length > 0 ? origins : null;
}

export { adminOrigins as a };
