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
			<head>
				<title>okiscape: admin</title>
			</head>
    <body>
     <Header/>
     {children}
    </body>
   </html>
  );
}
