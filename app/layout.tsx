import type { Metadata } from "next";
import { Bebas_Neue, Oxanium } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "The Orange Mate",
  description: "Connect with solo travelers, share experiences, and split costs on your next adventure",
};

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ colorScheme: 'light dark' }}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${bebasNeue.variable} ${oxanium.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
