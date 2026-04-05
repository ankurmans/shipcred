import type { VideoProof } from '@/types';

interface Props {
  videos: VideoProof[];
}

export default function VideoProofs({ videos }: Props) {
  if (!videos.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Video Proof</h3>
      <div className="space-y-3">
        {videos.map(video => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 bg-surface-secondary rounded-card p-3 hover:bg-surface-muted transition-colors"
          >
            {video.thumbnail_url && (
              <img src={video.thumbnail_url} alt="" className="w-20 h-14 rounded object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold truncate">{video.title || 'Untitled Video'}</span>
                {video.url_verified && (
                  <span className="badge bg-green-100 text-green-700 text-[10px]">Verified</span>
                )}
              </div>
              <p className="text-xs text-fg-muted mt-0.5">
                {video.platform}
                {video.duration_seconds && ` · ${Math.round(video.duration_seconds / 60)}min`}
                {video.category && ` · ${video.category.replace(/_/g, ' ')}`}
              </p>
              {video.tools_mentioned.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {video.tools_mentioned.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-surface-muted text-fg-muted">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
