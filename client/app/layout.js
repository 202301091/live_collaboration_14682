import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});
export const metadata = {
  title: "LiveSpace | Collaborative Real-Time Workspace",
  description: "Experience LiveSpace - a fictional, high-end collaborative workspace. Design together, chat in real-time, draw synchronously, and vote on features with users worldwide.",
  openGraph: {
    title: "LiveSpace | Collaborative Real-Time Workspace",
    description: "Experience LiveSpace - a fictional, high-end collaborative workspace. Design together, chat in real-time, draw synchronously, and vote on features with users worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LiveSpace Collaborative AI Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveSpace | Collaborative Real-Time Workspace",
    description: "Experience LiveSpace - a fictional, high-end collaborative workspace.",
  }
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-slate-950 text-gray-100 min-h-screen antialiased flex flex-col font-sans">
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.05)'
            }
          }} 
        />
      </body>
    </html>
  );
}
