/**
 * Provider abstractions (PRD §12.4). Console implementations first; real vendors
 * behind env flags (M8). Full implementations land in M1/M5.
 */
export interface SmsProvider {
  send(toE164: string, text: string): Promise<{ id: string }>;
}

export interface WhatsAppProvider {
  sendTemplate(
    toE164: string,
    templateName:
      "otp_code" | "guardian_consent" | "new_invite" | "application_update" | "deadline_reminder",
    params: Record<string, string>,
  ): Promise<{ id: string }>;
}

export class ConsoleSmsProvider implements SmsProvider {
  async send(toE164: string, text: string) {
    console.info(`[sms:console] to=${toE164} text=${JSON.stringify(text)}`);
    return { id: `console-${Date.now()}` };
  }
}
