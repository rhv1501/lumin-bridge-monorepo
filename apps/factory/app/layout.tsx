import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./PWARegister";
import { ThemeProvider } from "./components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PWARegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
