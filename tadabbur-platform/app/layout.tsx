import type { Metadata } from "next";
import { Tajawal, Amiri } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({ 
  subsets: ["arabic"], 
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal"
});

const amiri = Amiri({ 
  subsets: ["arabic"], 
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const metadata: Metadata = {
  title: "منصة تدبَّر | رحلة ذكية لحفظ القرآن",
  description: "المنصة الأولى لتعلم القرآن بالذكاء الاصطناعي ولغة الإشارة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} ${amiri.variable} font-tajawal antialiased`}>
        {children}
      </body>
    </html>
  );
}