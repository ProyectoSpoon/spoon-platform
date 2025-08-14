import React from 'react';
import { cn } from '../../../lib/utils';

export interface AvatarV2Props extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string; // used for initials fallback
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const sizeMap: Record<NonNullable<AvatarV2Props['size']>, string> = {
  xs: 'h-6 w-6 text-[10px] gap-0',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const radiusMap: Record<NonNullable<AvatarV2Props['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const [a, b] = [parts[0]?.[0], parts[1]?.[0]];
  return (a || '') + (b || '');
}

export const AvatarV2: React.FC<AvatarV2Props> = ({ src, alt = '', name, size = 'md', rounded = 'full', className, ...rest }) => {
  const initials = getInitials(name).toUpperCase();
  return (
    <div
      className={cn('inline-flex items-center justify-center bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)] overflow-hidden select-none', sizeMap[size], radiusMap[rounded], className)}
      aria-label={alt || name}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt || name || ''} className="h-full w-full object-cover" />
      ) : initials ? (
        <span className="font-medium">{initials}</span>
      ) : (
        <span aria-hidden>•</span>
      )}
    </div>
  );
};

export default AvatarV2;
