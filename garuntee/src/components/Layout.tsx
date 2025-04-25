// components/Layout.tsx
'use client'

import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <header className="text-xl font-bold mb-4">📂 ระบบจัดการเอกสาร</header>
      <main>{children}</main>
    </div>
  )
}
