/**
 * Provider abstractions (PRD §12.4). Console implementations first; real vendors
 * behind env flags (M8).
 */
export type WhatsAppTemplate =
  | "otp_code"
  | "guardian_consent"
  | "guardian_reminder"
  | "new_invite"
  | "application_update"
  | "deadline_reminder";

export interface SmsProvider {
  send(toE164: string, text: string): Promise<{ id: string }>;
}

/** Email delivery (D-039): login codes and links. Console impl first; real vendor at M8. */
export interface EmailProvider {
  send(to: string, subject: string, text: string): Promise<{ id: string }>;
}

export interface WhatsAppProvider {
  sendTemplate(
    toE164: string,
    templateName: WhatsAppTemplate,
    params: Record<string, string>,
  ): Promise<{ id: string }>;
}

export interface OutboxMessage {
  id: string;
  channel: "sms" | "whatsapp" | "email";
  to: string;
  text: string;
  sentAt: string;
}

const MAX_OUTBOX = 200;
const globalOutbox = globalThis as unknown as { __sgelaOutbox?: OutboxMessage[] };

/**
 * In-process record of console sends so dev tools and e2e tests can read OTPs and links.
 * Only console providers write here; real vendors never do.
 */
export function devOutbox(): OutboxMessage[] {
  globalOutbox.__sgelaOutbox ??= [];
  return globalOutbox.__sgelaOutbox;
}

function record(msg: Omit<OutboxMessage, "id" | "sentAt">): OutboxMessage {
  const box = devOutbox();
  const full = {
    ...msg,
    id: "console-" + Date.now().toString(36) + "-" + box.length,
    sentAt: new Date().toISOString(),
  };
  box.push(full);
  if (box.length > MAX_OUTBOX) box.splice(0, box.length - MAX_OUTBOX);
  return full;
}

export class ConsoleSmsProvider implements SmsProvider {
  async send(toE164: string, text: string) {
    const msg = record({ channel: "sms", to: toE164, text });
    console.info(`[sms:console] to=${toE164} text=${JSON.stringify(text)}`);
    return { id: msg.id };
  }
}

export class ConsoleWhatsAppProvider implements WhatsAppProvider {
  async sendTemplate(
    toE164: string,
    templateName: WhatsAppTemplate,
    params: Record<string, string>,
  ) {
    const text = templateName + " " + JSON.stringify(params);
    const msg = record({ channel: "whatsapp", to: toE164, text });
    console.info(`[whatsapp:console] to=${toE164} template=${templateName}`);
    return { id: msg.id };
  }
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, text: string) {
    const msg = record({ channel: "email", to, text: `${subject}\n${text}` });
    console.info(
      `[email:console] to=${to} subject=${JSON.stringify(subject)} text=${JSON.stringify(text)}`,
    );
    return { id: msg.id };
  }
}

export function getEmailProvider(): EmailProvider {
  const kind = process.env.EMAIL_PROVIDER ?? "console";
  if (kind === "console") return new ConsoleEmailProvider();
  throw new Error(`EMAIL_PROVIDER "${kind}" is not implemented yet (M8)`);
}

export function getSmsProvider(): SmsProvider {
  const kind = process.env.SMS_PROVIDER ?? "console";
  if (kind === "console") return new ConsoleSmsProvider();
  throw new Error(`SMS_PROVIDER "${kind}" is not implemented yet (M8)`);
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const kind = process.env.WHATSAPP_PROVIDER ?? "console";
  if (kind === "console") return new ConsoleWhatsAppProvider();
  throw new Error(`WHATSAPP_PROVIDER "${kind}" is not implemented yet (M8)`);
}

/** Console providers keep an in-memory outbox; true only when no real SMS vendor is configured. */
export function isConsoleMessaging(): boolean {
  return (
    (process.env.SMS_PROVIDER ?? "console") === "console" &&
    (process.env.EMAIL_PROVIDER ?? "console") === "console"
  );
}
