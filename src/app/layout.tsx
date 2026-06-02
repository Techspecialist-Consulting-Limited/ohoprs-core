import type { Metadata } from "next";
import { Jost } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "National Benefits Administration Platform",
  description: "Enterprise multi-tenant government benefits administration prototype.",
};

const themeInitializationScript = `
(() => {
  try {
    const stored = localStorage.getItem("theme-store");
    const parsed = stored ? JSON.parse(stored) : null;
    const theme = parsed?.state?.theme ?? "system";
    const resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch {
    const fallback = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = fallback;
    document.documentElement.style.colorScheme = fallback;
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jost.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
