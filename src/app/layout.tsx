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
          {/* Top Header */}
          <header className="border-b border-[var(--border)] px-4 py-3 bg-[var(--background)] sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto flex items-center justify-between">
              <a href="/" className="text-xl font-bold flex items-center gap-2">
                <span>&#127963;</span>
                Congress Chat
              </a>
              <div className="flex items-center gap-4">
                <button className="text-[var(--muted)] hover:text-[var(--foreground)]">
                  &#128276;
                </button>
                <button className="text-[var(--muted)] hover:text-[var(--foreground)]">
                  &#9881;
                </button>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-16">
            {children}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-[var(--background)] border-t border-[var(--border)] py-2 px-4 z-50">
            <div className="max-w-md mx-auto flex justify-around">
              <a href="/" className="flex flex-col items-center gap-1 text-[var(--foreground)]">
                <span>&#127968;</span>
                <span className="text-xs">Home</span>
              </a>
              <a href="/search" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)]">
                <span>&#128269;</span>
                <span className="text-xs">Search</span>
              </a>
              <a href="/members" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)]">
                <span>&#128100;</span>
                <span className="text-xs">Members</span>
              </a>
              <a href="/bills" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)]">
                <span>&#128203;</span>
                <span className="text-xs">Bills</span>
              </a>
            </div>
          </nav>
        </div>
      </body>
    </html>
  )
}
