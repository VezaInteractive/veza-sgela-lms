/**
 * pnpm kiosk:create-device --label "Soweto kiosk 1" [--headset QUEST_3] [--id kd_01] [--test]
 * Registers a kiosk device and prints its API key once (only the hash is stored).
 */
import { parseArgs } from "node:util";
import { getDb } from "@sgela/db";
import { createKioskDevice } from "@/lib/kiosk/service";

async function main() {
  const { values } = parseArgs({
    options: {
      label: { type: "string" },
      headset: { type: "string", default: "QUEST_3" },
      id: { type: "string" },
      test: { type: "boolean", default: false },
    },
  });
  if (!values.label) throw new Error("--label is required");
  if (!["QUEST_3", "QUEST_2"].includes(values.headset!))
    throw new Error("--headset must be QUEST_3 or QUEST_2");
  const { device, key } = await createKioskDevice({
    id: values.id,
    label: values.label,
    headsetModel: values.headset,
    env: values.test ? "test" : "live",
  });
  console.info("Device " + device.id + " (" + device.label + ")");
  console.info("API key (shown once, store it on the kiosk): " + key);
  await getDb().$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
