import type { Metadata } from "next";
import { Doto, Raleway_Dots } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";

const doto = Doto({
  subsets: ["latin"],
  variable: "--font-doto",
  weight: ["400", "700", "900"],
  display: "swap",
});

const ralewayDots = Raleway_Dots({
  subsets: ["latin"],
  variable: "--font-raleway-dots",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nothing Weather",
  description: "A premium retro-tech weather forecast engine modeled after the Nothing OS design system.",
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
        "h-full",
        "antialiased",
        doto.variable,
        ralewayDots.variable,
        "font-sans"
      )}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 ease-in-out">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LenisProvider>
            {children}
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

