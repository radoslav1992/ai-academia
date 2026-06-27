// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

// AI Академия — Astro приложение, разгърнато като Cloudflare Worker.
// Pages и Workers вече са обединени, затова използваме Workers adapter-а.
export default defineConfig({
  site: "https://ai-akademia.bg",
  // Страниците се пре-рендират статично; API endpoint-ите се маркират
  // с `export const prerender = false` и работят on-demand в Worker-а.
  output: "static",
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "compile",
  }),
  integrations: [sitemap()],
});
