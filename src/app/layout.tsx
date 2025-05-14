import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { SolanaProvider } from "@/components/SolanaProvider"; // Adjust path if needed

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Royal Bunker Tourney dApp",
  description:
    "dApp para administración de lotes de fichas en torneos del Royal Bunker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>
             <SolanaProvider>{children}</SolanaProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
