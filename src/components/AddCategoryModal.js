"use client";
import { useState } from "react";

export default function AddCategoryModal({ type = "expense", onClose, onCreated }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💡");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), icon: icon || "💡", type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "เพิ่มหมวดหมู่ไม่สำเร็จ");
        return;
      }
      onCreated?.(data);
      onClose?.();
    } catch (e) {
      setError(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">เพิ่มหมวดหมู่ใหม่ ({type === 'income' ? 'รายรับ' : 'รายจ่าย'})</div>
          <button className="text-gray-500" onClick={onClose}>ปิด</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">ไอคอน (อิโมจิ)</label>
            <input value={icon} onChange={(e)=>setIcon(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ชื่อหมวดหมู่</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none" />
          </div>
          {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
          <div className="flex justify-end gap-3">
            <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" disabled={saving || !name.trim()} onClick={save}>{saving? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

