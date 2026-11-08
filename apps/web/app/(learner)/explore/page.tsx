import { getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/placeholder-page";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("explore") };
}

export default function Page() {
  return <PlaceholderPage page="explore" />;
}
