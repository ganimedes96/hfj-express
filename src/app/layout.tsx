import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const PJS = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HFJ Delivery",
  description: "Sistema simples de entregas para facilitar o dia a dia do entregador.",
  openGraph: {
    title: "HFJ Delivery",
    description: "Visualize rotas, cadastre entregas e acompanhe o status de forma prática.",
    url: "https://hfjdelivery.app", // Altere conforme seu domínio
    siteName: "HFJ Delivery",
    images: [
      {
        url: "https://hfjdelivery.app/og-image.png", // Atualize com a imagem real
        width: 1920,
        height: 1080,
      },
    ],
    type: "website",
    locale: "pt-BR",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "HFJ Delivery",
    description: "App de entrega com cadastro de produtos, rotas e controle de status.",
    card: "summary_large_image",
  },
  keywords: [
    "entrega",
    "delivery",
    "app de entregas",
    "logística",
    "controle de entregas",
    "roteirização",
    "HFJ Delivery",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${PJS.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <SpeedInsights />
              {children}
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
