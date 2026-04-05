import Image from 'next/image';

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
}

const sizeMap = { sm: 32, md: 48, lg: 64, xl: 96 };
const classMap = { sm: 'w-8', md: 'w-12', lg: 'w-16', xl: 'w-24' };

export default function Avatar({ src, alt, size = 'md', isVerified }: AvatarProps) {
  const px = sizeMap[size];

  return (
    <div className="relative inline-block">
      <div className={`avatar ${src ? '' : 'placeholder'}`}>
        <div className={`${classMap[size]} rounded-full ring ring-base-300`}>
          {src ? (
            <Image src={src} alt={alt} width={px} height={px} className="rounded-full" />
          ) : (
            <span className="text-lg bg-primary text-primary-content">
              {alt.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
      {isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
          <svg className="w-3 h-3 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}
