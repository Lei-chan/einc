import type { Metadata } from "next";
import { Sawarabi_Gothic } from "next/font/google";
import "./globals.css";

const sawarabiGothic = Sawarabi_Gothic({
  weight: "400",
});

export const metadata: Metadata = {
  title: "einc -Memorize Vocab App-",
  description: "einc is here for you to remember words and exppressions!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sawarabiGothic.className}>{children}</body>
    </html>
  );
}
