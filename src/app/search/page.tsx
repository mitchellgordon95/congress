export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search transcripts, members, bills..."
          className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--democrat)]"
          disabled
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-[var(--muted)]">
          Search across floor transcripts, member speeches, and bills.
        </p>
      </div>
    </div>
  )
}
