import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import ar from "./dictionaries/ar.json";

export async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value || "en";
}

export async function getTranslations(): Promise<Record<string, string>> {
  const locale = await getLocale();
  return locale === "ar" ? ar : en;
}
