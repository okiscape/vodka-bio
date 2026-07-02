import Header from "../components/header";
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
    </body>
   </>
  );
}
