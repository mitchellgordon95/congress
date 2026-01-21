export const dynamic = 'force-dynamic'

export default function BillsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Bills</h1>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-[var(--muted)]">
          Track bills discussed on the floor and see related floor activity.
        </p>
      </div>
    </div>
  )
}
