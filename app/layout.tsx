import type { Metadata } from "next";
import "./globals.css";
import { ThreeDBackground } from "@/components/three-d-background";

export const metadata: Metadata = {
  title: "Angra BPO Financeiro",
  description: "Painel interno para operacao financeira B2B."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased overflow-x-hidden">
        <ThreeDBackground />
        {children}
      </body>
    </html>
  );
}

