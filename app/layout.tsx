import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Body text uses the Helvetica/system stack from globals.css; only the mono
// face for numeric telemetry is downloaded.
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenWeather — Precision Weather Console",
  description:
    "Live weather, hourly and 7-day forecasts, precipitation radar, air quality and climate normals for any city.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1c17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        fontMono.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LenisProvider>
            <TooltipProvider delayDuration={150}>
              {children}
            </TooltipProvider>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
