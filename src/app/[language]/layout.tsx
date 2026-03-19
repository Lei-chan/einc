import { Metadata } from "next";
import { Language } from "../lib/config/types/others";
import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "../lib/config/settings";

export function generateMetadata({
  params,
}: {
  params: { language: Language };
}): Metadata {
  const { language } = params;
  const title = language === "en" ? APP_NAME : "einc -単語暗記アプリ-";
  const description =
    language === "en"
      ? APP_DESCRIPTION
      : "eincはあなたが単語や表現をより効率的に覚えるのを手助けします！";
  const image = "/einc-logo.PNG";

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      siteName: title,
      url: BASE_URL,
      images: {
        url: image,
        alt: language === "en" ? "einc logo" : "eincロゴ",
        width: 324,
        height: 139,
      },
      locale: language === "ja" ? "ja_JP" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: {
        url: image,
        alt: language === "en" ? "einc logo" : "eincロゴ",
      },
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
