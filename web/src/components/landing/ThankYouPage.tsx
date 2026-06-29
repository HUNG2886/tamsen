"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("ma")?.trim() || "";

  return (
    <div className="page thank-page">
      <header className="thank-page__head">
        <Link href="/" className="nav-logo">
          <span className="nav-seal">心</span>
          <span className="nav-wordmark">Tâm Sen</span>
        </Link>
      </header>

      <main className="thank-page__main wrap">
        <p className="thank-page__kicker">感謝 · Cảm ơn quý khách</p>
        <h1 className="thank-page__title">
          Đặt hàng
          <br />
          <em>thành công</em>
        </h1>

        {orderCode ? (
          <p className="thank-page__code" role="status">
            Mã đơn hàng: <strong>{orderCode}</strong>
          </p>
        ) : null}

        <ul className="thank-page__steps">
          <li>
            <strong>Bước 1</strong>
            <span>Chúng tôi gọi xác nhận trong khoảng 15 phút (giờ hành chính).</span>
          </li>
          <li>
            <strong>Bước 2</strong>
            <span>Giao 24–48h · Thanh toán khi nhận · Kiểm hàng trước.</span>
          </li>
          <li>
            <strong>Bước 3</strong>
            <span>Uống tối, trước ngủ 30–60 phút — dùng đều để cảm nhận rõ hơn.</span>
          </li>
        </ul>

        <div className="thank-page__actions">
          <Link href="/" className="btn btn-gold btn-wide">
            Về trang chủ
          </Link>
          <Link href="/#order" className="btn btn-line thank-page__btn-secondary">
            Đặt thêm đơn
          </Link>
        </div>
      </main>

      <footer className="thank-page__foot">
        <p className="footer-legal">
          Sản phẩm thực phẩm bảo vệ sức khỏe, không thay thế thuốc chữa bệnh.
        </p>
      </footer>
    </div>
  );
}
