import Header from "../components/header";
import "../globals.css";
import "./list.css"

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
    </body>
   </html>
  );
}
