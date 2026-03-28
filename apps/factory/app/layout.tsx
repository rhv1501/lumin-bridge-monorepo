import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./PWARegister";

export const metadata: Metadata = {
  title: "B2B Marketplace",
  description: "B2B Marketplace",
  manifest: "/manifest.webmanifest",
  applicationName: "B2B Marketplace",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "B2B Marketplace",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
