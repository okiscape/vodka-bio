import Header from "../components/header";
import { UmamiScript } from "../components/umamiScript";
import "../globals.css";
import "./list.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <body>
     <Header/>
     {children}
     <UmamiScript domain={process.env.DOMAIN ?? ''} website_id={process.env.UMAMI_WEBSITE_ID ?? ''} />
    </body>
   </>
  );
}
