import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trend Generator",
  description: "Generate trending meme ideas quickly.",
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
