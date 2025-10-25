"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const isAppPage = !["/", "/login", "/register"].includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) fetchNoti(token);
  }, [pathname]);

  const fetchNoti = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/check-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data.alertCount || 0);
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const NavItem = ({ href, label, icon }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          active ? "bg-teal-600 text-white" : "text-gray-300 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className="w-5 h-5" dangerouslySetInnerHTML={{ __html: icon }} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <html lang="th">
      <head>
        <title>Balanz.IA</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Noto+Sans+Thai:wght@300;400;600;800&display=swap"
        />
      </head>
      <body style={{ fontFamily: "'Noto Sans Thai','Inter',sans-serif" }} className="bg-[var(--background)] text-[var(--text)]">
        {isAppPage && isLoggedIn ? (
          <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f1114] text-white flex flex-col p-5 gap-6">
              <div className="flex items-center">
                <img src="/logo.png" alt="Balanz.IA" className="app-logo select-none" />
              </div>
              <nav className="flex-1 space-y-1">
                <NavItem href="/dashboard" label="หน้าหลัก" icon='<svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l8 6v10a1 1 0 01-1 1h-5V12H8v7H3a1 1 0 01-1-1V8l8-6z"/></svg>' />
                <NavItem href="/transactions" label="บันทึกธุรกรรม" icon='<svg fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v4H4zM4 10h8v6H4zM14 10h2v6h-2z"/></svg>' />
                <NavItem href="/budget" label="เป้าหมาย" icon='<svg fill="currentColor" viewBox="0 0 20 20"><path d="M4 3h12v14H4zM7 6h6v8H7z"/></svg>' />
                <NavItem href="/currency" label="อัตราแลกเปลี่ยน" icon='<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.6A7.5 7.5 0 0120 12.8M20 20v-5h-.6A7.5 7.5 0 014 11.2"/></svg>' />
                <NavItem href="/tax" label="คำนวณภาษี" icon='<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>' />
                <NavItem href="/analytics" label="สรุป" icon='<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 11h3v6H3zm5-4h3v10H8zm5-3h3v13h-3z"/></svg>' />
              </nav>
              <div className="mt-auto space-y-3">
                <Link href="/notifications" className="flex items-center justify-between px-3 py-2 rounded-lg bg:white/0 text-gray-200 hover:text-white hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.6l-.7.7A1 1 0 004 14h12a1 1 0 00.7-1.7l-.7-.7V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                    การแจ้งเตือน
                  </span>
                  {notifications > 0 && <span className="text-xs bg-teal-600 rounded-full px-2 py-0.5">{notifications}</span>}
                </Link>
                <button onClick={logout} className="w-full px-3 py-2 rounded-lg bg-white/5 text-gray-200 hover:text-white">ออกจากระบบ</button>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 bg-gray-50 min-h-screen">
              <div className="h-14 flex items-center justify-end px-6 border-b bg-white">
                <Link href="/profile" className="text-gray-600 hover:text-teal-600 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z"/></svg>
                  โปรไฟล์
                </Link>
              </div>
              <main className="p-6">{children}</main>
            </div>
          </div>
        ) : (
          <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        )}
      </body>
    </html>
  );
}
