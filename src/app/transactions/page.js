"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AddCategoryModal from "@/components/AddCategoryModal";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [showAddCat, setShowAddCat] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const fetchAll = async () => {
      try {
        const [trRes, catRes] = await Promise.all([
          fetch("http://localhost:5000/api/transactions", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const trData = await trRes.json();
        const catData = await catRes.json();
        if (trRes.ok) setTransactions(Array.isArray(trData) ? trData : []);
        if (catRes.ok) {
          setCategories(catData);
          const first = catData.find((c) => c.type === type);
          if (first) setCategory(first._id);
        }
      } catch (e) {
        // ignore
      } finally {
        setListLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    // change default category when switching type
    const first = categories.find((c) => c.type === type);
    if (first) setCategory(first._id);
  }, [type, categories]);

  const parseThaiDigits = (text = "") => {
    const map = { "๐": "0", "๑": "1", "๒": "2", "๓": "3", "๔": "4", "๕": "5", "๖": "6", "๗": "7", "๘": "8", "๙": "9", ",": "", " ": " " };
    return text.replace(/[๐-๙,]/g, (ch) => map[ch] ?? ch);
  };

  const extractAmount = (text) => {
    const norm = parseThaiDigits(text).replace(/บาท/g, "");
    const match = norm.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
    return match ? match[1] : "";
  };

  const startVoice = () => {
    setError("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("เบราว์เซอร์ไม่รองรับการบันทึกด้วยเสียง");
      return;
    }
    const rec = new SR();
    rec.lang = "th-TH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript || "";
      setNotes((prev) => prev ? prev + " " + text : text);
      const amt = extractAmount(text);
      if (amt) setAmount(amt);
    };
    rec.onerror = (e) => setError(e.error || "เกิดข้อผิดพลาดจากไมโครโฟน");
    rec.onend = () => { recognitionRef.current = null; };
    recognitionRef.current = rec;
    rec.start();
  };

  const scanImage = async (file) => {
    try {
      setError("");
      // Save the chosen file as data URL for upload/preview
      const reader = new FileReader();
      reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : "");
      reader.readAsDataURL(file);
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker({ logger: () => {} });
      await worker.loadLanguage("tha+eng");
      await worker.initialize("tha+eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const text = data.text || "";
      const amt = extractAmount(text);
      if (amt) setAmount(amt);
      setNotes((prev) => (prev ? prev + " " : "") + text.trim());
    } catch (e) {
      setError("สแกนไม่สำเร็จ: " + (e?.message || "ไม่ทราบสาเหตุ"));
    }
  };

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), type, category, date, notes, image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "บันทึกล้มเหลว");
        return;
      }
      // prepend
      setTransactions((prev) => [data, ...prev]);
      setAmount("");
      setNotes("");
      setImage("");
    } catch (e) {
      setError(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.filter((c) => c.type === type);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold">บันทึกธุรกรรม</div>
          <Link href="/transactions/add" className="text-teal-700 hover:underline">โหมดเต็มหน้าจอ</Link>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">จำนวนเงิน</label>
            <input type="number" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} required className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={()=>setType("income")} className={`flex-1 btn ${type==='income'?'btn-primary':'btn-outline'}`}>รายรับ</button>
            <button type="button" onClick={()=>setType("expense")} className={`flex-1 btn ${type==='expense'?'btn-primary':'btn-outline'}`}>รายจ่าย</button>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">หมวดหมู่</label>
            <div className="flex gap-2">
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="flex-1 h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500">
                {catOptions.map((c)=> (
                  <option value={c._id} key={c._id}>{c.name}</option>
                ))}
              </select>
              <button type="button" className="btn btn-outline" onClick={()=>setShowAddCat(true)}>เพิ่มหมวด</button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">วันที่</label>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">บันทึก/รายละเอียด</label>
            <textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"/>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={startVoice} className="btn btn-outline">บันทึกด้วยเสียง</button>
              <label className="btn btn-outline cursor-pointer">
                สแกนใบเสร็จ
                <input type="file" accept="image/*" className="hidden" onChange={(e)=> e.target.files?.[0] && scanImage(e.target.files[0])} />
              </label>
            </div>
            {image && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">รูปภาพที่แนบมา</div>
                <img src={image} alt="แนบ" className="max-h-40 rounded border" />
              </div>
            )}
          </div>

          {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary min-w-24">{saving? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="font-bold mb-4">รายการล่าสุด</div>
        {listLoading ? (
          <div className="text-gray-500">กำลังโหลด...</div>
        ) : (
          <ul className="divide-y">
            {transactions.map((t) => (
              <li key={t._id} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {t.image ? <img src={t.image} alt="img" className="w-12 h-12 object-cover rounded border" /> : null}
                  <div>
                    <div className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</div>
                    <div className="font-medium">{t.category?.name || '-'} {t.notes ? `- ${t.notes}` : ''}</div>
                  </div>
                </div>
                <div className={t.type==='income'? 'text-teal-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {Number(t.amount).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showAddCat && (
        <AddCategoryModal
          type={type}
          onClose={() => setShowAddCat(false)}
          onCreated={(c) => {
            setCategories((prev) => [...prev, c]);
            if (c.type === type) setCategory(c._id);
          }}
        />
      )}
    </div>
  );
}
