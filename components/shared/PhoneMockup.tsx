interface PhoneMockupProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export default function PhoneMockup({ children, url = 'gtmcommit.com/sarahchen', className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* iPhone frame */}
      <div className="relative w-[336px] rounded-[42px] border-[8px] border-[#1A1A1A] bg-[#1A1A1A] shadow-[0_26px_80px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="w-[104px] h-[27px] bg-[#1A1A1A] rounded-b-[16px]" />
        </div>

        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-[13px] pb-1 bg-[#1A1A1A]">
          <span className="text-[10px] text-white/70 font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-[2px]">
            <div className="flex gap-[1px] items-end h-[9px]">
              <div className="w-[2.5px] h-[3px] bg-white/70 rounded-[0.5px]" />
              <div className="w-[2.5px] h-[5px] bg-white/70 rounded-[0.5px]" />
              <div className="w-[2.5px] h-[6.5px] bg-white/70 rounded-[0.5px]" />
              <div className="w-[2.5px] h-[9px] bg-white/70 rounded-[0.5px]" />
            </div>
            <span className="text-[9px] text-white/70 font-semibold ml-1">5G</span>
            <div className="w-[19px] h-[9px] border border-white/40 rounded-[2px] ml-1 relative">
              <div className="absolute inset-[1px] bg-white/70 rounded-[0.5px]" style={{ width: '60%' }} />
              <div className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1px] h-[3px] bg-white/40 rounded-r-full" />
            </div>
          </div>
        </div>

        {/* Safari URL bar */}
        <div className="px-3 pb-1.5 bg-[#1A1A1A]">
          <div className="flex items-center gap-1.5 bg-[#2A2A2A] rounded-[10px] px-3 py-[5px]">
            <svg className="w-[9px] h-[9px] text-white/30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="text-[10px] text-white/60 font-mono flex-1 transition-all duration-500 truncate">
              {url}
            </span>
            <svg className="w-[10px] h-[10px] text-white/20 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
        </div>

        {/* Content area */}
        <div className="h-[564px] overflow-hidden relative">
          {children}
        </div>

        {/* Bottom home indicator */}
        <div className="flex justify-center py-[5px] bg-[#1A1A1A]">
          <div className="w-[104px] h-[4px] bg-white/25 rounded-full" />
        </div>
      </div>
    </div>
  );
}
