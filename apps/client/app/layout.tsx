import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./_components/theme-provider";

export const metadata: Metadata = {
  title: "TribeNest",
  description: "Your digital presence, simplified.",
  applicationName: "TribeNest",
  manifest: "/api/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TribeNest",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "TribeNest",
    title: "TribeNest",
    description: "Your digital presence, simplified.",
  },
  twitter: {
    card: "summary",
    title: "TribeNest",
    description: "Your digital presence, simplified.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/api/manifest" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
