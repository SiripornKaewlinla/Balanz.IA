"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("Natthawan Phuangmalai");
  const [email, setEmail] = useState("natthawan@gmail.com");
  const [phone, setPhone] = useState("0981482577");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left quick cards */}
      <div className="space-y-4">
        <div className="card">
          <div className="font-bold mb-2">Complete profile</div>
          <div className="h-2 w-full bg-gray-200 rounded">
            <div className="h-2 bg-teal-600 rounded" style={{ width: "26%" }} />
          </div>
          <button className="btn btn-primary w-full mt-3">Verify Identity</button>
        </div>
        <div className="card space-y-2">
          <div>Account Information</div>
          <div>Password</div>
          <div>Payment Methods</div>
          <div>Invite Your Friends</div>
        </div>
      </div>

      {/* Right main form */}
      <div className="lg:col-span-2 card">
        <div className="text-2xl font-extrabold text-teal-700 mb-4">Personal Information</div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex gap-2">
            <button className="btn btn-primary">Upload New Picture</button>
            <button className="btn btn-outline">Delete</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">ชื่อ</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div />
          <div>
            <label className="block text-sm text-gray-600 mb-1">City</label>
            <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">State</label>
            <input value={state} onChange={(e)=>setState(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary w-full">Update</button>
        </div>
      </div>
    </div>
  );
}

