import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { getLocale, getTranslations } from "@/lib/i18n/server";
import Providers from "@/components/Providers";
import FloatingChat from "@/components/ui/FloatingChat";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "DOK-RAN | Premium Fashion & Custom Designs",
  description: "Men & Women Fashion Store, Full Manufacturing System.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLocale();
  const translations = await getTranslations();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? cairo.className : inter.className;

  return (
    <html lang={lang} dir={dir}>
      <body className={`${fontClass} min-h-screen flex flex-col pt-16`}>
        <Providers>
          <LanguageProvider lang={lang} translations={translations}>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <FloatingChat />
            <InstallPrompt />
            <footer className="bg-neutral-900 text-white py-8 text-center mt-12">
              <p className="text-sm opacity-70">© {new Date().getFullYear()} {translations["footer.rights"] || "DS Fashion. All rights reserved."}</p>
            </footer>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
