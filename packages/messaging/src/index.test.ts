import { describe, expect, it } from "vitest";
import { ConsoleSmsProvider, ConsoleWhatsAppProvider, devOutbox } from "./index";

describe("console messaging", () => {
  it("records sends in the dev outbox", async () => {
    const before = devOutbox().length;
    await new ConsoleSmsProvider().send("+27821234567", "Your code is 123456");
    await new ConsoleWhatsAppProvider().sendTemplate("+27821234567", "otp_code", { code: "1" });
    const box = devOutbox();
    expect(box.length).toBe(before + 2);
    expect(box.at(-2)).toMatchObject({ channel: "sms", to: "+27821234567" });
    expect(box.at(-1)?.channel).toBe("whatsapp");
  });
});
