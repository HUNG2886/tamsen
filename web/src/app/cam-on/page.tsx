import { Suspense } from "react";
import { ThankYouPage } from "@/components/landing/ThankYouPage";
import "@/styles/landing.css";
import "../landing-extra.css";

function ThankYouFallback() {
  return (
    <div className="page thank-page">
      <main className="thank-page__main wrap">
        <p className="thank-page__kicker">Đang tải...</p>
      </main>
    </div>
  );
}

export const metadata = {
  title: "Cảm ơn bạn | Trà Tâm Sen",
  description: "Đơn hàng của bạn đã được ghi nhận. Trà Tâm Sen sẽ liên hệ xác nhận sớm.",
};

export default function CamOnPage() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <ThankYouPage />
    </Suspense>
  );
}
