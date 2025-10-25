"use client";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/check-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAlerts(data.alerts || []); else setError(data.message || "โหลดการแจ้งเตือนไม่สำเร็จ");
    } catch (err) {
      setError("โหลดการแจ้งเตือนไม่สำเร็จ");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async () => {
    setResetting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      await load();
    } finally { setResetting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div className="font-bold">การแจ้งเตือน</div>
        <button onClick={markRead} className="btn btn-outline" disabled={resetting}>{resetting?"กำลังรีเซ็ต":"มาร์คอ่านแล้ว"}</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card text-gray-500">กำลังโหลด...</div>
        ) : error ? (
          <div className="card text-red-600">{error}</div>
        ) : alerts.length === 0 ? (
          <div className="card text-gray-500">ยังไม่มีการแจ้งเตือน</div>
        ) : (
          alerts.map((a, idx) => (
            <div key={idx} className="card">
              <div className="text-sm text-gray-500">{a.month}</div>
              <div className="font-semibold">{a.alertMessage || `${a.categoryName} ใช้ไป ${a.percentage}%`}</div>
              <div className="text-sm text-gray-500">วงเงิน: {a.budgetTotal} | ใช้ไป: {a.amountSpent}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

