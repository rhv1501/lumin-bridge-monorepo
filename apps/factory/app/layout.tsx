import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./PWARegister";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "luminbridge",
  description: "luminbridge",
  manifest: "/manifest.webmanifest",
  applicationName: "luminbridge",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "luminbridge",
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
