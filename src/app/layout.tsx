import type { Metadata } from "next";
import { Cinzel_Decorative, Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roll for Profile — D&D Character from your X Profile",
  description:
    "Transform your X/Twitter personality into a personalized D&D 5e character sheet using AI.",
  openGraph: {
    title: "Roll for Profile",
    description:
      "Transform your X/Twitter personality into a personalized D&D 5e character sheet.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roll for Profile",
    description:
      "Transform your X/Twitter personality into a personalized D&D 5e character sheet.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzelDecorative.variable} ${cinzel.variable} ${ebGaramond.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
