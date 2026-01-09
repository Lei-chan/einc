import type { Metadata } from "next";
import { RocknRoll_One } from "next/font/google";
import "./globals.css";

const rockenRollOne = RocknRoll_One({
  weight: "400",
  subsets: ["latin"],
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
      <body className={rockenRollOne.className}>{children}</body>
    </html>
  );
}
