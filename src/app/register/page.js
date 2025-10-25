"use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (err) {
      setError("สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <section className="min-h-[78vh] rounded-2xl bg-[#111318] text-white shadow-xl overflow-hidden">
      <div className="py-8 sm:py-10 text-center">
        <div className="flex items-center justify-center mb-2">
          <img src="/logo.png" alt="Balanz.IA" className="app-logo" />
        </div>
        <div className="text-teal-400 font-extrabold text-xl mt-1">สมัครสมาชิก</div>
      </div>

      <div className="px-6 sm:px-10 pb-10 flex justify-center">
        <div className="w-full max-w-xl bg-white text-gray-800 rounded-2xl shadow p-8">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2 mb-4">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600">ชื่อ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold">
              สมัครสมาชิก
            </button>

            <p className="text-center text-sm text-gray-600">
              มีบัญชีอยู่แล้ว? <Link href="/login" className="text-teal-600 hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </form>
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
