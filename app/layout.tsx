import type { Metadata } from "next";
import React from "react";
import "../css/styles.css";

export const metadata: Metadata = {
  title: "Spotless&Sorted",
  description:
    "Professional cleaning and personal shopping services in Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}