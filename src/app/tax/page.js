"use client";
import { useMemo, useState } from "react";

// คำนวณภาษีอย่างง่าย (ตัวอย่าง): Progressive brackets แบบสมมติ
const BRACKETS = [
  { upTo: 150000, rate: 0 },
  { upTo: 300000, rate: 0.05 },
  { upTo: 500000, rate: 0.1 },
  { upTo: 750000, rate: 0.15 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: Infinity, rate: 0.25 },
];

function calcTax(taxable) {
  let remain = taxable;
  let tax = 0;
  let last = 0;
  for (const b of BRACKETS) {
    const chunk = Math.max(0, Math.min(remain, b.upTo - last));
    tax += chunk * b.rate;
    remain -= chunk;
    last = b.upTo;
    if (remain <= 0) break;
  }
  return tax;
}

export default function TaxPage() {
  const [income, setIncome] = useState("");
  const [deduct, setDeduct] = useState("");
  const [expense, setExpense] = useState("");

  const taxable = useMemo(() => {
    const i = Number(income||0);
    const d = Number(deduct||0);
    const e = Number(expense||0);
    return Math.max(0, i - d - e);
  }, [income, deduct, expense]);

  const tax = useMemo(() => calcTax(taxable), [taxable]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card space-y-5">
        <div className="text-2xl font-extrabold text-center">คำนวณภาษี</div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">จำนวนเงินได้ (บาท)</label>
          <input value={income} onChange={(e)=>setIncome(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">ค่าลดหย่อน (บาท)</label>
          <input value={deduct} onChange={(e)=>setDeduct(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">ค่าใช้จ่าย (บาท)</label>
          <input value={expense} onChange={(e)=>setExpense(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <div className="text-sm text-gray-500">เงินได้สุทธิ</div>
            <div className="text-3xl font-extrabold text-teal-700">{taxable.toLocaleString()}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500">ภาษีประมาณการ</div>
            <div className="text-3xl font-extrabold text-red-600">{tax.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={()=>{setIncome(""); setDeduct(""); setExpense("");}} className="btn btn-outline">ยกเลิก</button>
          <button className="btn btn-primary">คำนวณ</button>
        </div>
      </div>
    </div>
  );
}

