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
     <link rel="icon" href="/icon.png" />
     <meta name="og:title" content="okiscape" />
     <meta name="og:description" content="hello! this is my personal website" />
     <meta name="theme-color" content="#B1B1B1" />

     <meta name="twitter:title" content="okiscape" />
     <meta name="twitter:description" content="fullstack developer & digital warrior" />
    </head>
    {children}
   </html>
  );
}
