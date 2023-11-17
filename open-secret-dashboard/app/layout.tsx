import { Metadata, Viewport } from "next";

import { Toaster } from "react-hot-toast";

import "@/app/globals.css";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/providers/providers";
import { Header } from "@/components/header";
import Dashboard from "@/components/dashboard";
import { constants } from "@/lib/constants";

const APP_URL = new URL(
  process.env.NEXT_PUBLIC_APP_URL || "https://open-secret.vercel.app"
);

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  metadataBase: APP_URL,
  title: "Open Secret",
  description: "Open Secret AI Avatars with encrypted data on Near",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Open Secret",
    description: "Open Secret AI Avatars with encrypted data on Near",
    url: APP_URL,
    siteName: "Open Secret",
    images: [
      {
        url: APP_URL + "/opengraph-image.png",
        alt: "Open Secret",
        width: 1686,
        height: 882,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "Open Secret",
    description: "Open Secret AI Avatars with encrypted data on Near",
    site: APP_URL.toString(),
    images: [
      {
        url: APP_URL + "/twitter-image.png",
        alt: "Open Secret",
        width: 1686,
        height: 882,
      },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <main className="flex flex-col flex-1 bg-muted/50 relative">
              <Dashboard>{children}</Dashboard>
              <div className="bottom-0 right-0 absolute">
                <div className="p-2 bg-muted/50 bg-black rounded text-white">
                  <p className="text-xs">
                    Contract: {constants.tokenContractAddress}
                  </p>
                  <p className="text-xs">Network: {constants.network}</p>
                </div>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
