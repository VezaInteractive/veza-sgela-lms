import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sgela/ui", "@sgela/analytics", "@sgela/geo"],
  serverExternalPackages: ["pino", "@prisma/client", "@sgela/db", "pg"],
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
