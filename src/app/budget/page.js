"use client";
import { useEffect, useMemo, useState } from "react";

export default function BudgetPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const targetYM = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return { y: d.getFullYear(), m: d.getMonth() };
  }, [monthOffset]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const load = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch("http://localhost:5000/api/budgets", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const b = await bRes.json();
        const c = await cRes.json();
        if (bRes.ok) setBudgets(b);
        if (cRes.ok) setCategories(c);
      } catch {}
    };
    load();
  }, []);

  const ymKey = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;
  const currentKey = ymKey(targetYM.y, targetYM.m);
  const monthBudgets = budgets.filter((x) => x.monthKey ? x.monthKey === currentKey : true);

  const saveBudget = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, amount: Number(amount), monthKey: currentKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setBudgets((prev) => [data, ...prev]);
        setOpen(false);
        setCategory("");
        setAmount("");
      } else {
        setError(data.message || "บันทึกงบประมาณไม่สำเร็จ");
      }
    } catch (err) {
      setError("บันทึกงบประมาณไม่สำเร็จ: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header month switch */}
      <div className="card flex items-center justify-between">
        <button onClick={() => setMonthOffset((v) => v - 1)} className="btn btn-outline">◀</button>
        <div className="text-2xl font-extrabold text-gray-800">
          {thaiMonths[targetYM.m]} {targetYM.y + 543}
        </div>
        <button onClick={() => setMonthOffset((v) => v + 1)} className="btn btn-outline">▶</button>
      </div>

      {/* Add button row */}
      <div className="card flex items-center justify-between">
        <div className="font-bold">ตั้งเป้าหมายงบ</div>
        <div className="flex gap-3">
          <button onClick={() => setOpen(true)} className="btn btn-primary">เพิ่มเป้าหมาย</button>
        </div>
      </div>

      {/* List budgets simple */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {monthBudgets.length === 0 ? (
          <div className="card text-gray-500">ยังไม่มีเป้าหมายในเดือนนี้</div>
        ) : (
          monthBudgets.map((b) => (
            <div key={b._id} className="card">
              <div className="text-sm text-gray-500">หมวดหมู่</div>
              <div className="font-semibold">{b.category?.name || "-"}</div>
              <div className="mt-2 text-sm text-gray-500">วงเงิน</div>
              <div className="text-xl font-extrabold text-teal-700">{Number(b.amount || 0).toLocaleString()} บาท</div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md card">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold">เพิ่มเป้าหมาย</div>
              <button onClick={() => setOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">หมวดหมู่</label>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.filter((c)=>c.type==='expense').map((c)=>(
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เดือน</label>
                <div className="h-11 rounded-lg border border-gray-300 px-3 flex items-center">
                  {thaiMonths[targetYM.m]} {targetYM.y + 543}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">วงเงิน (บาท)</label>
                <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
              </div>
              {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={()=>setOpen(false)} className="btn btn-outline">ยกเลิก</button>
                <button onClick={saveBudget} className="btn btn-primary">บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

