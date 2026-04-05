import Link from 'next/link';

export const metadata = {
  title: 'Log in',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl font-bold font-[family-name:var(--font-dm-sans)]">
            Get Your ShipCred
          </h1>
          <p className="text-base-content/60 mt-2">
            Connect your GitHub to verify what you&apos;ve shipped.
          </p>

          {searchParams.error && (
            <div className="alert alert-error mt-4">
              <span>
                {searchParams.error === 'invalid_state'
                  ? 'Invalid OAuth state. Please try again.'
                  : 'Authentication failed. Please try again.'}
              </span>
            </div>
          )}

          <a
            href="/api/auth/github"
            className="btn btn-neutral btn-lg gap-2 mt-6 w-full"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-current"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>

          <p className="text-xs text-base-content/40 mt-4">
            We scan commits for AI tool signatures. We never store source code.
          </p>

          <div className="divider text-xs text-base-content/40">WHY GITHUB?</div>

          <p className="text-sm text-base-content/60">
            ShipCred verifies your AI tool usage directly from your commit
            history. GitHub is how we prove you ship — not just talk.
          </p>

          <Link href="/" className="link link-primary mt-4 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
