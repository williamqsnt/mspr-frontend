import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { IsAuthProvider } from "@/lib/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arosaje",
  description: "Arosaje est une application de gardiennage de plantes. Elle permet de trouver des personnes pour s'occuper de vos plantes pendant vos absences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Providers>
          <IsAuthProvider>{children}</IsAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
