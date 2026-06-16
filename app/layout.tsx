import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
