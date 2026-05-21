import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Serif, Noto_Serif_Display } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
});

const notoSerif = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const notoDisplay = Noto_Serif_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Trà Tâm Sen | Thất Trà · An Thần Mỗi Đêm",
  description:
    "Trà Tâm Sen Thượng Hạng – Nghi thức trà đêm, an thần tự nhiên. Tâm sen Bắc Lý tuyển chọn. Thanh toán khi nhận.",
  themeColor: "#141210",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnam.variable} ${notoSerif.variable} ${notoDisplay.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
