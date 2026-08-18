import { getTranslations } from "next-intl/server";

export async function getMetadataTranslations() {
  return getTranslations("metadata");
}
