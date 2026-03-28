import type { Metadata, Viewport } from "next";
import { Sawarabi_Gothic } from "next/font/google";
import "./globals.css";
// Google OAuth library
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  APP_DESCRIPTION,
  APP_NAME,
  METADATA_BASE,
} from "./lib/config/settings";
import { SerwistProvider } from "./serwist";

const sawarabiGothic = Sawarabi_Gothic({
  weight: "400",
});

const title = {
  default: APP_NAME,
  template: APP_NAME,
};

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title,
  description: APP_DESCRIPTION,
  metadataBase: METADATA_BASE,
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    siteName: APP_NAME,
    url: METADATA_BASE,
    title,
    description: APP_DESCRIPTION,
    type: "website",
    // later
    // images: [{
    //   url: image,
    //   alt: language === "en" ? "einc logo" : "eincロゴ",
    //   width: 324,
    //   height: 139,
    // }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: APP_DESCRIPTION,
    // later
    // images: [image]
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={sawarabiGothic.className}>
        <SerwistProvider swUrl="/serwist/sw.js">
          <GoogleOAuthProvider clientId={process.env.OAUTH_CLIENT_ID || ""}>
            {children}
          </GoogleOAuthProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
