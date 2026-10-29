import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#070B14] text-slate-100 p-4">
      <h2 className="text-2xl font-bold text-amber-400">Page Not Found</h2>
      <p className="text-slate-400 mt-2">The requested page does not exist.</p>
      <Link href="/" className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg">
        Return to Sheger Prime Concierge
      </Link>
    </div>
  );
}
