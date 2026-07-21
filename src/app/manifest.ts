import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dein Fahrer",
    short_name: "Dein Fahrer",
    description:
      "Persönlicher Fahrservice in Bern und Flughafentransfer Bern–Zürich.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbf5",
    theme_color: "#e8703a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
