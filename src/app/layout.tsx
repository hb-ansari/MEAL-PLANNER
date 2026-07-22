import type { Metadata } from "next";
import "./globals.css";
import HeaderNavbar from "@/components/HeaderNavbar";

export const metadata: Metadata = {
  title: "Platter.ai — High-End Culinary AI Meal Planning",
  description:
    "Curated seven-day meal plans crafted with high-end culinary precision, tailored to your budget and nutrition goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
          <link rel="icon" href="/favicon.png" />
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;5 00;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased font-sans selection:bg-foreground selection:text-background">
        <HeaderNavbar />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
