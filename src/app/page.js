"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // ถ้ามี token ให้พาไปหน้าแดชบอร์ดทันที
      window.location.href = "/dashboard";
    }
    setHasToken(!!token);
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8">
      <section className="min-h-[78vh] rounded-2xl bg-[#111318] text-white shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 p-8 md:p-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              ยินดีต้อนรับเข้าสู่ Balanz.IA
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              จัดการการเงินของคุณได้อย่างง่ายดายและมีประสิทธิภาพ<br />
              <span className="text-gray-400">Manage your finances easily and efficiently</span>
            </p>

            {!hasToken && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow"
                >
                  เริ่มต้นใช้งาน
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-lg border border-teal-500 text-teal-300 hover:text-white hover:bg-teal-600 font-semibold"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center justify-center">
            <img src="/hero-coin.svg" alt="Finance visualization" className="w-full max-w-[420px]" />
            {/* ภาพประกอบสไตล์กราฟ + เหรียญ */}
            <svg
              viewBox="0 0 420 320"
              className="hidden"
              aria-hidden
            >
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>

              <circle cx="210" cy="160" r="120" fill="#1a1f25" />
              <path d="M210 40 A120 120 0 0 1 330 160" stroke="url(#g1)" strokeWidth="32" fill="none" strokeLinecap="round" />
              <path d="M210 280 A120 120 0 0 1 90 160" stroke="url(#g2)" strokeWidth="32" fill="none" strokeLinecap="round" />

              {/* เหรียญ */}
              <g transform="translate(210,160)">
                <ellipse cx="0" cy="44" rx="58" ry="14" fill="#0d1116" opacity="0.4" />
                <g transform="translate(-36,-24)">
                  <rect x="0" y="0" width="120" height="72" rx="16" fill="#fbbf24" />
                  <ellipse cx="60" cy="0" rx="60" ry="16" fill="#f59e0b" />
                  <ellipse cx="60" cy="72" rx="60" ry="16" fill="#f59e0b" />
                  <text x="60" y="44" textAnchor="middle" fill="#111318" fontWeight="bold" fontSize="28">$</text>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* ฟีเจอร์สรุป */}
        <div className="px-6 md:px-12 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#151920] rounded-xl p-6 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-teal-600/20 text-teal-300 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4h12v4H4zM4 10h8v6H4zM14 10h2v6h-2z" />
                </svg>
              </div>
              <div className="font-semibold text-white">ติดตามธุรกรรม</div>
              <div className="text-sm text-gray-400">บันทึกรายรับรายจ่ายพร้อมสรุปภาพรวม</div>
            </div>

            <div className="bg-[#151920] rounded-xl p-6 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-teal-600/20 text-teal-300 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 12h3v5H3zM8 7h3v10H8zM13 4h3v13h-3z" />
                </svg>
              </div>
              <div className="font-semibold text-white">วิเคราะห์การเงิน</div>
              <div className="text-sm text-gray-400">ดูกราฟและแนวโน้มเพื่อวางแผนงบประมาณ</div>
            </div>

            <div className="bg-[#151920] rounded-xl p-6 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-teal-600/20 text-teal-300 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.7l-.8.8A1 1 0 004 14h12a1 1 0 00.7-1.7l-.7-.7V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="font-semibold text-white">การแจ้งเตือน</div>
              <div className="text-sm text-gray-400">เตือนงบประมาณและการเคลื่อนไหวสำคัญ</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
