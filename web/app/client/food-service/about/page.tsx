'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';

import { Bolt, Shield, Heart, Star } from 'lucide-react';


const pillars = [
  {
    icon: <Bolt />,
    title: 'Mục tiêu',
    body: 'Kết nối từng bữa ăn ngon với trải nghiệm giao hàng nhẹ nhàng, an toàn và đúng giờ — để mỗi bữa cơm đều trở thành khoảnh khắc đáng mong chờ.',
    accent: '#FF5A1F',
  },
  {
    icon: <Star />,
    title: 'Tầm nhìn',
    body: 'Trở thành nền tảng giao đồ ăn đáng tin cậy nhất cho mọi quán ăn, mọi gia đình — từ con hẻm nhỏ đến đại lộ sầm uất.',
    accent: '#F59E0B',
  },
  {
    icon: <Shield />,
    title: 'Cam kết',
    body: 'Nhanh chóng, minh bạch và tôn trọng từng trải nghiệm của người dùng. Chúng tôi không ngừng cải thiện để xứng đáng với sự tin tưởng của bạn.',
    accent: '#10B981',
  },
  {
    icon: <Heart />,
    title: 'Tôn chỉ',
    body: 'Con người là trọng tâm — từ tài xế, đối tác nhà hàng cho đến khách hàng. Mỗi quyết định của chúng tôi đều xuất phát từ sự đồng cảm.',
    accent: '#8B5CF6',
  },
];

