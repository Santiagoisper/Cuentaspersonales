import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuentas Personales",
  description: "Dashboard de finanzas personales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


