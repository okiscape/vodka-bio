import "./globals.css";

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
    <head>
     <title>okiscape</title>
     <link rel="icon" href="/face.png" />
     <meta name="og:image" content="/face.png" />
     <meta name="og:title" content="okiscape" />
     <meta name="og:description" content="i use arch btw" />
     <meta name="og:site_name" content="FUCK YOU!!! sorry" />
     <meta name="theme-color" content="#2d46b1" />

     <meta name="twitter:title" content="okiscape" />
     <meta name="twitter:description" content="i use arch btw" />
    </head>
    {children}
   </html>
  );
}
