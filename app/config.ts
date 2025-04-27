import type { Metadata } from "next";

export const siteConfig = {
  title: "QR Menu",
  description: "Modern QR Menu Application",
} as const;

export const metadata: Metadata = {
  ...siteConfig,
}; 