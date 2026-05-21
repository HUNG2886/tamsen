"use client";

import { useEffect, useState } from "react";
import { LANDING_IMAGES } from "@/lib/images";
import { COMBO_CONFIG, formatVnd, getComboFormLabel, getComboPackageNote } from "@/lib/orders";
import type { ComboId } from "@/lib/types";
import { LandingImage } from "@/components/landing/LandingImage";

export function LandingPage() {
  const [navSolid, setNavSolid] = useState(false);
  const [cd, setCd] = useState({ h: "00", m: "00", s: "00" });
  const [stock, setStock] = useState(47);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const onScroll = () => {
      const threshold = hero ? hero.offsetHeight * 0.45 : 200;
      setNavSolid(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
      setCd({
        h: pad(Math.floor(diff / 3600000)),
        m: pad(Math.floor((diff % 3600000) / 60000)),
        s: pad(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setStock((s) => (s > 12 && Math.random() > 0.72 ? s - 1 : s));
    }, 50000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
  }, []);

  async function handleOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          address: fd.get("address"),
          combo: fd.get("combo"),
          note: fd.get("note") || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi đặt hàng");
      setSuccess(
        `Cảm ơn bạn! Đơn ${data.order_code} đã được ghi nhận. Chúng tôi sẽ gọi xác nhận trong 15 phút. Hotline: 0916 188 330`
      );
      e.currentTarget.reset();
      const sel = e.currentTarget.querySelector(
        'select[name="combo"]'
      ) as HTMLSelectElement;
      if (sel) sel.value = "2";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi đơn");
    } finally {
      setSubmitting(false);
    }
  }

  function syncCombo(val: string) {
    const form = document.getElementById("orderForm") as HTMLFormElement | null;
    const sel = form?.querySelector('select[name="combo"]') as HTMLSelectElement | null;
    if (sel) sel.value = val;
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="page" id="top">
      <nav
        className={`top-nav${navSolid ? " is-solid" : ""}`}
        id="topNav"
        aria-label="Điều hướng"
      >
        <a href="#top" className="nav-logo">
          <span className="nav-seal">心</span>
          <span className="nav-wordmark">Tâm Sen</span>
        </a>
        <a href="#order" className="nav-cta">
          Đặt trà
        </a>
      </nav>

      <section className="wc-section sec-hero" id="hero">
        <div className="hero-bg" aria-hidden="true">
          <LandingImage src={LANDING_IMAGES.hero} alt="Trà Tâm Sen thượng hạng" width={1200} height={1400} fetchPriority="high" />
        </div>
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-body">
          <p className="hero-kicker reveal">Bắc Lý · Ninh Bình · Thượng hạng</p>
          <h1 className="hero-headline reveal">
            <span className="hero-line">Thất trà</span>
            <span className="hero-line hero-line--accent">đêm an</span>
          </h1>
          <p className="hero-lead reveal">
            Tâm sen tuyển tay — một ấm trà cuối ngày để tâm lắng, giấc sâu.
          </p>
          <div className="hero-actions reveal">
            <a href="#order" className="btn btn-gold">
              Đặt hàng ngay
            </a>
            <a href="#ritual" className="btn btn-line">
              Nghi thức pha
            </a>
          </div>
          <ul className="hero-chips reveal" aria-label="Cam kết">
            <li>100% tự nhiên</li>
            <li>Free ship từ 2 hũ</li>
            <li>120g / hũ</li>
          </ul>
        </div>
        <a href="#manifesto" className="hero-scroll" aria-label="Cuộn xuống">
          <span />
        </a>
      </section>

      <section className="wc-section sec-manifesto" id="manifesto">
        <div className="wrap">
          <blockquote className="manifesto-quote reveal">
            <span className="quote-mark">“</span>
            Trà đạo không chỉ là uống — là dừng lại, để tâm trở về với chính mình trước khi đêm buông.
          </blockquote>
          <p className="manifesto-sub reveal">
            Nếu bạn thường trằn trọc, thức khuya hay thức giấc giữa đêm — Trà Tâm Sen được chế biến để đồng hành trong khoảnh khắc tĩnh ấy.
          </p>
        </div>
      </section>

      <section className="wc-section sec-concerns">
        <div className="wrap">
          <header className="sec-head reveal">
            <h2 className="sec-title">
              Khi đêm
              <br />
              <em>không còn trọn vẹn</em>
            </h2>
          </header>
          <ul className="concern-grid">
            {[
              ["Mất ngủ", "Khó vào giấc, hay tỉnh giữa đêm", ""],
              ["Căng thẳng", "Tâm trí bận rộn sau ngày dài", " concern-icon--two"],
              ["Lo âu", "Khó thả lỏng thật sự", " concern-icon--three"],
              ["Ngủ nông", "Dậy mệt, thiếu năng lượng", " concern-icon--four"],
            ].map(([t, d, c]) => (
              <li key={t} className="concern reveal">
                <span className={`concern-icon${c}`} aria-hidden="true" />
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wc-section sec-ritual" id="ritual">
        <div className="wrap">
          <header className="sec-head sec-head--light reveal">
            <h2 className="sec-title sec-title--light">
              Nghi thức
              <br />
              <em>ba ấm</em>
            </h2>
          </header>
          <ol className="ritual-steps">
            {[
              ["沖", "Trần", "Rửa ấm, trần lá 5–8 giây bằng nước sôi để đánh thức hương sen."],
              ["泡", "Hãm", "2–5g tâm sen, nước 90°C, hãm 10–15 phút — không vội vàng."],
              ["品", "Thưởng", "Uống ấm nóng trước ngủ 30–60 phút. Dùng đều 2–4 tuần."],
            ].map(([c, t, p]) => (
              <li key={c} className="ritual-step reveal">
                <span className="step-char">{c}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </li>
            ))}
          </ol>
          <figure className="ritual-visual reveal">
            <LandingImage src={LANDING_IMAGES.ritual} alt="Pha trà tâm sen" width={800} height={600} loading="lazy" />
            <figcaption>Thanh · Hương · Ôn</figcaption>
          </figure>
        </div>
      </section>

      <section className="wc-section sec-benefits">
        <div className="wrap">
          <header className="sec-head reveal">
            <h2 className="sec-title">
              Cảm nhận
              <br />
              <em>từ tuần đầu</em>
            </h2>
          </header>
          <ul className="benefit-pillars">
            {[
              ["眠", "Giấc sâu", "An thần, dễ chìm vào giấc tự nhiên"],
              ["静", "Tâm an", "Giảm bồn chồn sau ngày dài"],
              ["清", "Thanh nhiệt", "Thảo dược thanh lọc nhẹ"],
              ["香", "Hương sen", "Vị dịu, không gắt đắng"],
            ].map(([g, t, p]) => (
              <li key={g} className="pillar reveal">
                <strong>{g}</strong>
                <span>{t}</span>
                <p>{p}</p>
              </li>
            ))}
          </ul>
          <figure className="benefit-photo reveal">
            <LandingImage src={LANDING_IMAGES.product} alt="Tâm sen trong hũ" width={800} height={800} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="wc-section sec-craft" id="craft">
        <div className="craft-panel reveal">
          <div className="wrap">
            <header className="sec-head sec-head--light">
              <h2 className="sec-title sec-title--light">
                Tinh hoa
                <br />
                <em>tâm sen</em>
              </h2>
            </header>
            <dl className="craft-specs">
              {[
                ["Nguồn", "100% tâm sen Bắc Lý, Ninh Bình"],
                ["Chế biến", "Sấy sạch, không hóa chất bảo quản"],
                ["Bao bì", "Hũ thủy tinh, nắp vàng antique"],
                ["Khối lượng", "120g · Hạn dùng 12 tháng"],
                ["Quà tặng", "Phù hợp biếu người trân trọng trà"],
              ].map(([dt, dd]) => (
                <div key={dt}>
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="wrap craft-gallery-wrap">
          <div className="craft-gallery reveal" role="list">
            {[1, 2, 3].map((i) => (
              <figure key={i} role="listitem">
                <LandingImage src={LANDING_IMAGES.gallery[i - 1]} alt="Sản phẩm Trà Tâm Sen" loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="wc-section sec-proof" id="reviews">
        <div className="wrap">
          <header className="sec-head reveal">
            <h2 className="sec-title">
              Lời khách
              <br />
              <em>thưởng trà</em>
            </h2>
          </header>
          <div className="proof-metrics reveal">
            <div>
              <b>2.847+</b>
              <span>đơn giao</span>
            </div>
            <div className="proof-metrics__accent">
              <b>4.9</b>
              <span>điểm TB</span>
            </div>
            <div>
              <b>96%</b>
              <span>mua lại</span>
            </div>
          </div>
          <div className="review-track reveal">
            {[
              ["Uống hai tuần, tôi ngủ sâu hơn hẳn. Trà thơm nhẹ — như một nghi thức tối.", "Chị Lan Anh · Hà Nội"],
              ["Tặng mẹ combo hai hũ. Bà rất thích, uống xong tâm an trước khi ngủ.", "Anh Minh Tuấn · TP.HCM"],
              ["Đóng gói đẹp, hũ sang. Giá xứng đáng — sẽ đặt thêm combo ba hũ.", "Chị Thu Hà · Đà Nẵng"],
            ].map(([body, foot]) => (
              <article key={foot} className="review">
                <p className="review-stars">★★★★★</p>
                <p className="review-body">{body}</p>
                <footer>{foot}</footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wc-section sec-offer" id="offer">
        <div className="wrap">
          <header className="sec-head reveal">
            <h2 className="sec-title">
              Gói thượng hạng
              <br />
              <em>ưu đãi hôm nay</em>
            </h2>
          </header>
          <div className="countdown-bar reveal">
            <span className="countdown-bar__label">Kết thúc sau</span>
            <div className="countdown-bar__time">
              <time>
                <b>{cd.h}</b>
                <small>giờ</small>
              </time>
              <span className="cd-dot">:</span>
              <time>
                <b>{cd.m}</b>
                <small>phút</small>
              </time>
              <span className="cd-dot">:</span>
              <time>
                <b>{cd.s}</b>
                <small>giây</small>
              </time>
            </div>
          </div>
          <ul className="package-list">
            {([1, 2, 3] as ComboId[]).map((combo) => {
              const c = COMBO_CONFIG[combo];
              const v = String(combo);
              const featured = combo === 2;
              const tag =
                combo === 1 ? c.label : combo === 2 ? "Khuyên dùng" : "Ưu đãi nhất";
              const sub =
                combo === 1 ? "Dùng thử" : combo === 2 ? c.label : "3 hũ + tặng 1 hũ";
              const price = formatVnd(c.productPrice);
              const extra =
                c.shippingFee > 0
                  ? `+ ${formatVnd(c.shippingFee)} phí ship`
                  : "Miễn phí ship";
              const note = getComboPackageNote(combo);
              return (
              <li
                key={v}
                className={`package reveal${featured ? " package--featured" : ""}`}
                onClick={() => syncCombo(v)}
                onKeyDown={(e) => e.key === "Enter" && syncCombo(v)}
                role="button"
                tabIndex={0}
              >
                <input
                  type="radio"
                  name="package-preview"
                  id={`pkg${v}`}
                  value={v}
                  defaultChecked={v === "2"}
                  readOnly
                />
                <label htmlFor={`pkg${v}`}>
                  <span className={`package-tag${featured ? " package-tag--gold" : ""}`}>{tag}</span>
                  <span className="package-name">{sub}</span>
                  <span className="package-price">
                    <strong>{price}</strong>
                    <span className="package-price-extra"> · {extra}</span>
                  </span>
                  <span className="package-note">{note}</span>
                </label>
              </li>
              );
            })}
          </ul>
          <p className="stock-line reveal">
            Còn <strong>{stock}</strong> suất ưu đãi trong ngày
          </p>
          <a href="#order" className="btn btn-gold btn-wide reveal">
            Chọn gói &amp; đặt hàng
          </a>
        </div>
      </section>

      <section className="wc-section sec-order" id="order">
        <div className="wrap">
          <header className="sec-head reveal">
            <h2 className="sec-title">
              Thư mời
              <br />
              <em>đặt hàng</em>
            </h2>
            <p className="sec-desc">Giao 24–48h · Thanh toán khi nhận · Kiểm hàng trước</p>
          </header>
          {success && (
            <p className="order-success reveal" role="status">
              {success}
            </p>
          )}
          {error && (
            <p className="order-error reveal" role="alert">
              {error}
            </p>
          )}
          <form className="order-sheet reveal" id="orderForm" onSubmit={handleOrder}>
            <label>
              <span>Họ và tên</span>
              <input type="text" name="name" required autoComplete="name" placeholder="Nguyễn Văn A" />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input type="tel" name="phone" required autoComplete="tel" placeholder="09xx xxx xxx" pattern="[0-9]{9,11}" />
            </label>
            <label>
              <span>Địa chỉ nhận hàng</span>
              <textarea name="address" required rows={2} placeholder="Số nhà, phường/xã, quận/huyện, tỉnh thành" />
            </label>
            <label>
              <span>Chọn gói</span>
              <select name="combo" required defaultValue="2">
                <option value="">— Chọn gói —</option>
                <option value="1">{getComboFormLabel(1)}</option>
                <option value="2">{getComboFormLabel(2)}</option>
                <option value="3">{getComboFormLabel(3)}</option>
              </select>
            </label>
            <label>
              <span>Ghi chú</span>
              <input type="text" name="note" placeholder="Giờ giao, lời nhắn..." />
            </label>
            <button type="submit" className="btn btn-gold btn-wide" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Xác nhận đặt hàng"}
            </button>
            <p className="order-foot">Đổi trả 7 ngày nếu lỗi từ nhà sản xuất</p>
          </form>
        </div>
      </section>

      <section className="wc-section sec-faq" id="faq">
        <div className="wrap">
          <header className="sec-head reveal">
            <h2 className="sec-title">Hỏi đáp</h2>
          </header>
          <div className="faq-stack">
            {[
              ["Uống như thế nào cho hiệu quả?", "2–5g tâm sen, trần rồi hãm 10–15 phút. Uống tối, trước ngủ 30–60 phút, dùng đều 2–4 tuần."],
              ["Trà có vị gì? Có đắng không?", "Vị thanh nhẹ, hương sen tự nhiên — phù hợp cả người mới uống trà."],
              ["Ai không nên dùng?", "Phụ nữ mang thai, trẻ dưới 12 tuổi. Người dùng thuốc kê đơn nên hỏi bác sĩ."],
              ["Giao hàng?", "24–48h nội thành, 2–4 ngày tỉnh. Thanh toán khi nhận, kiểm hàng trước."],
              ["Bao lâu thấy hiệu quả?", "Thư giãn từ tuần đầu. Giấc ngủ cải thiện rõ sau 2–3 tuần dùng đều."],
            ].map(([q, a]) => (
              <details key={q} className="faq reveal">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="wc-section sec-footer">
        <div className="wrap footer-inner">
          <p className="footer-mark">心蓮</p>
          <p className="footer-brand">Trà Tâm Sen</p>
          <p className="footer-place">Tabeyo · Bắc Lý, Ninh Bình</p>
          <p className="footer-tel">
            <a href="tel:0916188330">0916 188 330</a> ·{" "}
            <a href="https://zalo.me/0916188330" target="_blank" rel="noopener noreferrer">
              Zalo
            </a>
          </p>
          <p className="footer-legal">Sản phẩm thực phẩm bảo vệ sức khỏe, không thay thế thuốc chữa bệnh.</p>
        </div>
      </footer>

      <aside className="dock" aria-label="Đặt hàng nhanh">
        <div className="dock-inner">
          <div className="dock-price">
            <small>Từ</small>
            <strong>169.000đ</strong>
          </div>
          <a href="#order" className="btn btn-gold btn-dock">
            Đặt trà
          </a>
          <a href="tel:0916188330" className="dock-icon" aria-label="Gọi điện">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 4h4l2 5-2 2a11 11 0 005 5l2-2 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
            </svg>
          </a>
        </div>
      </aside>
    </div>
  );
}
