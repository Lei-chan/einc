import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME } from "./lib/config/settings";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "einc",
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/einc-logo.PNG",
        sizes: "324x139",
        type: "image/png",
      },
    ],
  };
}
