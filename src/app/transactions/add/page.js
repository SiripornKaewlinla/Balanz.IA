"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddCategoryModal from "@/components/AddCategoryModal";

export default function AddTransaction() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const fetchCats = async () => {
      setCatsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setCategories(data);
          const first = data.find((c) => c.type === type) || data[0];
          setCategory(first ? first._id : "");
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      } finally {
        setCatsLoading(false);
      }
    };
    fetchCats();
  }, [type]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), type, category, date, notes, image }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ");
      }
    } catch (err) {
      setError("à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const onPickImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const catOptions = categories.filter((c) => c.type === type);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard" className="text-teal-700 hover:underline">à¸à¸¥à¸±à¸š</Link>
          <div className="font-bold">à¹€à¸žà¸´à¹ˆà¸¡à¸˜à¸¸à¸£à¸à¸£à¸£à¸¡à¹ƒà¸«à¸¡à¹ˆ</div>
          <button onClick={submit} disabled={saving} className="btn btn-primary min-w-24">{saving ? "à¸à¸³à¸¥à¸±à¸‡à¸šà¸±à¸™à¸—à¸¶à¸..." : "à¸šà¸±à¸™à¸—à¸¶à¸"}</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">à¸ˆà¸³à¸™à¸§à¸™à¹€à¸‡à¸´à¸™ (à¸šà¸²à¸—)</label>
            <input type="number" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} required className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={()=>setType("income")} className={`flex-1 btn ${type==='income'?'btn-primary':'btn-outline'}`}>à¸£à¸²à¸¢à¸£à¸±à¸š</button>
            <button type="button" onClick={()=>setType("expense")} className={`flex-1 btn ${type==='expense'?'btn-primary':'btn-outline'}`}>à¸£à¸²à¸¢à¸ˆà¹ˆà¸²à¸¢</button>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ</label>
            <select value={category} onChange={(e)=>setCategory(e.target.value)} disabled={catsLoading || catOptions.length===0} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500">
              {catsLoading && <option>à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...</option>}
              {!catsLoading && catOptions.length === 0 && <option value="">à¹„à¸¡à¹ˆà¸¡à¸µà¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ</option>}
              {catOptions.map((c)=> (
                <option value={c._id} key={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="mt-2">
              <button type="button" className="btn btn-outline" onClick={()=>setShowAddCat(true)}>เพิ่มหมวด</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">à¸§à¸±à¸™à¸—à¸µà¹ˆ</label>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">à¸šà¸±à¸™à¸—à¸¶à¸/à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”</label>
            <textarea rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div className="mt-2">
            <label className="btn btn-outline cursor-pointer">
              แนบรูปภาพ
              <input type="file" accept="image/*" className="hidden" onChange={(e)=> onPickImage(e.target.files?.[0])} />
            </label>
            {image && (
              <div className="mt-3">
                <img src={image} alt="แนบ" className="max-h-40 rounded border" />
              </div>
            )}
          </div>
          {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
        </form>
      </div>
      {showAddCat && (
        <AddCategoryModal
          type={type}
          onClose={()=>setShowAddCat(false)}
          onCreated={(c)=>{
            setCategories(prev=>[...prev, c]);
            if(c.type===type){ setCategory(c._id); }
          }}
        />
      )}
    </div>
  );
}
