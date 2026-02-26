import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
// 👇 التعديل هنا: أضفنا الأقواس { } لأن هذا هو سبب الشاشة الحمراء
import { AuthProvider } from "@/providers/AuthProvider";
import Footer from '@/components/Footer';

const font = Cairo({ subsets: ["arabic"] });

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
    <html lang="ar" dir="rtl">
      <body className={font.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}