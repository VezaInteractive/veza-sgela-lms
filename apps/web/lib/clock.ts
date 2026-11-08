/** Injectable clock so time rules (OTP TTL, reminders, claim expiry) are testable with fake time. */
export type Clock = () => Date;
export const systemClock: Clock = () => new Date();
