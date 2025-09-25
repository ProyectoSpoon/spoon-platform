"use client";

import React from 'react';
import TopBannerCajaComandas from './components/TopBannerCajaComandas';

export default function ComandasMobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[color:var(--sp-neutral-50)]">
      <div className="max-w-3xl mx-auto p-4">
        <TopBannerCajaComandas />
      </div>
      {children}
    </div>
  );
}
