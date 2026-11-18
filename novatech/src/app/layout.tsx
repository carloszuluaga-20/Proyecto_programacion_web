
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaTech | Inventory Manager",
  description: "Sistema de gestión de inventario y ventas NovaTech",
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
