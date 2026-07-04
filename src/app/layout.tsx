import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://agentops-auto.vercel.app"),
  title: "AgentOps - Automating India's Future",
  description: "AgentOps - Automating India's future. We back visionaries and craft ventures that define what comes next.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "AgentOps - Automating India's Future",
    description: "AgentOps - Automating India's future. We back visionaries and craft ventures that define what comes next.",
    url: "https://agentops-auto.vercel.app",
    siteName: "AgentOps",
    images: [
      {
        url: "/og-image.jpg",
        width: 1080,
        height: 1080,
        alt: "AgentOps - Automating India's Future",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentOps - Automating India's Future",
    description: "AgentOps - Automating India's future. We back visionaries and craft ventures.",
    images: ["/og-image.jpg"],
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
