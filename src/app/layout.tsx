import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/components/providers/ApolloProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moblyze Jobs",
  description: "Find skilled trades and energy sector jobs on Moblyze.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <PostHogProvider>
          <ApolloProvider>
            {children}
          </ApolloProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
