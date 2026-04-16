import { getInitials, getAvatarColor } from '@/lib/utils';

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
