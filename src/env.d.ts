/// <reference path="../worker-configuration.d.ts" />

// Тайни, които не са в wrangler.jsonc (задават се с `wrangler secret put`).
interface Env {
  ADMIN_TOKEN?: string;
}

// Astro locals — `runtime.env` се попълва от Cloudflare adapter-а.
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
