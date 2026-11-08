import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

export * from "./generated/prisma/client";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as { __sgelaPrisma?: PrismaClient };

/** Lazily-created singleton (survives Next.js dev HMR). */
export function getDb(): PrismaClient {
  globalForPrisma.__sgelaPrisma ??= createClient();
  return globalForPrisma.__sgelaPrisma;
}
