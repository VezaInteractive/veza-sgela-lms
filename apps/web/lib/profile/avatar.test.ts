import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { AvatarRejected, processAvatar } from "./avatar";

async function photo(width: number, height: number, withGps = false) {
  let img = sharp({
    create: { width, height, channels: 3, background: { r: 171, g: 207, b: 55 } },
  }).jpeg();
  if (withGps) {
    img = img.withExif({
      IFD0: { Make: "TestCam", Model: "Phone" },
      IFD3: { GPSLatitudeRef: "S", GPSLatitude: "23/1 54/1 0/1" },
    });
  }
  return img.toBuffer();
}

describe("processAvatar", () => {
  it("re-encodes to a 512 px square WebP with no metadata", async () => {
    const input = await photo(1200, 900, true);
    expect((await sharp(input).metadata()).exif).toBeDefined();
    const out = await processAvatar(input);
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(512);
    expect(meta.height).toBe(512);
    expect(meta.exif).toBeUndefined();
  });

  it("rejects files that are not images", async () => {
    await expect(processAvatar(Buffer.from("<script>alert(1)</script>"))).rejects.toMatchObject({
      code: "NOT_AN_IMAGE",
    });
  });

  it("rejects tiny images", async () => {
    await expect(processAvatar(await photo(32, 32))).rejects.toBeInstanceOf(AvatarRejected);
  });

  it("rejects files over 5 MB before decoding", async () => {
    await expect(processAvatar(Buffer.alloc(5 * 1024 * 1024 + 1))).rejects.toMatchObject({
      code: "TOO_BIG",
    });
  });
});
