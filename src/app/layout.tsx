import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Congress Chat',
  description: 'Congressional proceedings in group chat format',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-[var(--border)] px-4 py-3">
            <nav className="max-w-6xl mx-auto flex items-center justify-between">
              <a href="/" className="text-xl font-bold">
                Congress Chat
              </a>
              <div className="flex gap-6">
                <a href="/senate" className="hover:text-[var(--democrat)] transition-colors">
                  Senate
                </a>
                <a href="/house" className="hover:text-[var(--republican)] transition-colors">
                  House
                </a>
                <a href="/members" className="hover:text-[var(--muted)] transition-colors">
                  Members
                </a>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
