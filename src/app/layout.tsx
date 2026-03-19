import type { Viewport } from "next";
import { Sawarabi_Gothic } from "next/font/google";
import "./globals.css";
// Google OAuth library
import { GoogleOAuthProvider } from "@react-oauth/google";

const sawarabiGothic = Sawarabi_Gothic({
  weight: "400",
});

export const viewport: Viewport = {
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
    <html lang="">
      <body className={sawarabiGothic.className}>
        <GoogleOAuthProvider clientId={process.env.OAUTH_CLIENT_ID || ""}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
