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
        url: "/icon.png",
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
    images: ["/icon.png"],
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

        {/* ElevenLabs Convai (global floating widget) */}
        <div id="convai-widget-root" data-convai-enabled="true">
          {/* @ts-ignore custom element provided by ElevenLabs */}
          <elevenlabs-convai agent-id="agent_2101kwq62agdegfvrsztcqfwwt0r" />
        </div>
        <script
          src="https://unpkg.com/@elevenlabs/convai-widget-embed"
          async
          type="text/javascript"
        ></script>

        {/* Hide widget on /auth (client-side, no SSR style changes) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var path = window.location && window.location.pathname ? window.location.pathname : '';
                  if (path === '/auth' || path.startsWith('/auth/')) {
                    var root = document.getElementById('convai-widget-root');
                    if (root) root.setAttribute('data-hidden', 'true');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
