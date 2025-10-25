"use client";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      setError("เข้าสู่ระบบไม่สำเร็จ: " + err.message);
    }
  };

  return (
    <section className="min-h-[78vh] rounded-2xl bg-[#111318] text-white shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 p-6 sm:p-10">
        {/* ซ้าย: แบรนด์/ทักทาย */}
        <div className="hidden lg:flex items-center justify-center bg-teal-600/90 rounded-2xl p-10 mr-0 lg:mr-4">
          <div>
            <div className="text-5xl font-extrabold">Balanz.<span className="font-light">IA</span></div>
            <div className="mt-4 text-3xl font-bold">Hello Welcome!</div>
          </div>
        </div>

        {/* ขวา: แบบฟอร์ม */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white text-gray-800 rounded-2xl shadow p-8">
            <div className="-mt-12 mb-6 flex justify-center">
              <img src="/logo.png" alt="Balanz.IA logo" className="app-logo" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-600">อีเมล</label>
                <div className="mt-1 flex items-center border border-teal-400 rounded-lg px-3">
                  <svg className="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 outline-none bg-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">รหัสผ่าน</label>
                <div className="mt-1 flex items-center border border-teal-400 rounded-lg px-3">
                  <svg className="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 8a5 5 0 1110 0v2h1a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h1V8zm8 0a3 3 0 10-6 0v2h6V8z" clipRule="evenodd"/></svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 outline-none bg-transparent"
                    required
                  />
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">ลืมรหัสผ่าน</div>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">{error}</p>
              )}

              <button type="submit" className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                เข้าสู่ระบบ
              </button>

              <p className="text-center text-sm text-gray-600">
                ยังไม่มีบัญชี? <Link href="/register" className="text-teal-600 hover:underline">สมัครสมาชิก</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* แถบล่างช่วยเหลือ */}
      <div className="px-6 pb-6 text-gray-300 text-sm flex items-center gap-6">
        <span>ช่วยเหลือ</span>
        <span>ติดต่อเรา</span>
      </div>
    </section>
  );
}
