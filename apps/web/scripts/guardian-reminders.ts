/** pnpm --filter @sgela/web job:guardian-reminders: run the guardian.reminders job once. */
import { getDb } from "@sgela/db";
import { runGuardianReminders } from "@/lib/guardian/service";

runGuardianReminders()
  .then(async (r) => {
    console.info("guardian reminders: checked " + r.checked + ", sent " + r.sent);
    await getDb().$disconnect();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
