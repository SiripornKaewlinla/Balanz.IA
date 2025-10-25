"use client";
import { useMemo, useState } from "react";

// อัตราตัวอย่างแบบออฟไลน์เพื่อให้ UI ใช้งานได้ในสภาพแวดล้อมไม่มีเน็ต
const RATES = { THB: 1, USD: 36.5, EUR: 39.0, JPY: 0.25 };
const CURRENCIES = Object.keys(RATES);

export default function CurrencyPage() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("THB");
  const [to, setTo] = useState("USD");
  const result = useMemo(() => {
    const n = parseFloat(String(amount).replace(/,/g, ""));
    if (!n || !RATES[from] || !RATES[to]) return 0;
    // แปลงผ่านค่าเทียบ THB
    const thb = n * (RATES[from] / RATES[from]);
    const out = thb * (RATES[to] / RATES["THB"]);
    return out;
  }, [amount, from, to]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card space-y-5">
        <div className="text-2xl font-extrabold text-center">อัตราแลกเปลี่ยนเงิน</div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">จำนวนเงินต้น</label>
          <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">สกุลเงินต้นทาง</label>
            <select value={from} onChange={(e)=>setFrom(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500">
              {CURRENCIES.map((c)=>(<option key={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">สกุลเงินปลายทาง</label>
            <select value={to} onChange={(e)=>setTo(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500">
              {CURRENCIES.map((c)=>(<option key={c}>{c}</option>))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">จำนวนเงินที่แปลงแล้ว</label>
          <div className="h-11 rounded-lg border border-gray-300 px-3 flex items-center bg-gray-50">
            {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={()=>{setAmount(""); setFrom("THB"); setTo("USD");}} className="btn btn-outline">รีเซ็ต</button>
        </div>
      </div>
    </div>
  );
}

