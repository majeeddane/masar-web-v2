import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import Footer from '@/components/Footer';

const thmanyah = localFont({
  src: [
    {
      path: "./fonts/thmanyahsans-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/thmanyahsans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/thmanyahsans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/thmanyahsans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/thmanyahsans-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-thmanyah",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Masar - مسار",
  description: "منصة التوظيف السعودية",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable}>
      <body className={`${thmanyah.className} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-[54px] md:pt-[70px] lg:pt-[80px]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}