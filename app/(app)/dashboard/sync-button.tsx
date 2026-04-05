'use client';

import { useState } from 'react';

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' });
      if (res.ok) {
        setResult('Sync completed! Refresh to see updated score.');
      } else {
        const data = await res.json();
        setResult(`Sync failed: ${data.error}`);
      }
    } catch {
      setResult('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="btn btn-primary btn-sm"
      >
        {syncing ? (
          <>
            <span className="loading loading-spinner loading-xs" />
            Syncing...
          </>
        ) : (
          'Sync Now'
        )}
      </button>
      {result && (
        <p className="text-sm mt-2 text-base-content/60">{result}</p>
      )}
    </div>
  );
}
