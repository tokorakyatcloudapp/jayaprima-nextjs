import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jaya Prima",
  description: "Sistem Manajemen Jaya Prima",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* eslint-disable @next/next/no-css-tags */}
      <head>
        <link
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          rel="stylesheet"
        />
        <link href="/asset/css/custom.min.css" rel="stylesheet" />
      </head>
      {/* eslint-enable @next/next/no-css-tags */}
      <body>{children}</body>
    </html>
  );
}
