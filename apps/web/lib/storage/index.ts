import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Object storage behind a provider interface (CLAUDE.md: external services go behind providers).
 * Dev/test: local disk under STORAGE_DIR (default <repo>/.data/uploads). A cloud provider
 * (SA-region bucket) is added at M8 hosting time without touching callers.
 */
export interface StorageProvider {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

const SAFE_KEY = /^[a-z0-9][a-z0-9/_-]*\.[a-z0-9]+$/i;

function assertKey(key: string) {
  if (!SAFE_KEY.test(key) || key.includes("..")) throw new Error("Invalid storage key");
}

export class LocalDiskStorage implements StorageProvider {
  constructor(private readonly root: string) {}

  private file(key: string) {
    assertKey(key);
    return path.join(this.root, ...key.split("/"));
  }

  async put(key: string, body: Buffer) {
    const f = this.file(key);
    await mkdir(path.dirname(f), { recursive: true });
    await writeFile(f, body);
  }

  async get(key: string) {
    try {
      return await readFile(this.file(key));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  }

  async delete(key: string) {
    await rm(this.file(key), { force: true });
  }
}

let cached: StorageProvider | undefined;

export function getStorage(): StorageProvider {
  if (cached) return cached;
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider !== "local") throw new Error(`Unknown STORAGE_PROVIDER: ${provider}`);
  const root =
    process.env.STORAGE_DIR ?? path.resolve(process.cwd(), "..", "..", ".data", "uploads");
  cached = new LocalDiskStorage(root);
  return cached;
}
