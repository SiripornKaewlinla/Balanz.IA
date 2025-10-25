"use client";
import { useEffect, useRef, useState } from "react";
import { Chart, BarElement, CategoryScale, LinearScale, Legend, Tooltip, BarController } from "chart.js";
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Legend, Tooltip);

export default function AnalyticsPage() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState({ income: [], expense: [], labels: [] });
  const [totals, setTotals] = useState({ incomeTotal: 0, expenseTotal: 0, net: 0 });
  const [byCategory, setByCategory] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const load = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          fetch("http://localhost:5000/api/summary", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/transactions?limit=10&page=1", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const sData = await sRes.json();
        const rData = await rRes.json();
        if (sRes.ok) {
          setSummary({ labels: sData.monthly.labels, income: sData.monthly.income, expense: sData.monthly.expense });
          setTotals(sData.totals);
          setByCategory(sData.byCategory || []);
        }
        if (rRes.ok) {
          const items = Array.isArray(rData) ? rData.slice(0, 10) : rData.items || [];
          setRecent(items);
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: summary.labels,
        datasets: [
          { label: 'รายรับ', data: summary.income, backgroundColor: '#10b981' },
          { label: 'รายจ่าย', data: summary.expense, backgroundColor: '#ef4444' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }, [summary]);

  const avgIncome = summary.income.length ? Math.round(summary.income.reduce((a,b)=>a+b,0)/summary.income.length) : 0;
  const avgExpense = summary.expense.length ? Math.round(summary.expense.reduce((a,b)=>a+b,0)/summary.expense.length) : 0;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl p-2 inline-flex gap-2">
        <button onClick={()=>setTab('overview')} className={`px-4 py-1 rounded-lg ${tab==='overview'?'bg-teal-600 text-white':'text-gray-700'}`}>ภาพรวม</button>
        <button onClick={()=>setTab('category')} className={`px-4 py-1 rounded-lg ${tab==='category'?'bg-teal-600 text-white':'text-gray-700'}`}>ตามหมวดหมู่</button>
      </div>

      {/* Chart / Category view */}
      <div className="card">
        {tab==='overview' ? (
          <>
            <div className="flex justify-center pb-2">
              <div className="px-4 py-1 rounded-full bg-teal-600 text-white font-semibold">รายรับ vs รายจ่าย (6 เดือน)</div>
            </div>
            <div className="w-full h-56 md:h-64 lg:h-72">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {byCategory.length === 0 && <div className="text-gray-500">ยังไม่มีข้อมูล</div>}
            {byCategory.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`text-xs px-2 py-0.5 rounded-full ${c.type==='income'?'bg-teal-100 text-teal-700':'bg-red-100 text-red-700'}`}>{c.type==='income'?'รับ':'จ่าย'}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm"><span>{c.name || '-'}</span><span>{Number(c.total||0).toLocaleString()}</span></div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div className={`${c.type==='income'?'bg-teal-500':'bg-red-500'} h-2 rounded`} style={{width: `${Math.min(100, (c.total/ (totals.incomeTotal+totals.expenseTotal || 1))*100)}%`}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">รวมเงินเข้า (บาท)</div>
          <div className="text-3xl font-extrabold text-teal-700">{Number(totals.incomeTotal).toLocaleString()}</div>
          <div className="text-xs text-gray-500">เฉลี่ย/เดือน {Number(avgIncome).toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">รวมเงินออก (บาท)</div>
          <div className="text-3xl font-extrabold text-red-600">{Number(totals.expenseTotal).toLocaleString()}</div>
          <div className="text-xs text-gray-500">เฉลี่ย/เดือน {Number(avgExpense).toLocaleString()}</div>
        </div>
      </div>

      {/* Recent list */}
      <div className="card">
        <div className="font-bold mb-3">ธุรกรรมล่าสุด</div>
        {recent.length === 0 ? (
          <div className="text-gray-500">ยังไม่มีรายการ</div>
        ) : (
          <ul className="divide-y">
            {recent.map(t => (
              <li key={t._id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{new Date(t.date).toLocaleString('th-TH')}</div>
                  <div className="font-medium">{t.category?.name || '-'} {t.notes? `- ${t.notes}`:''}</div>
                </div>
                <div className={t.type==='income'? 'text-teal-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {Number(t.amount).toLocaleString()} บาท
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
