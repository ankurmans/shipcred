import Link from 'next/link';

export default function FeaturedProfiles() {
  // In production, this would fetch from DB where is_featured = true
  // For launch state, show placeholder cards
  return (
    <section className="py-20 px-4 bg-base-200">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center font-[family-name:var(--font-dm-sans)]">
          Builders who prove they ship
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card bg-base-100 border border-base-300 border-dashed">
              <div className="card-body items-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center text-2xl">
                  ?
                </div>
                <p className="text-sm text-base-content/50 mt-4">
                  Be one of the first builders to get verified.
                </p>
                <p className="text-xs text-base-content/40">
                  Early profiles get featured on the homepage.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/leaderboard" className="btn btn-ghost btn-sm">
            View Full Leaderboard →
          </Link>
        </div>
      </div>
    </section>
  );
}
