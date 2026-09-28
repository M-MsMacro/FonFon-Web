import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fredoka = localFont({
  src: "./fonts/Fredoka-SemiBold.ttf",
  variable: "--font-fredoka",
  weight: "600",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "FonFon", template: "%s · FonFon" },
  description: "FonFon: treino de fala para crianças, com acompanhamento da fonoaudióloga.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1215" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
