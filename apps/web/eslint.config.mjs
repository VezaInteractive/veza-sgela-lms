import base from "@sgela/config/eslint";
import nextVitals from "eslint-config-next/core-web-vitals";

// Next rules first; shared TS config after so the typescript-eslint parser wins.
const config = [
  { ignores: [".next/**", "next-env.d.ts", "playwright-report/**", "test-results/**"] },
  ...nextVitals,
  ...base,
];

export default config;
