"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setTransactions(data || []); else setError(data.message || "โหลดข้อมูลไม่สำเร็จ");
      } catch (err) { setError("โหลดข้อมูลไม่สำเร็จ"); } finally { setLoading(false); }
    };
    load();
  }, []);

  const totalIncome = transactions.filter(t=>t.type==='income').reduce((a,b)=>a+Number(b.amount||0),0);
  const totalExpense = transactions.filter(t=>t.type==='expense').reduce((a,b)=>a+Number(b.amount||0),0);
  const net = totalIncome - totalExpense;
  const recent = [...transactions].sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,5);

  return (
    <div className="space-y-6">
      {/* Top KPI card */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2">
            <div className="text-sm text-gray-500">ยอดคงเหลือ</div>
            <div className="text-5xl font-extrabold text-teal-700">{net.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/transactions/add" className="card hover:shadow-md transition"><div className="text-center">บันทึกธุรกรรม</div></Link>
              <Link href="/budget" className="card hover:shadow-md transition"><div className="text-center">เป้าหมาย</div></Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <svg viewBox="0 0 220 220" className="w-full max-w-[220px] mx-auto">
              <circle cx="110" cy="110" r="90" fill="#f1f5f9" />
              <path d="M110 20 A90 90 0 1 1 109.9 20" stroke="#10b981" strokeWidth="30" fill="none"/>
              <path d="M110 20 A90 90 0 0 1 200 110" stroke="#ef4444" strokeWidth="30" fill="none"/>
              <text x="110" y="120" textAnchor="middle" fontSize="26" fill="#0f766e" fontWeight="700">{net.toLocaleString()}</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Summary small cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-green-500">
          <div className="text-sm text-gray-500">รวมเงินเข้า</div>
          <div className="text-3xl font-extrabold text-green-700">{totalIncome.toLocaleString()}</div>
        </div>
        <div className="card border-l-4 border-red-500">
          <div className="text-sm text-gray-500">รวมเงินออก</div>
          <div className="text-3xl font-extrabold text-red-600">{totalExpense.toLocaleString()}</div>
        </div>
        <div className="card border-l-4 border-teal-500">
          <div className="text-sm text-gray-500">คงเหลือ</div>
          <div className="text-3xl font-extrabold text-teal-700">{net.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent list */}
      <div className="card">
        <div className="font-bold mb-3">ธุรกรรมล่าสุด</div>
        {loading ? (
          <div className="text-gray-500">กำลังโหลด...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : recent.length === 0 ? (
          <div className="text-gray-500">ยังไม่มีรายการ</div>
        ) : (
          <div className="space-y-2">
            {recent.map((t)=> (
              <div key={t._id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type==='income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>฿</div>
                  <div>
                    <div className="font-medium">{t.category?.name || t.description || 'รายการ'}</div>
                    <div className="text-xs text-gray-500">{new Date(t.date).toLocaleString()}</div>
                  </div>
                </div>
                <div className={`font-bold ${t.type==='income' ? 'text-green-700' : 'text-red-600'}`}>{t.type==='income' ? '+' : '-'}{Number(t.amount||0).toLocaleString()} บาท</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating add button on mobile */}
      <Link href="/transactions/add" className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg text-3xl">+</Link>
    </div>
  );
}

