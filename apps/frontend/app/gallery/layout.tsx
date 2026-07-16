import { UmamiScript } from "../components/umamiScript";
import Header from "../components/header";
import "../globals.css";

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
