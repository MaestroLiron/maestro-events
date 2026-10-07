import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import FloatingCallButton from "@/components/FloatingCallButton";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});

export const metadata: Metadata = {
  title: "Maestro Events",
  description: "Maestro Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <FloatingCallButton />
      </body>
    </html>
  );
}