import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../components/CartProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Toko Herbal Dayak - Obat Tradisional Kalimantan",
  description: "Obat tradisional turun-temurun khas suku Dayak Kalimantan, dikirim langsung ke rumah Anda. Beragam ramuan herbal asli untuk berbagai khasiat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
