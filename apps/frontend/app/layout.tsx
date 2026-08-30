import type { Metadata, Viewport } from 'next'
import Header from "./components/header";
import { UmamiScript } from "./components/umamiScript";
import "./globals.css";

const siteUrl = process.env.DOMAIN ? `https://${process.env.DOMAIN}` : undefined

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: 'okiscape',
  description: 'hello! this is my personal website. i use arch btw',
  icons: { icon: '/face.png' },
  openGraph: {
    title: 'okiscape',
    description: 'hello! this is my personal website. i use arch btw',
    images: [{ url: '/face.png' }],
  },
  twitter: {
    title: 'okiscape',
    description: 'i use arch btw',
  },
}

export const viewport: Viewport = {
  themeColor: '#2d46b1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
    <body>
      <Header/>
      {children}
      <UmamiScript domain={process.env.DOMAIN ?? ''} website_id={process.env.UMAMI_WEBSITE_ID ?? ''} />
    </body>
   </html>
  );
}