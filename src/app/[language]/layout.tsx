import { Language } from "../lib/config/types/others";
import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "../lib/config/settings";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: Language }>;
}): Promise<Metadata> {
  const { language } = await params;

  const title = language === "en" ? APP_NAME : "einc -単語暗記アプリ-";
  const description =
    language === "en"
      ? APP_DESCRIPTION
      : "eincはあなたが単語や表現をより効率的に覚えるのを手助けします！";
  const metadataBase = new URL(BASE_URL);
  // later
  // const image = new URL("", metadataBase).toString();

  return {
    title,
    description,
    metadataBase,
    keywords: [
      "einc",
      "イーインク",
      "vocabulary",
      "learn",
      "study",
      "memorize",
      "language",
      "language learning",
      "単語",
      "勉強する",
      "学ぶ",
      "暗記",
      "言語",
      "言語学習",
    ],
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      siteName: title,
      url: metadataBase,
      // later
      // images: [{
      //   url: image,
      //   alt: language === "en" ? "einc logo" : "eincロゴ",
      //   width: 324,
      //   height: 139,
      // }],
      locale: language === "ja" ? "ja_JP" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      // later
      // images: [image]
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
