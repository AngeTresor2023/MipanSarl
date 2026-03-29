// components/admin/AdminHeader.tsx
"use client";

import React from "react";

export default function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/60 mt-1">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
