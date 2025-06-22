import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import SidebarLayout from "@/components/sidebar-layout";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.title,
};

export const revalidate = 0;

export default async function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createBrowserClient();
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("public", true);

  return (
    <SidebarLayout notes={notes}>
      <Analytics />
      {children}
    </SidebarLayout>
  );
}
