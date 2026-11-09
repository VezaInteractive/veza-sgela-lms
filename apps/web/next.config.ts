import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sgela/ui",
    "@sgela/analytics",
    "@sgela/geo",
    "@sgela/contracts",
    "@sgela/matching",
    "@sgela/messaging",
    "@sgela/three",
  ],
  serverExternalPackages: ["pino", "@prisma/client", "@sgela/db", "pg"],
  poweredByHeader: false,
  // Profile photo uploads (D-025) are capped at 5 MB in code; leave headroom for form overhead.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default withNextIntl(nextConfig);
