import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentOps - Automating India's Future",
  description: "AgentOps - Automating India's future. We back visionaries and craft ventures.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