const stats = [
  { value: '500+', label: 'Nhà hàng đối tác' },
  { value: '1,200+', label: 'Tài xế hoạt động' },
  { value: '50,000+', label: 'Đơn hàng mỗi tháng' },
  { value: '4.8★', label: 'Điểm đánh giá trung bình' },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'FoodDeli — Về chúng tôi';
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --fd-orange: #FF5A1F;
          --fd-amber:  #F59E0B;
          --fd-cream:  #FFFBF5;
          --fd-ink:    #1A0A00;
          --fd-muted:  #6B5E52;
        }

        .fd-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--fd-cream);
          color: var(--fd-ink);
        }

        .fd-hero {
          position: relative;
          overflow: hidden;
          padding: 10rem 1.5rem 6rem;
          text-align: center;
        }
        .fd-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,90,31,.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 90%, rgba(245,158,11,.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .fd-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          background: rgba(255,90,31,.1);
          color: var(--fd-orange);
          font-size: .78rem;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          padding: .35rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(255,90,31,.25);
          margin-bottom: 1.5rem;
        }
        .fd-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.4rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          max-width: 780px;
          margin: 0 auto;
        }
        .fd-hero h1 em {
          font-style: italic;
          color: var(--fd-orange);
        }
        .fd-hero p {
          max-width: 620px;
          margin: 1.5rem auto 0;
          font-size: 1.1rem;
          line-height: 1.75;
          color: var(--fd-muted);
        }
        .fd-divider {
          width: 56px;
          height: 4px;
          background: linear-gradient(90deg, var(--fd-orange), var(--fd-amber));
          border-radius: 2px;
          margin: 2rem auto 0;
        }

        .fd-strip {
          display: flex;
          gap: 0;
          height: 320px;
          overflow: hidden;
        }
        .fd-strip-cell {
          flex: 1;
          position: relative;
          overflow: hidden;
          transition: flex .5s cubic-bezier(.4,0,.2,1);
        }
        .fd-strip-cell:hover { flex: 2; }
        .fd-strip-cell-inner {
          width: 100%; height: 100%;
          display: flex;
          align-items: flex-end;
          padding: 1.5rem;
        }
        .fd-strip-label {
          background: rgba(255,255,255,.92);
          border-radius: 10px;
          padding: .5rem 1rem;
          font-size: .85rem;
          font-weight: 600;
          color: var(--fd-ink);
          opacity: 0;
          transform: translateY(8px);
          transition: .3s ease;
        }
        .fd-strip-cell:hover .fd-strip-label {
          opacity: 1;
          transform: translateY(0);
        }
        .bg-noodles  { background: linear-gradient(145deg,#FF5A1F,#FF8C42); }
        .bg-rice     { background: linear-gradient(145deg,#F59E0B,#FBBF24); }
        .bg-sushi    { background: linear-gradient(145deg,#10B981,#34D399); }
        .bg-dessert  { background: linear-gradient(145deg,#8B5CF6,#A78BFA); }
        .bg-burger   { background: linear-gradient(145deg,#EF4444,#F87171); }

        .fd-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(0,0,0,.08);
          border-radius: 20px;
          overflow: hidden;
          max-width: 860px;
          margin: 5rem auto;
        }
        @media(min-width:640px){
          .fd-stats { grid-template-columns: repeat(4,1fr); }
        }
        .fd-stat {
          background: #fff;
          padding: 2.5rem 1.5rem;
          text-align: center;
        }
        .fd-stat-value {
          font-family: 'Fraunces', serif;
          font-size: 2.4rem;
          font-weight: 900;
          color: var(--fd-orange);
          display: block;
        }
        .fd-stat-label {
          font-size: .82rem;
          color: var(--fd-muted);
          margin-top: .25rem;
          font-weight: 500;
        }

        /* ── PILLARS ── */
        .fd-pillars {
          padding: 0 1.5rem 6rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .fd-section-label {
          font-size: .78rem;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--fd-muted);
          margin-bottom: .75rem;
        }
        .fd-section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 700;
          line-height: 1.2;
          max-width: 500px;
        }
        .fd-pillars-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          margin-top: 2.5rem;
        }
        @media(min-width:640px){.fd-pillars-grid{grid-template-columns:repeat(2,1fr);}}
        @media(min-width:1024px){.fd-pillars-grid{grid-template-columns:repeat(4,1fr);}}
        .fd-pillar {
          background: #fff;
          border-radius: 18px;
          padding: 2rem 1.75rem;
          border: 1px solid rgba(0,0,0,.07);
          position: relative;
          overflow: hidden;
          transition: transform .25s ease, box-shadow .25s ease;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .6s ease, transform .6s ease, box-shadow .25s ease;
        }
        .fd-pillar:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,.1);
        }
        .fd-pillar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--pillar-accent);
        }
        .fd-pillar-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          background: color-mix(in srgb, var(--pillar-accent) 12%, transparent);
          color: var(--pillar-accent);
        }
        .fd-pillar h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: .6rem;
        }
        .fd-pillar p {
          font-size: .9rem;
          line-height: 1.7;
          color: var(--fd-muted);
        }

        /* ── CTA ── */
        .fd-cta {
          margin: 0 1.5rem 6rem;
          max-width: 1100px;
          margin-left: auto;
          margin-right: auto;
          background: var(--fd-ink);
          border-radius: 24px;
          padding: 4rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(32px);
        }
        .fd-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 10% 50%, rgba(255,90,31,.3) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 90% 50%, rgba(245,158,11,.2) 0%, transparent 60%);
        }
        .fd-cta h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.15;
          position: relative;
          z-index: 1;
        }
        .fd-cta p {
          color: rgba(255,255,255,.65);
          max-width: 480px;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }
        .fd-btn {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: linear-gradient(135deg, var(--fd-orange), var(--fd-amber));
          color: #fff;
          font-weight: 600;
          padding: .85rem 2rem;
          border-radius: 999px;
          font-size: 1rem;
          text-decoration: none;
          position: relative;
          z-index: 1;
          box-shadow: 0 8px 24px rgba(255,90,31,.4);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .fd-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255,90,31,.5);
        }

        [data-reveal] {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .65s ease, transform .65s ease;
        }
      `}</style>

      <div className="fd-page min-h-screen">
        <Header />

        <main>
          <section className="fd-hero" ref={heroRef}>
            <h1>
              Chúng tôi đưa hương vị <em>đến tận cửa</em> của bạn
            </h1>

            <p>
              FoodDeli ra đời từ một niềm tin đơn giản: phục vụ khách hàng tận tâm, nhanh chóng,
              đúng giờ
            </p>
            <div className="fd-divider" />
          </section>

          <div className="fd-strip">
            {[
              { cls: 'bg-noodles', label: 'Mì & Phở' },
              { cls: 'bg-rice',    label: 'Cơm tấm' },
              { cls: 'bg-sushi',   label: 'Healthy bowl' },
              { cls: 'bg-dessert', label: 'Tráng miệng' },
              { cls: 'bg-burger',  label: 'Fast food' },
            ].map((s) => (
              <div key={s.cls} className={`fd-strip-cell ${s.cls}`}>
                <div className="fd-strip-cell-inner">
                  <span className="fd-strip-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="fd-stats" data-reveal>
            {stats.map((s) => (
              <div key={s.label} className="fd-stat">
                <span className="fd-stat-value">{s.value}</span>
                <span className="fd-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <section className="fd-pillars">
            <p className="fd-section-label">Triết lý hoạt động</p>
            <h2 className="fd-section-title">Những điều chúng tôi tin tưởng và theo đuổi</h2>
            <div className="fd-pillars-grid">
              {pillars.map((p, i) => (
                <div
                  key={p.title}
                  className="fd-pillar"
                  data-reveal
                  style={{
                    ['--pillar-accent' as string]: p.accent,
                    transitionDelay: `${i * 0.12}s`,
                  }}
                >
                  <div className="fd-pillar-icon">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="fd-cta" data-reveal style={{ marginBottom: '5rem' }}>
            <h2>Sẵn sàng thưởng thức<br />bữa ăn tiếp theo chưa?</h2>
            <p>
              Hàng chục nhà hàng đang chờ đưa món yêu thích của bạn về tận nơi.
              Đặt hàng ngay — miễn phí vận chuyển đơn đầu tiên.
            </p>
            <Link href="/client/food-service" className="fd-btn">
              Khám phá ngay →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}