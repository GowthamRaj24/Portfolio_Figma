import type { Metadata } from "next";
import { inriaSerif, montserrat, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gowtham Raju Manda - Software Engineer",
  description:
    "Portfolio of Gowtham Raju Manda, a software engineer building modern, interactive web experiences. Available for full-time roles and freelance work.",
  keywords: [
    "Gowtham Raju Manda",
    "Software Engineer",
    "Web Developer",
    "Freelance",
    "Portfolio",
    "Next.js",
    "React",
  ],
  authors: [{ name: "Gowtham Raju Manda" }],
  openGraph: {
    title: "Gowtham Raju Manda - Software Engineer",
    description:
      "Portfolio of Gowtham Raju Manda, a software engineer building modern, interactive web experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inriaSerif.variable} ${montserrat.variable} ${inter.variable} antialiased is-loading`}
      >
        {children}
      </body>
    </html>
  );
}
